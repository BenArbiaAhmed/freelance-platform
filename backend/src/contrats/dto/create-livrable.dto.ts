import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

/**
 * Body fields for a deliverable submission. The actual file arrives via
 * multipart upload (handled by the controller), so `url`/`fileName` are
 * derived server-side rather than accepted from the client.
 */
export class CreateLivrableDto {
  @IsUUID()
  contratId: string;

  @IsString()
  @IsNotEmpty()
  titre: string;
}
