import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateFreelanceCompetenceDto } from './create-freelance-competence.dto';

export class UpdateFreelanceCompetenceDto extends PartialType(
  OmitType(CreateFreelanceCompetenceDto, [
    'freelanceId',
    'competenceId',
  ] as const),
) {}
