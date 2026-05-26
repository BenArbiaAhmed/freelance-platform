import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidature } from './entities/candidature.entity';
import { CreateCandidatureDto } from './dto/create-candidature.dto';
import { UpdateCandidatureDto } from './dto/update-candidature.dto';

@Injectable()
export class CandidaturesService {
  constructor(
    @InjectRepository(Candidature)
    private readonly repo: Repository<Candidature>,
  ) {}

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
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected)
      throw new NotFoundException(`Candidature ${id} not found`);
  }
}
