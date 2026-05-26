import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateContratDto } from './create-contrat.dto';

export class UpdateContratDto extends PartialType(
  OmitType(CreateContratDto, [
    'missionId',
    'clientId',
    'freelanceId',
    'candidatureId',
  ] as const),
) {}
