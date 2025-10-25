import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  UnauthorizedException,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { SharesService } from './shares.service';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('shares')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  /**
   * Share a file with another user
   */
  @Post()
  @Roles('admin', 'user')
  async shareFile(
    @Req() req: any,
    @Body()
    body: {
      fileId: string;
      sharedWithUserId: string;
      permission: 'read' | 'write' | 'comment'; // Restrict at type-level
    },
  ) {
    const sharedByUserId = req.user?.sub;
    if (!sharedByUserId) throw new UnauthorizedException('User not found');

    // Validate input before passing it along
    const validPermissions: ('read' | 'write' | 'comment')[] = [
      'read',
      'write',
      'comment',
    ];
    if (!validPermissions.includes(body.permission)) {
      throw new BadRequestException(
        `Invalid permission. Allowed: ${validPermissions.join(', ')}`,
      );
    }

    return await this.sharesService.shareFile(
      body.fileId,
      sharedByUserId,
      body.sharedWithUserId,
      body.permission, // Now TypeScript-safe
    );
  }
  /**
   * List all shares for a file
   */
  @Get(':fileId')
  async listShares(@Param('fileId') fileId: string) {
    return await this.sharesService.listFileShares(fileId);
  }

  /**
   * ✏️ Update share permission
   */
  @Patch(':id')
  @Roles('admin', 'user')
  async updateShare(
    @Param('id') id: string,
    @Body() body: { permission: 'read' | 'write' | 'comment' },
    @Req() req: any,
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not found');

    const valid = ['read', 'write', 'comment'];
    if (!valid.includes(body.permission)) {
      throw new BadRequestException('Invalid permission');
    }

    return await this.sharesService.updateShare(id, userId, body.permission);
  }

  /**
   * Revoke a share
   */
  @Patch(':id/revoke')
  @Delete(':id/revoke')
  @Roles('admin', 'user')
  async revokeShare(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not found');

    return await this.sharesService.revokeShare(id, userId);
  }
}
