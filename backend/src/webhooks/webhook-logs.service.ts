import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookLog } from './entities/webhook-log.entity';
import { CreateWebhookLogDto } from './dto/create-webhook-log.dto';
import { UpdateWebhookLogDto } from './dto/update-webhook-log.dto';

@Injectable()
export class WebhookLogsService {
  constructor(
    @InjectRepository(WebhookLog)
    private readonly repo: Repository<WebhookLog>,
  ) {}

  create(dto: CreateWebhookLogDto): Promise<WebhookLog> {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(): Promise<WebhookLog[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<WebhookLog> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`WebhookLog ${id} not found`);
    return entity;
  }

  async update(id: string, dto: UpdateWebhookLogDto): Promise<WebhookLog> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected)
      throw new NotFoundException(`WebhookLog ${id} not found`);
  }
}
