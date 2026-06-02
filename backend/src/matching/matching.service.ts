import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Mission, MissionStatut } from '../missions/entities/mission.entity';
import { FreelanceProfile } from '../users/entities/freelance-profile.entity';
import { Resume, ResumeStatus } from '../resumes/entities/resume.entity';
import { MatchedFreelance, MatchedMission } from './dto/match-result.dto';
import { QdrantService, QdrantHit } from './qdrant.service';
import {
  MISSION_COLLECTION,
  RESUME_COLLECTION,
  SEARCH_LIMIT,
} from './qdrant.constants';
import {
  freelanceSkills,
  hybridScore,
  missionSkills,
  normalizeSkills,
  profileCompetenceSkills,
  skillJaccard,
} from './matching.text';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    @InjectRepository(Mission)
    private readonly missionRepo: Repository<Mission>,
    @InjectRepository(FreelanceProfile)
    private readonly profileRepo: Repository<FreelanceProfile>,
    @InjectRepository(Resume)
    private readonly resumeRepo: Repository<Resume>,
    private readonly qdrant: QdrantService,
  ) {}

  /** Direction 1: a freelancer's latest READY resume → ranked active missions. */
  async recommendMissionsForFreelance(
    userId: string,
  ): Promise<MatchedMission[]> {
    const profile = await this.profileRepo.findOne({
      where: { userId },
      relations: { competences: { competence: true } },
    });
    if (!profile) {
      throw new NotFoundException('Freelance profile not found');
    }

    const anyResume = await this.resumeRepo.findOne({
      where: { freelanceProfileId: profile.id },
    });
    if (!anyResume) {
      throw new ConflictException(
        'Upload a resume to get personalised mission recommendations',
      );
    }

    const resume = await this.resumeRepo.findOne({
      where: { freelanceProfileId: profile.id, status: ResumeStatus.READY },
      order: { createdAt: 'DESC' },
    });
    if (!resume) {
      // A resume exists but isn't processed yet (or extraction failed).
      return [];
    }

    const vector = await this.getVector(RESUME_COLLECTION, resume.id);
    if (!vector) return [];

    // Score against both skill sources: form competences ∪ parsed resume skills.
    const mySkills = freelanceSkills(profile, resume.extracted);
    const hits = await this.search(MISSION_COLLECTION, vector, {
      must: [{ key: 'statut', match: { value: MissionStatut.ACTIVE } }],
    });
    if (hits.length === 0) return [];

    const missions = await this.missionRepo.find({
      where: { id: In(hits.map((hit) => String(hit.id))) },
      relations: { client: { user: true } },
    });
    const byId = new Map(missions.map((mission) => [mission.id, mission]));

    return hits
      .map((hit) => {
        const mission = byId.get(String(hit.id));
        if (!mission) return null;
        const skills = missionSkills(mission);
        const overlap = skillJaccard(mySkills, skills);
        const score = hybridScore(hit.score ?? 0, mySkills, skills);
        return this.mapMission(mission, score, overlap, mySkills);
      })
      .filter((item): item is MatchedMission => item !== null)
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  /** Direction 2: a mission (owned by the caller) → ranked available freelancers. */
  async matchFreelancesForMission(
    missionId: string,
    userId: string,
  ): Promise<MatchedFreelance[]> {
    const mission = await this.missionRepo.findOne({
      where: { id: missionId },
      relations: { client: true },
    });
    if (!mission) {
      throw new NotFoundException(`Mission ${missionId} not found`);
    }
    if (mission.client?.userId !== userId) {
      throw new ForbiddenException(
        'Not allowed to view matches for this mission',
      );
    }

    const vector = await this.getVector(MISSION_COLLECTION, mission.id);
    if (!vector) return [];

    const wantedSkills = missionSkills(mission);
    const hits = await this.search(RESUME_COLLECTION, vector);
    if (hits.length === 0) return [];

    // A freelancer may have several resumes; keep the one with the best vector
    // similarity. Form competences are folded in per-profile below, so the
    // final score reflects both skill sources.
    const best = new Map<string, { cosine: number; resumeSkills: string[] }>();
    for (const hit of hits) {
      const profileId = hit.payload?.freelanceProfileId;
      if (typeof profileId !== 'string') continue;
      const cosine = hit.score ?? 0;
      const previous = best.get(profileId);
      if (!previous || cosine > previous.cosine) {
        const skills = normalizeSkills(
          Array.isArray(hit.payload?.skills)
            ? (hit.payload.skills as string[])
            : [],
        );
        best.set(profileId, { cosine, resumeSkills: skills });
      }
    }
    if (best.size === 0) return [];

    const profiles = await this.profileRepo.find({
      where: { id: In([...best.keys()]), disponible: true },
      relations: { user: true, competences: { competence: true } },
    });

    return profiles
      .map((profile) => {
        const entry = best.get(profile.id) ?? { cosine: 0, resumeSkills: [] };
        // Effective skills = form competences ∪ parsed resume skills.
        const theirSkills = normalizeSkills([
          ...profileCompetenceSkills(profile),
          ...entry.resumeSkills,
        ]);
        const overlap = skillJaccard(wantedSkills, theirSkills);
        const score = hybridScore(entry.cosine, wantedSkills, theirSkills);
        // Display keeps resume-only skills; form skills already ride in
        // `competences` on the response (avoids double-listing in the UI).
        return this.mapFreelance(profile, score, overlap, entry.resumeSkills);
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  private async getVector(
    collection: string,
    id: string,
  ): Promise<number[] | null> {
    try {
      return await this.qdrant.retrieveVector(collection, id);
    } catch (err) {
      this.logger.error(
        `Qdrant retrieve failed (${collection}/${id})`,
        err instanceof Error ? err.stack : undefined,
      );
      throw new ServiceUnavailableException(
        'Matching service is temporarily unavailable',
      );
    }
  }

  private async search(
    collection: string,
    vector: number[],
    filter?: Record<string, unknown>,
  ): Promise<QdrantHit[]> {
    try {
      return await this.qdrant.search(collection, vector, {
        limit: SEARCH_LIMIT,
        filter,
      });
    } catch (err) {
      this.logger.error(
        `Qdrant search failed (${collection})`,
        err instanceof Error ? err.stack : undefined,
      );
      throw new ServiceUnavailableException(
        'Matching service is temporarily unavailable',
      );
    }
  }

  private mapMission(
    mission: Mission,
    matchScore: number,
    skillOverlap: number,
    freelanceSkillList: string[] = [],
  ): MatchedMission {
    return {
      id: mission.id,
      clientId: mission.clientId,
      titre: mission.titre,
      description: mission.description,
      budget: Number(mission.budget),
      deadline: mission.deadline ?? null,
      statut: mission.statut,
      competencesRequises: mission.competencesRequises ?? [],
      requiredSkills: mission.requiredSkills ?? [],
      experienceLevel: mission.experienceLevel ?? null,
      dateCreation: mission.dateCreation,
      client: mission.client
        ? {
            id: mission.client.id,
            entreprise: mission.client.entreprise ?? null,
            user: mission.client.user
              ? {
                  id: mission.client.user.id,
                  nom: mission.client.user.nom,
                  photo: mission.client.user.photo ?? null,
                }
              : null,
          }
        : null,
      matchScore,
      skillOverlap,
      freelanceSkills: freelanceSkillList,
    };
  }

  private mapFreelance(
    profile: FreelanceProfile,
    matchScore: number,
    skillOverlap: number,
    resumeSkillList: string[],
  ): MatchedFreelance {
    return {
      id: profile.id,
      userId: profile.userId,
      tarifJournalier:
        profile.tarifJournalier === null ||
        profile.tarifJournalier === undefined
          ? null
          : Number(profile.tarifJournalier),
      disponible: profile.disponible,
      rating: Number(profile.rating ?? 0),
      user: {
        id: profile.user.id,
        nom: profile.user.nom,
        photo: profile.user.photo ?? null,
        bio: profile.user.bio ?? null,
      },
      competences: (profile.competences ?? []).map((fc) => ({
        niveau: fc.niveau,
        competence: { id: fc.competence.id, nom: fc.competence.nom },
      })),
      resumeSkills: resumeSkillList,
      matchScore,
      skillOverlap,
    };
  }
}
