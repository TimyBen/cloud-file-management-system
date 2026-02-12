import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Param,
  Req,
} from '@nestjs/common';
import { AiService, FileAnalysisRequest, AnalysisResult } from './ai.service';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard'; // You need to create this
import { RolesGuard } from '../../common/guards/roles.guard'; // You need to create this
import { Roles } from '../../common/decorators/roles.decorator'; // You need to create this

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get('health')
  health() {
    return this.ai.healthCheck();
  }

  @Post('embed')
  @Roles('user', 'admin')
  embed(@Body() body: { text: string; fileKey?: string }) {
    return this.ai.embedText(body.text, body.fileKey);
  }

  @Post('annotate')
  @Roles('user', 'admin')
  annotate(@Body() body: { fileKey: string; text: string; options?: any }) {
    return this.ai.annotate(body.fileKey, body.text, body.options);
  }

  @Post('anomaly')
  @Roles('user', 'admin')
  anomaly(
    @Body() body: { entityType: string; entityId: string; features: any },
  ) {
    return this.ai.anomalyScore(body.entityType, body.entityId, body.features);
  }

  @Post('forecast')
  @Roles('user', 'admin')
  forecast(
    @Body() body: { fileKey: string; accessSeries: any[]; horizon?: number },
  ) {
    return this.ai.forecast(
      body.fileKey,
      body.accessSeries,
      body.horizon ?? 30,
    );
  }

  @Post('analyze')
  @Roles('user', 'admin')
  async analyze(
    @Body() body: {
      fileId: string;
      filePath?: string;
      fileName: string;
      fileType: string;
      content: string; // Client must provide content
      analysisType?: 'thesis' | 'document' | 'general';
      options?: any;
    },
    @Req() req: any,
  ): Promise<{ success: boolean; data: AnalysisResult }> {
    const userId = req.user?.id || 'anonymous';

    const request: FileAnalysisRequest = {
      fileId: body.fileId,
      filePath: body.filePath,
      fileName: body.fileName,
      fileType: body.fileType,
      content: body.content,
      analysisType: body.analysisType || 'general',
      userId: userId,
      options: body.options,
    };

    const result = await this.ai.analyzeFile(request);

    // TODO: Save result to database

    return {
      success: true,
      data: result,
    };
  }

  @Post('analyze/batch')
  @Roles('user', 'admin')
  async batchAnalyze(
    @Body() body: {
      files: Array<{
        fileId: string;
        fileName: string;
        fileType: string;
        content: string;
        analysisType?: string;
        options?: any;
      }>;
    },
    @Req() req: any,
  ): Promise<{ success: boolean; count: number; results: AnalysisResult[] }> {
    const userId = req.user?.id || 'anonymous';

    const requests: FileAnalysisRequest[] = body.files.map(file => ({
      fileId: file.fileId,
      fileName: file.fileName,
      fileType: file.fileType,
      content: file.content,
      analysisType: (file.analysisType as any) || 'general',
      userId: userId,
      options: file.options,
    }));

    const results = await this.ai.batchAnalyzeFiles(requests);

    // TODO: Save results to database

    return {
      success: true,
      count: results.length,
      results,
    };
  }

  @Get('analysis/:fileId')
  @Roles('user', 'admin')
  async getAnalysis(
    @Param('fileId') fileId: string,
    @Req() req: any,
  ): Promise<{ success: boolean; data: any }> {
    // TODO: Fetch from database instead of re-analyzing
    // This is just a placeholder
    return {
      success: true,
      data: {
        fileId,
        status: 'not_found',
        message: 'Analysis not found in database',
      },
    };
  }
}