import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePaiementDto } from './create-paiement.dto';

export class UpdatePaiementDto extends PartialType(
  OmitType(CreatePaiementDto, ['contratId'] as const),
) {}
