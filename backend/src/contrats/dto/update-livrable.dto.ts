import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateLivrableDto } from './create-livrable.dto';

export class UpdateLivrableDto extends PartialType(
  OmitType(CreateLivrableDto, ['contratId'] as const),
) {}
