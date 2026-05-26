import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateWebhookLogDto {
  @IsOptional()
  @IsString()
  event?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  statusCode?: number;

  @IsOptional()
  @IsBoolean()
  succes?: boolean;
}
