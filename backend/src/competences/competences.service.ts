import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Competence } from './entities/competence.entity';
import { CreateCompetenceDto } from './dto/create-competence.dto';
import { UpdateCompetenceDto } from './dto/update-competence.dto';

@Injectable()
export class CompetencesService {
  constructor(
    @InjectRepository(Competence)
    private readonly repo: Repository<Competence>,
  ) {}

  create(dto: CreateCompetenceDto): Promise<Competence> {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(): Promise<Competence[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Competence> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Competence ${id} not found`);
    return entity;
  }

  async update(id: string, dto: UpdateCompetenceDto): Promise<Competence> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected)
      throw new NotFoundException(`Competence ${id} not found`);
  }
}
