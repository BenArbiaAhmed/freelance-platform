import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LivrableStatut } from '../entities/livrable.entity';

export class UpdateLivrableDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  titre?: string;

  @IsOptional()
  @IsEnum(LivrableStatut)
  statut?: LivrableStatut;
}
