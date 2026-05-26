import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
} from 'class-validator';

export class CreateWebhookDto {
  @IsUUID()
  userId: string;

  @IsUrl()
  url: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  events: string[];

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
