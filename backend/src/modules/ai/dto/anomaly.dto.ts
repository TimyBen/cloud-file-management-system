import { IsString, IsObject } from 'class-validator';

export class AnomalyDto {
  @IsString()
  entityType: string;
  @IsString()
  entityId: string;

  @IsObject()
  features: Record<string, any>;
}
