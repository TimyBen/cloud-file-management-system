import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
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
    permission: 'read' | 'write' | 'comment',
  ) {
    const file = await this.fileRepo.findOne({ where: { id: fileId } });
    if (!file) throw new NotFoundException('File not found');

    if (file.owner_id !== sharedByUserId)
      throw new ForbiddenException('You can only share your own files');

    // Map permission to context role
    const contextRole =
      permission === 'write' || permission === 'comment'
        ? 'collaborator'
        : 'viewer';

    // Check if this file is already shared with this user
    const existingShare = await this.shareRepo.findOne({
      where: { file_id: fileId, shared_with_user_id: sharedWithUserId },
    });

    if (existingShare) {
      // If share exists → update it instead of creating duplicate
      existingShare.permission = permission;
      existingShare.context_role = contextRole;
      existingShare.is_active = true;
      existingShare.revoked_at = null;

      await this.shareRepo.save(existingShare);

      return {
        message: 'Share updated successfully',
        share: existingShare,
      };
    }

    // Create new share if not existing
    const newShare = this.shareRepo.create({
      file_id: fileId,
      shared_by_user_id: sharedByUserId,
      shared_with_user_id: sharedWithUserId,
      permission,
      context_role: contextRole,
      is_active: true,
    });

    await this.shareRepo.save(newShare);

    return {
      message: 'File shared successfully',
      share: newShare,
    };
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
  async updateShare(
    shareId: string,
    userId: string,
    permission: 'read' | 'write' | 'comment',
  ) {
    const share = await this.shareRepo.findOne({ where: { id: shareId } });
    if (!share) throw new NotFoundException('Share record not found');

    // Only file owner or admin can update
    const file = await this.fileRepo.findOne({
      where: { id: share.file_id },
    });

    if (!file) throw new NotFoundException('Associated file not found');
    if (file.owner_id !== userId)
      throw new UnauthorizedException('Only file owner can update shares');

    // Update permission → context role
    const contextRole =
      permission === 'write' || permission === 'comment'
        ? 'collaborator'
        : 'viewer';

    share.permission = permission;
    share.context_role = contextRole;
    share.is_active = true;
    share.revoked_at = null;

    await this.shareRepo.save(share);

    return {
      message: 'Share updated successfully',
      share,
    };
  }
  /**
   * Revoke share access
   */
  async revokeShare(shareId: string, userId: string) {
    const share = await this.shareRepo.findOne({ where: { id: shareId } });
    if (!share) throw new NotFoundException('Share record not found');

    // Verify ownership or admin role
    const file = await this.fileRepo.findOne({ where: { id: share.file_id } });
    if (!file) throw new NotFoundException('File not found');
    if (file.owner_id !== userId)
      throw new UnauthorizedException('Only file owner can revoke access');

    share.is_active = false;
    share.revoked_at = new Date();

    await this.shareRepo.save(share);

    return { message: 'File share revoked successfully', shareId };
  }
}
