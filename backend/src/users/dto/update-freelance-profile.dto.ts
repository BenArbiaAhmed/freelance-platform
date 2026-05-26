import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateFreelanceProfileDto } from './create-freelance-profile.dto';

export class UpdateFreelanceProfileDto extends PartialType(
  OmitType(CreateFreelanceProfileDto, ['userId'] as const),
) {}
