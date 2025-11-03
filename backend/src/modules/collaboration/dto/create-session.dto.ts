import { IsUUID, IsOptional } from 'class-validator';

export class CreateSessionDto {
  @IsUUID()
  fileId: string;

  @IsOptional()
  title?: string;
}
