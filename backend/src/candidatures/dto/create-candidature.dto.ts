import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { CandidatureStatut } from '../entities/candidature.entity';

export class CreateCandidatureDto {
  @IsUUID()
  missionId: string;

  @IsUUID()
  freelanceId: string;

  @IsString()
  @IsNotEmpty()
  lettre: string;

  @IsNumber()
  @Min(0)
  tarifPropose: number;

  @IsOptional()
  @IsEnum(CandidatureStatut)
  statut?: CandidatureStatut;
}
