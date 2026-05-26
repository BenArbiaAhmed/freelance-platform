import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contrat } from './entities/contrat.entity';
import { CreateContratDto } from './dto/create-contrat.dto';
import { UpdateContratDto } from './dto/update-contrat.dto';

@Injectable()
export class ContratsService {
  constructor(
    @InjectRepository(Contrat) private readonly repo: Repository<Contrat>,
  ) {}

  create(dto: CreateContratDto): Promise<Contrat> {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(): Promise<Contrat[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Contrat> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: {
        mission: true,
        client: true,
        freelance: true,
        livrables: true,
        paiements: true,
      },
    });
    if (!entity) throw new NotFoundException(`Contrat ${id} not found`);
    return entity;
  }

  async update(id: string, dto: UpdateContratDto): Promise<Contrat> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException(`Contrat ${id} not found`);
  }
}
