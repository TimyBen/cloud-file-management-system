import { IsArray, IsUUID, ArrayNotEmpty } from 'class-validator';

export class DeleteFilesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  fileIds: string[];
}
