// Update your existing ai.service.ts with these improvements

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ServiceAccountService } from './service-account.service';

export interface FileAnalysisRequest {
  fileId: string;
  filePath?: string;
  fileName: string;
  fileType: string;
  content: string;  // Content is now REQUIRED
  analysisType: 'thesis' | 'document' | 'general';
  userId: string;
  options?: {
    detectPii?: boolean;
    extractKeywords?: boolean;
    summarize?: boolean;
    extractEntities?: boolean;
  };
}

export interface AnalysisResult {
  fileId: string;
  analysisType: string;
  summary?: string;
  sentiment?: {
    label: string;
    score: number;
  };
  keywords?: string[];
  entities?: Array<{
    text: string;
    type: string;
    score: number;
  }>;
  metadata?: {
    wordCount: number;
    readingTime: number;
    language: string;
  };
  processingTime: number;
  confidence: number;
}

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

      let response;
      if (method === 'get') {
        response = await this.client.get(path, { headers, params: data });
      } else {
        response = await this.client.post(path, data, { headers });
      }

      // Check if Flask returned an error
      if (response.data && response.data.ok === false) {
        throw new Error(response.data.error || 'AI service returned error');
      }

      return response.data;
    } catch (err: any) {
      this.logger.error(
        `call ${method.toUpperCase()} ${path} failed: ${err.message}`,
        err.stack,
      );

      if (err.response?.status === 401) {
        throw new HttpException('AI service authentication failed', HttpStatus.UNAUTHORIZED);
      } else if (err.response?.status === 404) {
        throw new HttpException('AI service endpoint not found', HttpStatus.NOT_FOUND);
      } else if (err.code === 'ECONNREFUSED') {
        throw new HttpException('AI service is not available', HttpStatus.BAD_GATEWAY);
      }

      throw new HttpException(
        `AI service call failed: ${err.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  // Keep existing methods but improve them
  async embedText(text: string, fileKey?: string) {
    return await this.call('/ai/embed', 'post', {
      text,
      file_key: fileKey
    });
  }

  async annotate(fileKey: string, text: string, opts?: any) {
    return await this.call('/ai/annotate', 'post', {
      file_key: fileKey,
      text,
      ...(opts || {}),
    });
  }

  async semanticSearch(query: string, topK = 10) {
    return await this.call('/ai/search/semantic', 'post', {
      query,
      top_k: topK
    });
  }

  async anomalyScore(
    entityType: string,
    entityId: string,
    features: Record<string, any>,
  ) {
    return await this.call('/ai/anomaly/score', 'post', {
      entity_type: entityType,
      entity_id: entityId,
      features,
    });
  }

  async forecast(fileKey: string, accessSeries: any[], horizon = 30) {
    return await this.call('/ai/forecast', 'post', {
      file_key: fileKey,
      access_series: accessSeries,
      horizon_days: horizon,
    });
  }

  // NEW: Enhanced analyzeFile method that accepts content
  async analyzeFile(request: FileAnalysisRequest): Promise<AnalysisResult> {
    try {
      this.logger.log(`Analyzing file: ${request.fileName} for user: ${request.userId}`);

      const response = await this.call(
        '/ai/analyze',
        'post',
        {
          file_id: request.fileId,
          file_name: request.fileName,
          file_type: request.fileType,
          content: request.content,
          analysis_type: request.analysisType,
          user_id: request.userId,
          options: request.options || {
            detectPii: true,
            extractKeywords: true,
            summarize: true,
            extractEntities: true,
          },
        },
        'ai-flask-service',
      );

      return {
        fileId: request.fileId,
        ...response.data, // Assuming Flask returns data in {ok: true, data: {...}} format
      };
    } catch (error) {
      this.logger.error(`File analysis failed: ${error.message}`);
      throw error;
    }
  }

  // NEW: Batch analysis method
  async batchAnalyzeFiles(requests: FileAnalysisRequest[]): Promise<AnalysisResult[]> {
    try {
      this.logger.log(`Batch analyzing ${requests.length} files`);

      const response = await this.call(
        '/ai/analyze/batch',
        'post',
        {
          files: requests.map((req) => ({
            file_id: req.fileId,
            file_name: req.fileName,
            file_type: req.fileType,
            content: req.content,
            analysis_type: req.analysisType,
            user_id: req.userId,
            options: req.options,
          })),
        },
        'ai-flask-service',
      );

      return response.data.results.map((result: any, index: number) => ({
        fileId: requests[index].fileId,
        ...result.data,
      }));
    } catch (error) {
      this.logger.error(`Batch analysis failed: ${error.message}`);
      throw error;
    }
  }

  // NEW: Health check method
  async healthCheck() {
    try {
      const health = await this.call('/health', 'get');
      const models = await this.call('/ai/models', 'get');

      return {
        status: health.status || 'unknown',
        models: models.models || {},
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Health check failed', error);
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}