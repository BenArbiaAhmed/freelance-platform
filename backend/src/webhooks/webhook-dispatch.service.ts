import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook } from './entities/webhook.entity';
import { WebhookLogsService } from './webhook-logs.service';

@Injectable()
export class WebhookDispatchService {
  private readonly logger = new Logger(WebhookDispatchService.name);

  constructor(
    @InjectRepository(Webhook)
    private readonly repo: Repository<Webhook>,
    private readonly logsService: WebhookLogsService,
  ) {}

  async dispatchToUser(
    userId: string,
    event: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const hooks = await this.repo.find({ where: { userId, actif: true } });
    const matching = hooks.filter((hook) => hook.events?.includes(event));
    await Promise.all(
      matching.map((hook) => this.sendWebhook(hook, event, payload)),
    );
  }

  private async sendWebhook(
    webhook: Webhook,
    event: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    let statusCode: number | undefined;
    let succes = false;

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, payload }),
      });
      statusCode = response.status;
      succes = response.ok;
    } catch (err) {
      this.logger.warn(
        `Webhook delivery failed for ${webhook.url}: ${String(err)}`,
      );
    }

    await this.logsService.create({
      webhookId: webhook.id,
      event,
      payload,
      statusCode,
      succes,
    });
  }
}
