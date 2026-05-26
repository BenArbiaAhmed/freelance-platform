import { IsEnum, IsOptional } from 'class-validator';
import { NiveauCompetence } from '../entities/freelance-competence.entity';

export class UpdateFreelanceCompetenceDto {
  @IsOptional()
  @IsEnum(NiveauCompetence)
  niveau?: NiveauCompetence;
}
