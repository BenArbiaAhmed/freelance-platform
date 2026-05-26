import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Webhook } from './entities/webhook.entity';
import { WebhookLog } from './entities/webhook-log.entity';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { WebhookLogsService } from './webhook-logs.service';
import { WebhookLogsController } from './webhook-logs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Webhook, WebhookLog])],
  controllers: [WebhooksController, WebhookLogsController],
  providers: [WebhooksService, WebhookLogsService],
  exports: [WebhooksService, WebhookLogsService],
})
export class WebhooksModule {}
