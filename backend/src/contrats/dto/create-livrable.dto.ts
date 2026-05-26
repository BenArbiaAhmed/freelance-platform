import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
} from 'class-validator';
import { LivrableStatut } from '../entities/livrable.entity';

export class CreateLivrableDto {
  @IsUUID()
  contratId: string;

  @IsString()
  @IsNotEmpty()
  titre: string;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsEnum(LivrableStatut)
  statut?: LivrableStatut;
}
