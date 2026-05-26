import { IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';

export class CreateClientProfileDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  entreprise?: string;

  @IsOptional()
  @IsUrl()
  siteWeb?: string;
}
