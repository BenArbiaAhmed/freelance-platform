import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { PaiementStatut } from '../entities/paiement.entity';

export class CreatePaiementDto {
  @IsUUID()
  contratId: string;

  @IsNumber()
  @Min(0)
  montant: number;

  @IsOptional()
  @IsEnum(PaiementStatut)
  statut?: PaiementStatut;

  @IsOptional()
  @IsString()
  stripePaymentId?: string;
}
