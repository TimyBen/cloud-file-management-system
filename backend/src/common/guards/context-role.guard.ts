import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileShare } from '../../modules/shares/entities/share.entity';

@Injectable()
export class ContextRoleGuard implements CanActivate {
  constructor(
    @InjectRepository(FileShare)
    private readonly shareRepo: Repository<FileShare>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const fileId = request.params.id || request.body.fileId;

    if (!user || !fileId)
      throw new ForbiddenException('Access denied: missing user or file ID');

    // 🧠 Admins always have access
    if (user.role === 'admin') return true;

    // 🔍 Check file_shares table for active permission
    const share = await this.shareRepo.findOne({
      where: {
        file_id: fileId,
        shared_with_user_id: user.sub,
        is_active: true,
      },
    });

    if (!share)
      throw new ForbiddenException('Access denied: no active share found');

    // Check contextual role
    if (share.context_role === 'viewer' && request.method !== 'GET') {
      throw new ForbiddenException('Viewers cannot modify files');
    }

    return true;
  }
}
