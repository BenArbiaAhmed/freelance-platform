import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Mission } from './entities/mission.entity';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { MissionEmbeddingService } from './mission-embedding.service';
import { MissionMatchService } from './mission-match.service';
import { WebhookDispatchService } from '../webhooks/webhook-dispatch.service';
import { FreelanceProfile } from '../users/entities/freelance-profile.entity';

@Injectable()
export class MissionsService {
  constructor(
    @InjectRepository(Mission) private readonly repo: Repository<Mission>,
    private readonly embeddingService: MissionEmbeddingService,
    private readonly matchService: MissionMatchService,
    private readonly webhookDispatch: WebhookDispatchService,
    @InjectRepository(FreelanceProfile)
    private readonly profileRepo: Repository<FreelanceProfile>,
  ) {}

  async create(dto: CreateMissionDto): Promise<Mission> {
    const saved = await this.repo.save(this.repo.create(dto));

    void this.embeddingService.embedMission(saved);
    void this.notifyMatches(saved);
    return saved;
  }

  private async notifyMatches(mission: Mission): Promise<void> {
    const matches = await this.matchService.matchMission(mission);
    if (matches.length === 0) return;

    const profileIds = Array.from(
      new Set(matches.map((match) => match.freelanceProfileId)),
    );
    const profiles = await this.profileRepo.find({
      where: { id: In(profileIds) },
    });
    const userByProfile = new Map(
      profiles.map((profile) => [profile.id, profile.userId]),
    );

    await Promise.all(
      matches.map((match) => {
        const userId = userByProfile.get(match.freelanceProfileId);
        if (!userId) return Promise.resolve();
        return this.webhookDispatch.dispatchToUser(userId, 'mission.match', {
          missionId: mission.id,
          titre: mission.titre,
          description: mission.description,
          budget: mission.budget,
          competencesRequises: mission.competencesRequises ?? [],
          score: match.score,
          resumeId: match.resumeId,
          freelanceProfileId: match.freelanceProfileId,
        });
      }),
    );
  }

  findAll(): Promise<Mission[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Mission> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: { client: true, candidatures: true },
    });
    if (!entity) throw new NotFoundException(`Mission ${id} not found`);
    return entity;
  }

  async update(id: string, dto: UpdateMissionDto): Promise<Mission> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    const saved = await this.repo.save(entity);
    // Re-embed so the vector + payload (statut, skills…) stay in sync.
    void this.embeddingService.embedMission(saved);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected)
      throw new NotFoundException(`Mission ${id} not found`);
    void this.embeddingService.deleteMission(id);
  }
}
