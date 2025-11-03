import { IsUUID, IsString, IsOptional } from 'class-validator';

export class JoinSessionDto {
  @IsUUID()
  sessionId: string;

  @IsOptional()
  @IsString()
  displayName?: string;
}
