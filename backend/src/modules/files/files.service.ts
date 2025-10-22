import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { AwsS3Service } from './aws-s3.service';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File) private fileRepo: Repository<File>,
    private s3Service: AwsS3Service,
  ) {}

  async uploadFile(fileBuffer: Buffer, filename: string, mimeType: string) {
    const uploadResult = await this.s3Service.uploadFile(fileBuffer, filename, mimeType);
    const file = this.fileRepo.create({
      filename,
      fileType: mimeType,
      storagePath: uploadResult.Location,
    });
    return this.fileRepo.save(file);
  }

  async findAll() {
    return this.fileRepo.find();
  }
}
