import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileShare } from '../../modules/shares/entities/share.entity';
import { File } from '../../modules/files/entities/file.entity';

@Injectable()
export class ContextRoleGuard implements CanActivate {
  constructor(
    @InjectRepository(FileShare)
    private readonly shareRepo: Repository<FileShare>,

    @InjectRepository(File)
    private readonly fileRepo: Repository<File>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const fileId = request.params.id || request.body.fileId;

    if (!user || !fileId)
      throw new ForbiddenException('Access denied: missing user or file ID');

    // 1. Admins always allowed
    if (user.role === 'admin') return true;

    // 2. Check if user owns the file
    const file = await this.fileRepo.findOne({ where: { id: fileId } });
    if (file && file.owner_id === user.sub) return true;

    // 3. Otherwise, verify if user is a collaborator / shared access
    const share = await this.shareRepo.findOne({
      where: {
        file_id: fileId,
        shared_with_user_id: user.sub,
        is_active: true,
      },
    });

    if (!share) {
      throw new ForbiddenException('Access denied: no active share found');
    }

    // 4. Check contextual role permissions
    if (share.context_role === 'viewer' && request.method !== 'GET') {
      throw new ForbiddenException('Viewers cannot modify files');
    }

    // All checks passed
    return true;
  }
}
