import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileShare } from './entities/share.entity';
import { File } from '../files/entities/file.entity';

@Injectable()
export class SharesService {
  constructor(
    @InjectRepository(FileShare)
    private readonly shareRepo: Repository<FileShare>,
    @InjectRepository(File)
    private readonly fileRepo: Repository<File>,
  ) {}

  /**
   * Share a file
   */
  async shareFile(
    fileId: string,
    sharedByUserId: string,
    sharedWithUserId: string,
    permission: string,
  ) {
    const file = await this.fileRepo.findOne({ where: { id: fileId } });
    if (!file) throw new NotFoundException('File not found');
    if (file.owner_id !== sharedByUserId)
      throw new ForbiddenException('You can only share your own files');

    const share = this.shareRepo.create({
      file_id: fileId,
      shared_by_user_id: sharedByUserId,
      shared_with_user_id: sharedWithUserId,
      permission,
    });

    return await this.shareRepo.save(share);
  }

  /**
   * List all shares for a file
   */
  async listFileShares(fileId: string) {
    return await this.shareRepo.find({
      where: { file_id: fileId, is_active: true },
      relations: ['sharedWith'],
    });
  }

  /**
   * Update share permission
   */
  async updateShare(shareId: string, permission: string) {
    const share = await this.shareRepo.findOne({ where: { id: shareId } });
    if (!share) throw new NotFoundException('Share record not found');

    share.permission = permission;
    return await this.shareRepo.save(share);
  }

  /**
   * Revoke share access
   */
  async revokeShare(shareId: string, userId: string) {
    const share = await this.shareRepo.findOne({ where: { id: shareId } });
    if (!share) throw new NotFoundException('Share not found');

    // Optional: verify the user owns the original file
    const file = await this.fileRepo.findOne({ where: { id: share.file_id } });
    if (file?.owner_id !== userId)
      throw new ForbiddenException('You can only revoke your own file shares');

    share.is_active = false;
    share.revoked_at = new Date();

    return await this.shareRepo.save(share);
  }
}