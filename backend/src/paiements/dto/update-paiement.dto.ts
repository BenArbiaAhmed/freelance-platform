import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaiementStatut } from '../entities/paiement.entity';

export class UpdatePaiementDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  montant?: number;

  @IsOptional()
  @IsEnum(PaiementStatut)
  statut?: PaiementStatut;

  @IsOptional()
  @IsString()
  stripePaymentId?: string;
}
