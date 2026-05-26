import { Injectable, NotFoundException, MessageEvent } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, Subject } from 'rxjs';
import { Repository } from 'typeorm';
import { Candidature, CandidatureStatut } from './entities/candidature.entity';
import { CreateCandidatureDto } from './dto/create-candidature.dto';
import { UpdateCandidatureDto } from './dto/update-candidature.dto';

@Injectable()
export class CandidaturesService {
  private readonly statusEvents = new Subject<MessageEvent>();

  constructor(
    @InjectRepository(Candidature)
    private readonly repo: Repository<Candidature>,
  ) {}

  observeStatusChanges(): Observable<MessageEvent> {
    return this.statusEvents.asObservable();
  }

  create(dto: CreateCandidatureDto): Promise<Candidature> {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(): Promise<Candidature[]> {
    return this.repo.find();
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

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected)
      throw new NotFoundException(`Candidature ${id} not found`);
  }
}
