import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateWebhookLogDto {
  @IsUUID()
  webhookId: string;

  @IsString()
  @IsNotEmpty()
  event: string;

  @IsObject()
  payload: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  statusCode?: number;

  @IsOptional()
  @IsBoolean()
  succes?: boolean;
}
