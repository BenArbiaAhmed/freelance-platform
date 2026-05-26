import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { NiveauCompetence } from '../entities/freelance-competence.entity';

export class CreateFreelanceCompetenceDto {
  @IsUUID()
  freelanceId: string;

  @IsUUID()
  competenceId: string;

  @IsOptional()
  @IsEnum(NiveauCompetence)
  niveau?: NiveauCompetence;
}
