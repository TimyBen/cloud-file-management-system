import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class FilesService {
  private s3: S3Client;
  private bucketName: string;

  constructor(
    @InjectRepository(File)
    private readonly fileRepo: Repository<File>,
    private readonly configService: ConfigService,
  ) {
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const bucket = this.configService.get<string>('AWS_S3_BUCKET_NAME');

    if (!region || !accessKeyId || !secretAccessKey || !bucket) {
      throw new Error('Missing AWS configuration in .env');
    }

    this.bucketName = bucket;

    this.s3 = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  /**
   * Upload a single file to S3 (with version handling)
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    userId: string,
    mode: 'new' | 'duplicate' | 'update' = 'new',
  ) {
    const existingFile = await this.fileRepo.findOne({
      where: { owner_id: userId, filename: originalName, is_deleted: false },
    });

    if (existingFile && mode === 'new') {
      throw new ConflictException({
        message: 'File already exists. Choose to duplicate or update version.',
        options: ['duplicate', 'update'],
      });
    }

    let filename = originalName;
    let previousVersionId: string | undefined = undefined;

    if (existingFile && mode === 'duplicate') {
      const ext = originalName.split('.').pop();
      const base = originalName.replace(`.${ext}`, '');
      filename = `${base}-copy.${ext}`;
    }

    if (existingFile && mode === 'update') {
      previousVersionId = existingFile.version_id || existingFile.id;
    }

    const versionId = `v-${Date.now()}`;
    const key = `uploads/${userId}/${versionId}-${filename}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        }),
      );

      const file = this.fileRepo.create({
        owner_id: userId,
        filename,
        file_type: mimeType,
        file_size: buffer.length,
        storage_path: key,
        is_encrypted: false,
        version_id: versionId,
        previous_version_id: previousVersionId,
      });

      await this.fileRepo.save(file);

      return {
        message: existingFile
          ? 'File updated successfully'
          : 'File uploaded successfully',
        file,
      };
    } catch (err) {
      console.error('Upload Error:', err);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files: Express.Multer.File[], userId: string) {
    const results: { message: string; file: File }[] = []; // Explicit type annotation
    for (const file of files) {
      const result = await this.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        userId,
      );
      results.push(result); // No error now
    }
    return { message: 'All files uploaded successfully', files: results };
  }

  /**
   * Fetch all files owned by a user
   */
  async findUserFiles(userId: string) {
    return await this.fileRepo.find({
      where: { owner_id: userId, is_deleted: false },
      order: { upload_date: 'DESC' },
    });
  }

  /**
   * Get a single file by ID
   */
  async getFileById(id: string) {
    const file = await this.fileRepo.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  /**
   * Generate a download URL (signed)
   */
  async downloadFile(id: string) {
    const file = await this.fileRepo.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: file.storage_path,
    });

    const url = await getSignedUrl(this.s3, command, { expiresIn: 3600 }); // 1 hour
    return { downloadUrl: url, filename: file.filename };
  }

  /**
   * Share file (for future implementation)
   */
  async shareFile(id: string, sharedWith: string[]) {
    const file = await this.fileRepo.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');

    // You could create entries in a file_shares table here
    return {
      message: `File shared with ${sharedWith.length} user(s)`,
      fileId: id,
    };
  }

  /**
   * Update file metadata (rename or mark deleted)
   */
  async updateFile(
    id: string,
    userId: string,
    updates: { filename?: string; is_deleted?: boolean },
  ) {
    const file = await this.fileRepo.findOne({
      where: { id, owner_id: userId },
    });
    if (!file) throw new ForbiddenException('File not found or unauthorized');

    if (updates.filename) file.filename = updates.filename;
    if (typeof updates.is_deleted === 'boolean')
      file.is_deleted = updates.is_deleted;

    await this.fileRepo.save(file);
    return { message: 'File updated', file };
  }

  /**
   * Delete a file (S3 + DB)
   */
  async deleteFile(id: string, userId: string) {
    const file = await this.fileRepo.findOne({
      where: { id, owner_id: userId },
    });
    if (!file) throw new ForbiddenException('File not found or unauthorized');

    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: file.storage_path,
        }),
      );

      file.is_deleted = true;
      file.deleted_at = new Date();
      await this.fileRepo.save(file);

      return { message: 'File deleted successfully', file };
    } catch (err) {
      console.error('Delete Error:', err);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }
}
