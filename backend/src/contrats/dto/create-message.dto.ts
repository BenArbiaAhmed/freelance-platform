import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  contratId: string;

  @IsUUID()
  expediteurId: string;

  @IsString()
  @IsNotEmpty()
  contenu: string;

  @IsOptional()
  @IsBoolean()
  lu?: boolean;
}
