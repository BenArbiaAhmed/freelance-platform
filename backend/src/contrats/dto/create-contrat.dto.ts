import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { ContratStatut } from '../entities/contrat.entity';

export class CreateContratDto {
  @IsOptional()
  @IsUUID()
  missionId?: string;

  @IsUUID()
  clientId: string;

  @IsUUID()
  freelanceId: string;

  @IsOptional()
  @IsUUID()
  candidatureId?: string;

  @IsNumber()
  @Min(0)
  montant: number;

  @IsOptional()
  @IsEnum(ContratStatut)
  statut?: ContratStatut;

  @IsOptional()
  @IsBoolean()
  signéParClient?: boolean;

  @IsOptional()
  @IsBoolean()
  signéParFreelance?: boolean;
}
