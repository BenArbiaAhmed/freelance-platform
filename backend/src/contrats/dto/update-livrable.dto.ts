import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { LivrableStatut } from '../entities/livrable.entity';

export class UpdateLivrableDto {
  @IsOptional()
  @IsString()
  titre?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsEnum(LivrableStatut)
  statut?: LivrableStatut;
}
