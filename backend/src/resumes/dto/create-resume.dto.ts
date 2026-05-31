import { IsUUID } from 'class-validator';

export class CreateResumeDto {
  @IsUUID()
  freelanceProfileId: string;
}
