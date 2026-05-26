import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateFreelanceProfileDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tarifJournalier?: number;

  @IsOptional()
  @IsBoolean()
  disponible?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rating?: number;
}
