import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCompetenceDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsOptional()
  @IsString()
  categorie?: string;
}
