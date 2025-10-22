import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class AwsS3Service {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async uploadFile(fileBuffer: Buffer, filename: string, mimeType: string) {
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: filename,
      Body: fileBuffer,
      ContentType: mimeType,
    };
    await this.s3.send(new PutObjectCommand(uploadParams));
    return { Location: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${filename}` };
  }
}
