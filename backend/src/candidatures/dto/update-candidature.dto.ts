import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCandidatureDto } from './create-candidature.dto';

export class UpdateCandidatureDto extends PartialType(
  OmitType(CreateCandidatureDto, ['missionId', 'freelanceId'] as const),
) {}
