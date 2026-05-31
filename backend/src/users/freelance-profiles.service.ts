import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FreelanceProfile } from './entities/freelance-profile.entity';
import { CreateFreelanceProfileDto } from './dto/create-freelance-profile.dto';
import { UpdateFreelanceProfileDto } from './dto/update-freelance-profile.dto';

@Injectable()
export class FreelanceProfilesService {
  constructor(
    @InjectRepository(FreelanceProfile)
    private readonly repo: Repository<FreelanceProfile>,
  ) {}

  create(dto: CreateFreelanceProfileDto): Promise<FreelanceProfile> {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(): Promise<FreelanceProfile[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<FreelanceProfile> {
    const profile = await this.repo.findOne({
      where: { id },
      relations: { user: true, competences: true, resumes: true },
    });
    if (!profile)
      throw new NotFoundException(`FreelanceProfile ${id} not found`);
    return profile;
  }

  async update(
    id: string,
    dto: UpdateFreelanceProfileDto,
  ): Promise<FreelanceProfile> {
    const profile = await this.findOne(id);
    Object.assign(profile, dto);
    return this.repo.save(profile);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected)
      throw new NotFoundException(`FreelanceProfile ${id} not found`);
  }
}
