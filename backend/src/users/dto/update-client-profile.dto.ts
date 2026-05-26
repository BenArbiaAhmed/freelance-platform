import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateClientProfileDto } from './create-client-profile.dto';

export class UpdateClientProfileDto extends PartialType(
  OmitType(CreateClientProfileDto, ['userId'] as const),
) {}
