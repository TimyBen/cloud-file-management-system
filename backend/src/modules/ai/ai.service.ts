import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ServiceAccountService } from './service-account.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: AxiosInstance;

  constructor(private readonly sa: ServiceAccountService) {
    this.client = axios.create({
      baseURL: process.env.FLASK_BASE_URL || 'http://127.0.0.1:5000',
      timeout: Number(process.env.AI_CLIENT_TIMEOUT_MS || 30000),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async call(
    path: string,
    method: 'get' | 'post' = 'post',
    data?: any,
    aud = 'ai-flask-service',
  ) {
    try {
      const token = this.sa.createToken(
        process.env.SERVICE_ACCOUNT_SUB || 'nest-service',
        aud,
        Number(process.env.SERVICE_ACCOUNT_TTL || 60),
      );
      const headers = { Authorization: `Bearer ${token}` };

      if (method === 'get') {
        const resp = await this.client.get(path, { headers, params: data });
        return resp.data;
      } else {
        const resp = await this.client.post(path, data, { headers });
        return resp.data;
      }
    } catch (err) {
      this.logger.error(
        `call ${method.toUpperCase()} ${path} failed`,
        (err as any).message,
      );
      throw new HttpException('AI service call failed', HttpStatus.BAD_GATEWAY);
    }
  }

  // ... add all methods as in your file (embedText, annotate, forecast, anomalyScore, etc.)
  async embedText(text: string) {
    return await this.call('/embed', 'post', { text });
  }
  async annotate(fileKey: string, text: string, opts?: any) {
    return await this.call('/annotate', 'post', {
      file_key: fileKey,
      text,
      ...(opts || {}),
    });
  }
  async semanticSearch(query: string, topK = 10) {
    return await this.call('/search/semantic', 'post', { query, top_k: topK });
  }
  async anomalyScore(
    entityType: string,
    entityId: string,
    features: Record<string, any>,
  ) {
    return await this.call('/anomaly/score', 'post', {
      entity_type: entityType,
      entity_id: entityId,
      features,
    });
  }
  async forecast(fileKey: string, accessSeries: any[], horizon = 30) {
    return await this.call('/forecast', 'post', {
      file_key: fileKey,
      access_series: accessSeries,
      horizon_days: horizon,
    });
  }

  // analyzeFile requires a filePath parameter (no hard-coded thesis)
  async analyzeFile(filePath: string) {
    if (!filePath)
      throw new HttpException('filePath required', HttpStatus.BAD_REQUEST);
    return await this.call(
      '/analyze/thesis',
      'get',
      { path: filePath },
      'ai-flask-service',
    );
  }
}
