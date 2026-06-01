import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Webhook } from './entities/webhook.entity';
import { WebhookLog } from './entities/webhook-log.entity';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { WebhookLogsService } from './webhook-logs.service';
import { WebhookLogsController } from './webhook-logs.controller';
import { WebhookDispatchService } from './webhook-dispatch.service';

@Module({
  imports: [TypeOrmModule.forFeature([Webhook, WebhookLog])],
  controllers: [WebhooksController, WebhookLogsController],
  providers: [WebhooksService, WebhookLogsService, WebhookDispatchService],
  exports: [WebhooksService, WebhookLogsService, WebhookDispatchService],
})
export class WebhooksModule {}
