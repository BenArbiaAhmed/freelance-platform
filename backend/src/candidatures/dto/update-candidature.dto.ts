import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CandidatureStatut } from '../entities/candidature.entity';

export class UpdateCandidatureDto {
  @IsOptional()
  @IsString()
  lettre?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tarifPropose?: number;

  @IsOptional()
  @IsEnum(CandidatureStatut)
  statut?: CandidatureStatut;
}
