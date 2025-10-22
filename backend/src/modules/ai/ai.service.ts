import { Injectable } from '@nestjs/common';

@Injectable()
export class AIService {
  async analyzeFileActivity(fileId: string) {
    return { fileId, anomalyDetected: false, confidence: 0.98 };
  }
}
