import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FreelanceCompetence } from './entities/freelance-competence.entity';
import { CreateFreelanceCompetenceDto } from './dto/create-freelance-competence.dto';
import { UpdateFreelanceCompetenceDto } from './dto/update-freelance-competence.dto';

@Injectable()
export class FreelanceCompetencesService {
  constructor(
    @InjectRepository(FreelanceCompetence)
    private readonly repo: Repository<FreelanceCompetence>,
  ) {}

  create(dto: CreateFreelanceCompetenceDto): Promise<FreelanceCompetence> {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(): Promise<FreelanceCompetence[]> {
    return this.repo.find({ relations: { competence: true } });
  }

  async findOne(id: string): Promise<FreelanceCompetence> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: { competence: true, freelanceProfile: true },
    });
    if (!entity)
      throw new NotFoundException(`FreelanceCompetence ${id} not found`);
    return entity;
  }

  async update(
    id: string,
    dto: UpdateFreelanceCompetenceDto,
  ): Promise<FreelanceCompetence> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected)
      throw new NotFoundException(`FreelanceCompetence ${id} not found`);
  }
}
