import { Injectable, NotFoundException, MessageEvent } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, Subject } from 'rxjs';
import { Repository } from 'typeorm';
import { Candidature, CandidatureStatut } from './entities/candidature.entity';
import { Contrat, ContratStatut } from '../contrats/entities/contrat.entity';
import { CreateCandidatureDto } from './dto/create-candidature.dto';
import { UpdateCandidatureDto } from './dto/update-candidature.dto';

@Injectable()
export class CandidaturesService {
  private readonly statusEvents = new Subject<MessageEvent>();

  constructor(
    @InjectRepository(Candidature)
    private readonly repo: Repository<Candidature>,
    @InjectRepository(Contrat)
    private readonly contratRepo: Repository<Contrat>,
  ) {}

  observeStatusChanges(): Observable<MessageEvent> {
    return this.statusEvents.asObservable();
  }

  create(dto: CreateCandidatureDto): Promise<Candidature> {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(filters?: { freelanceId?: string; clientId?: string }): Promise<Candidature[]> {
    const qb = this.repo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.mission', 'mission')
      .leftJoinAndSelect('c.freelance', 'freelance')
      .leftJoinAndSelect('freelance.user', 'user')
      .leftJoinAndSelect('freelance.competences', 'freelanceCompetences')
      .leftJoinAndSelect('freelanceCompetences.competence', 'competence');

    if (filters?.freelanceId) {
      qb.andWhere('c.freelanceId = :freelanceId', { freelanceId: filters.freelanceId });
    }

    if (filters?.clientId) {
      qb.andWhere('mission.clientId = :clientId', { clientId: filters.clientId });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Candidature> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: { mission: true, freelance: true, contrat: true },
    });
    if (!entity) throw new NotFoundException(`Candidature ${id} not found`);
    return entity;
  }

  async update(id: string, dto: UpdateCandidatureDto): Promise<Candidature> {
    const entity = await this.findOne(id);
    const previousStatus = entity.statut;
    Object.assign(entity, dto);
    const saved = await this.repo.save(entity);

    if (
      dto.statut &&
      dto.statut !== previousStatus &&
      (dto.statut === CandidatureStatut.PENDING ||
        dto.statut === CandidatureStatut.ACCEPTED ||
        dto.statut === CandidatureStatut.REJECTED)
    ) {
      this.statusEvents.next({
        type: 'candidature-status',
        data: {
          id: saved.id,
          missionId: saved.missionId,
          freelanceId: saved.freelanceId,
          newStatus: saved.statut,
          changedAt: new Date().toISOString(),
        },
      });
    }

    return saved;
  }

  async accept(id: string): Promise<Candidature> {
    const updated = await this.update(id, { statut: CandidatureStatut.ACCEPTED });

    const existing = await this.contratRepo.findOne({ where: { candidatureId: updated.id } });
    if (existing) return updated;

    const full = await this.repo.findOne({ where: { id: updated.id }, relations: { mission: true } });
    const clientId = full?.mission?.clientId;
    if (!clientId) return updated;

    await this.contratRepo.save(
      this.contratRepo.create({
        missionId: updated.missionId,
        clientId,
        freelanceId: updated.freelanceId,
        candidatureId: updated.id,
        montant: Number(updated.tarifPropose),
        statut: ContratStatut.DRAFT,
        signéParClient: false,
        signéParFreelance: false,
      }),
    );

    return updated;
  }

  reject(id: string): Promise<Candidature> {
    return this.update(id, { statut: CandidatureStatut.REJECTED });
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected)
      throw new NotFoundException(`Candidature ${id} not found`);
  }
}
