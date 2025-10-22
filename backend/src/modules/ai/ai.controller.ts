import { Controller, Get, Param } from '@nestjs/common';
import { AIService } from './ai.service';

@Controller('ai')
export class AIController {
  constructor(private aiService: AIService) {}

  @Get('analyze/:fileId')
  analyze(@Param('fileId') fileId: string) {
    return this.aiService.analyzeFileActivity(fileId);
  }
}
