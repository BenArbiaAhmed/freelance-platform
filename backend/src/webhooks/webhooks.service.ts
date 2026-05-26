import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook } from './entities/webhook.entity';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(Webhook) private readonly repo: Repository<Webhook>,
  ) {}

  create(dto: CreateWebhookDto): Promise<Webhook> {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(): Promise<Webhook[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Webhook> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: { logs: true },
    });
    if (!entity) throw new NotFoundException(`Webhook ${id} not found`);
    return entity;
  }

  async update(id: string, dto: UpdateWebhookDto): Promise<Webhook> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException(`Webhook ${id} not found`);
  }
}
