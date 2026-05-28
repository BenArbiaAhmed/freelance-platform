import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private readonly repo: Repository<Message>,
  ) {}

  create(dto: CreateMessageDto): Promise<Message> {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(filters?: { contratId?: string }): Promise<Message[]> {
    if (!filters?.contratId) return this.repo.find();
    return this.repo.find({ where: { contratId: filters.contratId } });
  }

  async findOne(id: string): Promise<Message> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Message ${id} not found`);
    return entity;
  }

  async update(id: string, dto: UpdateMessageDto): Promise<Message> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException(`Message ${id} not found`);
  }
}
