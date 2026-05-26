import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { FreelanceProfile } from '../users/entities/freelance-profile.entity';
import { Mission } from '../missions/entities/mission.entity';
import {
  ClientProfileSummary,
  CompetenceSummary,
  FreelanceCompetenceSummary,
  FreelanceProfileFilterInput,
  FreelanceProfileSearchItem,
  FreelanceProfileSortField,
  FreelanceProfileSortInput,
  MissionFilterInput,
  MissionSearchItem,
  MissionSortField,
  MissionSortInput,
  PaginatedFreelanceProfileResult,
  PaginatedMissionResult,
  PaginationInput,
  UserSummary,
} from './graphql.types';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(FreelanceProfile)
    private readonly freelanceProfileRepo: Repository<FreelanceProfile>,
    @InjectRepository(Mission)
    private readonly missionRepo: Repository<Mission>,
  ) {}

  async searchFreelanceProfiles(
    filter?: FreelanceProfileFilterInput,
    pagination?: PaginationInput,
    sort?: FreelanceProfileSortInput,
  ): Promise<PaginatedFreelanceProfileResult> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;

    const qb = this.freelanceProfileRepo
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('profile.competences', 'profileCompetence')
      .leftJoinAndSelect('profileCompetence.competence', 'competence')
      .distinct(true);

    this.applyFreelanceProfileFilters(qb, filter);
    this.applyFreelanceProfileSort(qb, sort);

    qb.skip((page - 1) * limit).take(limit);

    const [profiles, totalCount] = await qb.getManyAndCount();

    return this.buildPaginatedResult(
      profiles.map((profile) => this.mapFreelanceProfile(profile)),
      totalCount,
      page,
      limit,
    );
  }

  async searchMissions(
    filter?: MissionFilterInput,
    pagination?: PaginationInput,
    sort?: MissionSortInput,
  ): Promise<PaginatedMissionResult> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;

    const qb = this.missionRepo
      .createQueryBuilder('mission')
      .leftJoinAndSelect('mission.client', 'client')
      .leftJoinAndSelect('client.user', 'clientUser')
      .distinct(true);

    this.applyMissionFilters(qb, filter);
    this.applyMissionSort(qb, sort);

    qb.skip((page - 1) * limit).take(limit);

    const [missions, totalCount] = await qb.getManyAndCount();

    return this.buildPaginatedResult(
      missions.map((mission) => this.mapMission(mission)),
      totalCount,
      page,
      limit,
    );
  }

  private applyFreelanceProfileFilters(
    qb: SelectQueryBuilder<FreelanceProfile>,
    filter?: FreelanceProfileFilterInput,
  ): void {
    if (!filter) {
      return;
    }

    if (filter.disponible !== undefined) {
      qb.andWhere('profile.disponible = :disponible', {
        disponible: filter.disponible,
      });
    }

    if (filter.tarifJournalierMin !== undefined) {
      qb.andWhere('profile.tarifJournalier >= :tarifJournalierMin', {
        tarifJournalierMin: filter.tarifJournalierMin,
      });
    }

    if (filter.tarifJournalierMax !== undefined) {
      qb.andWhere('profile.tarifJournalier <= :tarifJournalierMax', {
        tarifJournalierMax: filter.tarifJournalierMax,
      });
    }

    if (filter.ratingMin !== undefined) {
      qb.andWhere('profile.rating >= :ratingMin', {
        ratingMin: filter.ratingMin,
      });
    }

    if (filter.keyword?.trim()) {
      const keyword = `%${filter.keyword.trim().toLowerCase()}%`;
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('LOWER(user.nom) LIKE :keyword', { keyword })
            .orWhere("LOWER(COALESCE(user.bio, '')) LIKE :keyword", {
              keyword,
            });
        }),
      );
    }

    if (filter.competenceIds?.length) {
      qb.andWhere('competence.id IN (:...competenceIds)', {
        competenceIds: filter.competenceIds,
      });
    }

    if (filter.competenceNames?.length) {
      qb.andWhere('LOWER(competence.nom) IN (:...competenceNames)', {
        competenceNames: filter.competenceNames.map((name) =>
          name.trim().toLowerCase(),
        ),
      });
    }

    if (filter.niveaux?.length) {
      qb.andWhere('profileCompetence.niveau IN (:...niveaux)', {
        niveaux: filter.niveaux,
      });
    }
  }

  private applyFreelanceProfileSort(
    qb: SelectQueryBuilder<FreelanceProfile>,
    sort?: FreelanceProfileSortInput,
  ): void {
    const field = sort?.field ?? FreelanceProfileSortField.RATING;
    const direction = sort?.direction ?? 'DESC';

    const columnMap: Record<FreelanceProfileSortField, string> = {
      [FreelanceProfileSortField.NOM]: 'user.nom',
      [FreelanceProfileSortField.RATING]: 'profile.rating',
      [FreelanceProfileSortField.TARIF_JOURNALIER]: 'profile.tarifJournalier',
    };

    qb.orderBy(columnMap[field], direction).addOrderBy('profile.id', 'ASC');
  }

  private applyMissionFilters(
    qb: SelectQueryBuilder<Mission>,
    filter?: MissionFilterInput,
  ): void {
    if (!filter) {
      return;
    }

    if (filter.keyword?.trim()) {
      const keyword = `%${filter.keyword.trim().toLowerCase()}%`;
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('LOWER(mission.titre) LIKE :keyword', { keyword })
            .orWhere('LOWER(mission.description) LIKE :keyword', { keyword })
            .orWhere("LOWER(COALESCE(client.entreprise, '')) LIKE :keyword", {
              keyword,
            });
        }),
      );
    }

    if (filter.statuts?.length) {
      qb.andWhere('mission.statut IN (:...statuts)', {
        statuts: filter.statuts,
      });
    }

    if (filter.clientId) {
      qb.andWhere('mission.clientId = :clientId', { clientId: filter.clientId });
    }

    if (filter.budgetMin !== undefined) {
      qb.andWhere('mission.budget >= :budgetMin', {
        budgetMin: filter.budgetMin,
      });
    }

    if (filter.budgetMax !== undefined) {
      qb.andWhere('mission.budget <= :budgetMax', {
        budgetMax: filter.budgetMax,
      });
    }

    if (filter.deadlineFrom) {
      qb.andWhere('mission.deadline >= :deadlineFrom', {
        deadlineFrom: filter.deadlineFrom,
      });
    }

    if (filter.deadlineTo) {
      qb.andWhere('mission.deadline <= :deadlineTo', {
        deadlineTo: filter.deadlineTo,
      });
    }

    if (filter.competences?.length) {
      qb.andWhere(
        new Brackets((subQb) => {
          filter.competences?.forEach((competence, index) => {
            subQb.orWhere(
              `LOWER(COALESCE(mission.competencesRequises, '')) LIKE :competence${index}`,
              {
                [`competence${index}`]: `%${competence.trim().toLowerCase()}%`,
              },
            );
          });
        }),
      );
    }
  }

  private applyMissionSort(
    qb: SelectQueryBuilder<Mission>,
    sort?: MissionSortInput,
  ): void {
    const field = sort?.field ?? MissionSortField.DATE_CREATION;
    const direction = sort?.direction ?? 'DESC';

    const columnMap: Record<MissionSortField, string> = {
      [MissionSortField.TITRE]: 'mission.titre',
      [MissionSortField.BUDGET]: 'mission.budget',
      [MissionSortField.DEADLINE]: 'mission.deadline',
      [MissionSortField.DATE_CREATION]: 'mission.dateCreation',
    };

    qb.orderBy(columnMap[field], direction).addOrderBy('mission.id', 'ASC');
  }

  private mapFreelanceProfile(
    profile: FreelanceProfile,
  ): FreelanceProfileSearchItem {
    return {
      id: profile.id,
      userId: profile.userId,
      tarifJournalier: this.toNullableNumber(profile.tarifJournalier),
      disponible: profile.disponible,
      rating: this.toNumber(profile.rating),
      user: this.mapUser(profile.user),
      competences:
        profile.competences?.map((competence) =>
          this.mapFreelanceCompetence(competence),
        ) ?? [],
    };
  }

  private mapMission(mission: Mission): MissionSearchItem {
    return {
      id: mission.id,
      clientId: mission.clientId,
      titre: mission.titre,
      description: mission.description,
      budget: this.toNumber(mission.budget),
      deadline: mission.deadline ?? null,
      statut: mission.statut,
      competencesRequises: mission.competencesRequises ?? [],
      dateCreation: mission.dateCreation,
      client: mission.client
        ? {
            id: mission.client.id,
            userId: mission.client.userId,
            entreprise: mission.client.entreprise,
            siteWeb: mission.client.siteWeb,
            user: mission.client.user ? this.mapUser(mission.client.user) : null,
          }
        : null,
    };
  }

  private mapUser(user: FreelanceProfile['user']): UserSummary {
    return {
      id: user.id,
      nom: user.nom,
      role: user.role,
      photo: user.photo ?? null,
      bio: user.bio ?? null,
    };
  }

  private mapFreelanceCompetence(
    competence: FreelanceProfile['competences'][number],
  ): FreelanceCompetenceSummary {
    return {
      id: competence.id,
      niveau: competence.niveau,
      competence: {
        id: competence.competence.id,
        nom: competence.competence.nom,
        categorie: competence.competence.categorie ?? null,
      } satisfies CompetenceSummary,
    };
  }

  private buildPaginatedResult<T>(
    items: T[],
    totalCount: number,
    page: number,
    limit: number,
  ) {
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    return {
      items,
      totalCount,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
    };
  }

  private toNumber(value: number | string): number {
    return typeof value === 'number' ? value : Number(value);
  }

  private toNullableNumber(value: number | string | null | undefined) {
    if (value === null || value === undefined) {
      return null;
    }

    return this.toNumber(value);
  }
}
