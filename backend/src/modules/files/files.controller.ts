import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  Body,
  UseGuards,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Req,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ContextRoleGuard } from '../../common/guards/context-role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { Express } from 'express';

@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * Upload a single file (Admins & Users)
   */
  @Post('upload')
  @Roles('admin', 'user')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User ID missing in token');
    if (!file) throw new BadRequestException('No file uploaded');

    return await this.filesService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      userId,
    );
  }

  /**
   * Upload multiple files (Admins & Users)
   */
  @Post('upload/multiple')
  @Roles('admin', 'user')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User ID missing in token');
    if (!files?.length) throw new BadRequestException('No files provided');

    return await this.filesService.uploadMultipleFiles(files, userId);
  }

  /**
   * Get all files for the logged-in user
   */
  @Get()
  async getUserFiles(@Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not found');
    return await this.filesService.findUserFiles(userId);
  }

  /**
   * Get details of a single file (with Context Role Guard)
   */
  @UseGuards(JwtAuthGuard, ContextRoleGuard)
  @Get(':id')
  async getFile(@Param('id') id: string) {
    return await this.filesService.getFileById(id);
  }

  /**
   * Download file by ID (with Context Role Guard)
   */
  @UseGuards(JwtAuthGuard, ContextRoleGuard)
  @Get('download/:id')
  async downloadFile(@Param('id') id: string) {
    return await this.filesService.downloadFile(id);
  }

  /**
   * Update file (rename or mark deleted) (Context Role = collaborator or owner)
   */
  @UseGuards(JwtAuthGuard, ContextRoleGuard)
  @Patch(':id')
  async updateFile(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: { filename?: string; is_deleted?: boolean },
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User ID missing in token');
    return await this.filesService.updateFile(id, userId, body);
  }

  /**
   * Delete file (only owner)
   */
  @UseGuards(JwtAuthGuard, ContextRoleGuard)
  @Delete(':id')
  async deleteFile(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not found');
    return await this.filesService.deleteFile(id, userId);
  }

  /**
   * Delete multiple files
   */
  @Delete('delete/multiple')
  @UseGuards(JwtAuthGuard)
  async deleteMultipleFiles(
    @Req() req: any,
    @Body() body: { fileIds: string[] },
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not found');
    return await this.filesService.deleteMultipleFiles(body.fileIds, userId);
  }
}
