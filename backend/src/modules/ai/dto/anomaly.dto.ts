import { IsString, IsObject } from 'class-validator';

export class AnomalyDto {
  @IsString()
  entityType: string;   // "user" | "file" | "session"

  @IsString()
  entityId: string;

  @IsObject()
  features: Record<string, any>;
}
