import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ContratStatut } from '../entities/contrat.entity';

export class UpdateContratDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  montant?: number;

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
