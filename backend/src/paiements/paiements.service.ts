import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paiement } from './entities/paiement.entity';
import { CreatePaiementDto } from './dto/create-paiement.dto';
import { UpdatePaiementDto } from './dto/update-paiement.dto';

@Injectable()
export class PaiementsService {
  constructor(
    @InjectRepository(Paiement) private readonly repo: Repository<Paiement>,
  ) {}

  create(dto: CreatePaiementDto): Promise<Paiement> {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(): Promise<Paiement[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Paiement> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: { contrat: true },
    });
    if (!entity) throw new NotFoundException(`Paiement ${id} not found`);
    return entity;
  }

  async update(id: string, dto: UpdatePaiementDto): Promise<Paiement> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException(`Paiement ${id} not found`);
  }
}
