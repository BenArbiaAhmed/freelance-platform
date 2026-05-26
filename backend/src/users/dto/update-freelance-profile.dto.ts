import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateFreelanceProfileDto {
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
