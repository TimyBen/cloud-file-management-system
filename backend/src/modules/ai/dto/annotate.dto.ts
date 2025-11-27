import { IsString } from 'class-validator';

export class AnnotateDto {
  @IsString()
  fileKey: string;

  @IsString()
  text: string;
}
