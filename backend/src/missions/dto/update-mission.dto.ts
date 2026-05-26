import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { MissionStatut } from '../entities/mission.entity';

export class UpdateMissionDto {
  @IsOptional()
  @IsString()
  titre?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deadline?: Date;

  @IsOptional()
  @IsEnum(MissionStatut)
  statut?: MissionStatut;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  competencesRequises?: string[];
}
