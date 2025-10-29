import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileShare } from './entities/share.entity';
import { File } from '../files/entities/file.entity';
import { LogsService, LogAction } from '../logs/logs.service';


@Injectable()
export class SharesService {
  constructor(
    @InjectRepository(FileShare)
    private readonly shareRepo: Repository<FileShare>,
    @InjectRepository(File)
    private readonly fileRepo: Repository<File>,
    private readonly logsService: LogsService,
  ) {}

  /**
   * Create a new file share
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

    let contextRole = 'viewer';
    if (permission === 'write' || permission === 'comment')
      contextRole = 'collaborator';

    const share = this.shareRepo.create({
      file_id: fileId,
      shared_by_user_id: sharedByUserId,
      shared_with_user_id: sharedWithUserId,
      permission,
      context_role: contextRole,
    });

    const savedShare = await this.shareRepo.save(share);

    // Log share creation
    await this.logsService.logAction(sharedByUserId, LogAction.SHARE_CREATE, {
      fileId,
      details: {
        sharedWithUserId,
        permission,
        contextRole,
      },
      permissionChange: true,
    });

    return savedShare;
  }

  /**
   * List all shares for a file
   */
  async listSharesForFile(fileId: string) {
    const shares = await this.shareRepo.find({
      where: { file_id: fileId, is_active: true },
      relations: ['sharedWith'],
    });

    return shares;
  }

  /**
   * Update an existing share (change permission or context)
   */
  async updateShare(shareId: string, updates: Partial<FileShare>, userId: string) {
    const share = await this.shareRepo.findOne({ where: { id: shareId } });
    if (!share) throw new NotFoundException('Share not found');
    if (share.shared_by_user_id !== userId)
      throw new ForbiddenException('You can only update your own shares');

    const before = { ...share };
    Object.assign(share, updates);
    await this.shareRepo.save(share);

    // Log update
    await this.logsService.logAction(userId, LogAction.SHARE_UPDATE, {
      fileId: share.file_id,
      details: { before, after: share },
      permissionChange: true,
    });

    return share;
  }

  /**
   * Revoke a share (soft delete / deactivate)
   */
  async revokeShare(shareId: string, userId: string) {
    const share = await this.shareRepo.findOne({ where: { id: shareId } });
    if (!share) throw new NotFoundException('Share not found');
    if (share.shared_by_user_id !== userId)
      throw new ForbiddenException('You can only revoke your own shares');

    share.is_active = false;
    share.revoked_at = new Date();
    await this.shareRepo.save(share);

    // Log revoke
    await this.logsService.logAction(userId, LogAction.SHARE_REVOKE, {
      fileId: share.file_id,
      details: { revokedShareId: share.id },
      permissionChange: true,
    });

    return { message: 'Share revoked successfully', share };
  }

  /**
   * Add a collaborator to a file (for teams or shared projects)
   */
  async addCollaborator(fileId: string, addedByUserId: string, collaboratorId: string) {
    const file = await this.fileRepo.findOne({ where: { id: fileId } });
    if (!file) throw new NotFoundException('File not found');

    const share = this.shareRepo.create({
      file_id: fileId,
      shared_by_user_id: addedByUserId,
      shared_with_user_id: collaboratorId,
      permission: 'write',
      context_role: 'collaborator',
    });
    const saved = await this.shareRepo.save(share);

    // Log collaboration addition
    await this.logsService.logAction(addedByUserId, LogAction.COLLAB_ADD, {
      fileId,
      details: { collaboratorId },
      permissionChange: true,
    });

    return saved;
  }

  /**
   * Remove a collaborator
   */
  async removeCollaborator(shareId: string, removedByUserId: string) {
    const share = await this.shareRepo.findOne({ where: { id: shareId } });
    if (!share) throw new NotFoundException('Collaborator not found');

    share.is_active = false;
    share.revoked_at = new Date();
    await this.shareRepo.save(share);

    // Log removal
    await this.logsService.logAction(removedByUserId, LogAction.COLLAB_REMOVE, {
      fileId: share.file_id,
      details: { removedCollaborator: share.shared_with_user_id },
      permissionChange: true,
    });

    return { message: 'Collaborator removed', share };
  }

  /**
   * Record a comment event on a shared file
   */
  async commentOnFile(fileId: string, userId: string, comment: string) {
    const file = await this.fileRepo.findOne({ where: { id: fileId } });
    if (!file) throw new NotFoundException('File not found');

    await this.logsService.logAction(userId, LogAction.COMMENT, {
      fileId,
      details: { comment },
    });

    return { message: 'Comment logged successfully' };
  }
}
