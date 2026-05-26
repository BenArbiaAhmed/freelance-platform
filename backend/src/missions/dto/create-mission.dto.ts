import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { MissionStatut } from '../entities/mission.entity';

export class CreateMissionDto {
  @IsUUID()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  titre: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  budget: number;

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
