import { Controller, Get, Post, Body } from '@nestjs/common';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  getAll() {
    return this.filesService.findAll();
  }

  @Post('upload')
  async uploadFile(@Body() body: { filename: string; fileType: string }) {
    const fileBuffer = Buffer.from(''); // replace with real upload handling later
    return this.filesService.uploadFile(fileBuffer, body.filename, body.fileType);
  }
}
