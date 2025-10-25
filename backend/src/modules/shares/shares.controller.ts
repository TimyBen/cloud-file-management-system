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
   * 📤 Share a file with another user
   */
  @Post()
  @Roles('admin', 'user')
  async shareFile(
    @Req() req: any,
    @Body() body: { fileId: string; sharedWithUserId: string; permission: string },
  ) {
    const sharedByUserId = req.user?.sub;
    if (!sharedByUserId) throw new UnauthorizedException('User not found');

    return await this.sharesService.shareFile(
      body.fileId,
      sharedByUserId,
      body.sharedWithUserId,
      body.permission,
    );
  }

  /**
   * 📋 List all shares for a file
   */
  @Get(':fileId')
  async listShares(@Param('fileId') fileId: string) {
    return await this.sharesService.listFileShares(fileId);
  }

  /**
   * ✏️ Update share permission
   */
  @Patch(':shareId')
  async updateShare(
    @Param('shareId') shareId: string,
    @Body() body: { permission: string },
  ) {
    return await this.sharesService.updateShare(shareId, body.permission);
  }

  /**
   * 🚫 Revoke a share
   */
  @Patch(':shareId/revoke')
  async revokeShare(@Param('shareId') shareId: string, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not found');
    return await this.sharesService.revokeShare(shareId, userId);
  }
}
