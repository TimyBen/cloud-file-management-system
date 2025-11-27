import { Controller, Post, Get, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get('health')
  health() {
    // return this.ai.health();
  }

  @Post('embed')
  embed(@Body() body: { text: string }) {
    return this.ai.embedText(body.text);
  }

  @Post('annotate')
  annotate(@Body() body: { fileKey: string; text: string }) {
    return this.ai.annotate(body.fileKey, body.text);
  }

  @Post('anomaly')
  anomaly(
    @Body() body: { entityType: string; entityId: string; features: any },
  ) {
    return this.ai.anomalyScore(body.entityType, body.entityId, body.features);
  }

  @Post('forecast')
  forecast(
    @Body() body: { fileKey: string; accessSeries: any[]; horizon?: number },
  ) {
    return this.ai.forecast(
      body.fileKey,
      body.accessSeries,
      body.horizon ?? 30,
    );
  }
}
