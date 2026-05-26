import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateWebhookDto } from './create-webhook.dto';

export class UpdateWebhookDto extends PartialType(
  OmitType(CreateWebhookDto, ['userId'] as const),
) {}
