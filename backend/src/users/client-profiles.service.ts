import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProfile } from './entities/client-profile.entity';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';

@Injectable()
export class ClientProfilesService {
  constructor(
    @InjectRepository(ClientProfile)
    private readonly repo: Repository<ClientProfile>,
  ) {}

  create(dto: CreateClientProfileDto): Promise<ClientProfile> {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(): Promise<ClientProfile[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<ClientProfile> {
    const profile = await this.repo.findOne({
      where: { id },
      relations: { user: true, missions: true },
    });
    if (!profile) throw new NotFoundException(`ClientProfile ${id} not found`);
    return profile;
  }

  async update(
    id: string,
    dto: UpdateClientProfileDto,
  ): Promise<ClientProfile> {
    const profile = await this.findOne(id);
    Object.assign(profile, dto);
    return this.repo.save(profile);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected)
      throw new NotFoundException(`ClientProfile ${id} not found`);
  }
}
