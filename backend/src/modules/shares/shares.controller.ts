import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
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

  @Post()
  @Roles('admin', 'user')
  async createShare(
    @Req() req: any,
    @Body()
    body: {
      fileId: string;
      sharedWithEmail: string;
      permission: 'read' | 'write' | 'comment';
    },
  ) {
    const userId = req.user?.sub;
    const email = req.user?.email;

    if (!userId) throw new UnauthorizedException('User not found');
    if (!email) throw new UnauthorizedException('User email not found');

    return this.sharesService.shareFile(
      body.fileId,
      userId,
      body.sharedWithEmail,
      body.permission,
    );
  }

  @Get(':fileId')
  async listShares(@Param('fileId') fileId: string) {
    return await this.sharesService.listSharesForFile(fileId);
  }

  @Patch(':shareId')
  async updateShare(
    @Param('shareId') shareId: string,
    @Req() req: any,
    @Body() updates: Partial<any>,
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not found');
    return await this.sharesService.updateShare(shareId, updates, userId);
  }

  @Delete(':shareId/revoke')
  async revokeShare(@Param('shareId') shareId: string, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not found');
    return await this.sharesService.revokeShare(shareId, userId);
  }

  @Post(':fileId/collaborators')
  async addCollaborator(
    @Param('fileId') fileId: string,
    @Req() req: any,
    @Body('collaboratorId') collaboratorId: string,
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not found');
    return await this.sharesService.addCollaborator(
      fileId,
      userId,
      collaboratorId,
    );
  }

  @Delete(':shareId/collaborators')
  async removeCollaborator(@Param('shareId') shareId: string, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not found');
    return await this.sharesService.removeCollaborator(shareId, userId);
  }

  @Post(':fileId/comment')
  async commentOnFile(
    @Param('fileId') fileId: string,
    @Req() req: any,
    @Body('comment') comment: string,
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not found');
    return await this.sharesService.commentOnFile(fileId, userId, comment);
  }
}
