import { IsOptional, IsString } from 'class-validator';

export class UpdateCompetenceDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  categorie?: string;
}
