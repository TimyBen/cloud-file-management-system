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
  @UseGuards(JwtAuthGuard)
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
   * Upload multiple files
   */
  @Post('upload/multiple')
  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'user')
  @UseInterceptors(FilesInterceptor('files', 10)) // up to 10 files
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User ID missing in token');
    if (!files || files.length === 0)
      throw new BadRequestException('No files provided');

    return await this.filesService.uploadMultipleFiles(files, userId);
  }

  /**
   * Get all files for the logged-in user
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserFiles(@Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not found');
    return await this.filesService.findUserFiles(userId);
  }

  /**
   * Get details of a single file
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getFile(@Param('id') id: string) {
    return await this.filesService.getFileById(id);
  }

  /**
   * Download file by ID
   */
  @Get('download/:id')
  @UseGuards(JwtAuthGuard)
  async downloadFile(@Param('id') id: string) {
    return await this.filesService.downloadFile(id);
  }

  /**
   * Share file with other users
   */
  @Patch(':id/share')
  @UseGuards(JwtAuthGuard)
  async shareFile(
    @Param('id') id: string,
    @Body() body: { sharedWith: string[] },
  ) {
    return await this.filesService.shareFile(id, body.sharedWith);
  }

  /**
   * Update file (rename or mark deleted)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateFile(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: { filename?: string; is_deleted?: boolean },
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User ID missing in token');
    return this.filesService.updateFile(id, userId, body);
  }

  /**
   * Delete file (only owner)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteFile(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not found');
    return await this.filesService.deleteFile(id, userId);
  }
}
