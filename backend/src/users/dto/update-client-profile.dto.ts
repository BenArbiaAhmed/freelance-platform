import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateClientProfileDto {
  @IsOptional()
  @IsString()
  entreprise?: string;

  @IsOptional()
  @IsUrl()
  siteWeb?: string;
}
