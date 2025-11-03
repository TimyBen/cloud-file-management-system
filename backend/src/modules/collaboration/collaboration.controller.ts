import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CollaborationService } from './collaboration.service';

@Controller('collaboration')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CollaborationController {
  constructor(private readonly collabService: CollaborationService) {}

  @Post('session')
  @Roles('admin', 'user')
  async startSession(@Req() req: any, @Body() dto: { fileId: string }) {
    const userId = req.user?.sub;
    return this.collabService.startSession(dto.fileId, userId);
  }

  @Post('session/join')
  async joinSession(
    @Req() req: any,
    @Body() dto: { sessionId: string; displayName: string },
  ) {
    return this.collabService.joinSession(
      dto.sessionId,
      req.user.sub,
      dto.displayName,
    );
  }

  @Post('session/leave')
  async leaveSession(@Req() req: any, @Body() dto: { sessionId: string }) {
    return this.collabService.leaveSession(dto.sessionId, req.user.sub);
  }

  @Patch('session/:sessionId/end')
  async endSession(@Param('sessionId') sessionId: string, @Req() req: any) {
    return this.collabService.endSession(sessionId, req.user.sub);
  }

  @Get('session/:sessionId/participants')
  async listParticipants(
    @Param('sessionId') sessionId: string,
    @Req() req: any,
  ) {
    return this.collabService.listParticipants(sessionId, req.user.sub);
  }
}
