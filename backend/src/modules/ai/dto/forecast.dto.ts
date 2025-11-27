import { IsString, IsArray, IsOptional, IsNumber } from 'class-validator';

export class ForecastDto {
  @IsString()
  fileKey: string;

  @IsArray()
  accessSeries: Array<{ ts: number; count: number }>;

  @IsOptional()
  @IsNumber()
  horizon?: number; // default = 30 days (handled in controller)
}
