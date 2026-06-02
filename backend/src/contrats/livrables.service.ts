import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Livrable } from './entities/livrable.entity';
import { UpdateLivrableDto } from './dto/update-livrable.dto';

interface CreateLivrableInput {
  contratId: string;
  titre: string;
  url: string;
  fileName: string;
}

@Injectable()
export class LivrablesService {
  constructor(
    @InjectRepository(Livrable) private readonly repo: Repository<Livrable>,
  ) {}

  create(input: CreateLivrableInput): Promise<Livrable> {
    return this.repo.save(this.repo.create(input));
  }

  findAll(contratId?: string): Promise<Livrable[]> {
    return this.repo.find({
      where: contratId ? { contratId } : {},
      order: { dateDepot: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Livrable> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Livrable ${id} not found`);
    return entity;
  }

  async update(id: string, dto: UpdateLivrableDto): Promise<Livrable> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException(`Livrable ${id} not found`);
  }
}
