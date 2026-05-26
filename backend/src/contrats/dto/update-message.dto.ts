import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateMessageDto {
  @IsOptional()
  @IsString()
  contenu?: string;

  @IsOptional()
  @IsBoolean()
  lu?: boolean;
}
