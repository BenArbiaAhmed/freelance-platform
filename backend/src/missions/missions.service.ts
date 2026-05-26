import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mission } from './entities/mission.entity';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';

@Injectable()
export class MissionsService {
  constructor(
    @InjectRepository(Mission) private readonly repo: Repository<Mission>,
  ) {}

  create(dto: CreateMissionDto): Promise<Mission> {
    return this.repo.save(this.repo.create(dto));
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
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException(`Mission ${id} not found`);
  }
}
