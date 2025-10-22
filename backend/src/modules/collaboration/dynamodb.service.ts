import { Injectable, Logger } from '@nestjs/common';
import {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DynamoDBService {
  private readonly client: DynamoDBClient;
  private readonly logger = new Logger(DynamoDBService.name);

  constructor(private config: ConfigService) {
    const region = this.config.get<string>('AWS_REGION') ?? 'us-east-1';
    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID') || '';
    const secretAccessKey =
      this.config.get<string>('AWS_SECRET_ACCESS_KEY') || '';

    this.client = new DynamoDBClient({
      region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
  }

  async createSession(sessionId: string, fileId: string, userId: string) {
    const params = {
      TableName: 'CollaborationSessions',
      Item: {
        sessionId: { S: sessionId },
        fileId: { S: fileId },
        userId: { S: userId },
        status: { S: 'active' },
        timestamp: { S: new Date().toISOString() },
      },
    };
    await this.client.send(new PutItemCommand(params));
    this.logger.log(`✅ Created DynamoDB session: ${sessionId}`);
  }

  async updateSessionActivity(sessionId: string, data: string) {
    const params = {
      TableName: 'CollaborationSessions',
      Key: { sessionId: { S: sessionId } },
      UpdateExpression: 'SET data = :data, timestamp = :timestamp',
      ExpressionAttributeValues: {
        ':data': { S: data },
        ':timestamp': { S: new Date().toISOString() },
      },
    };
    await this.client.send(new UpdateItemCommand(params));
  }

  async deleteSession(sessionId: string) {
    const params = {
      TableName: 'CollaborationSessions',
      Key: { sessionId: { S: sessionId } },
    };
    await this.client.send(new DeleteItemCommand(params));
    this.logger.log(`🧹 Deleted DynamoDB session: ${sessionId}`);
  }
}
