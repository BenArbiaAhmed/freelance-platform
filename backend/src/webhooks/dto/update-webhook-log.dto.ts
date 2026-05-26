import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateWebhookLogDto } from './create-webhook-log.dto';

export class UpdateWebhookLogDto extends PartialType(
  OmitType(CreateWebhookLogDto, ['webhookId'] as const),
) {}
