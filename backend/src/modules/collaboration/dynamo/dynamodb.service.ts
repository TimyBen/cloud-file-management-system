import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  QueryCommand as DocQueryCommand,
  DeleteCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DynamoDBService {
  private readonly logger = new Logger(DynamoDBService.name);
  private docClient: DynamoDBDocumentClient;
  private sessionTable: string;
  private participantsTable: string;

  constructor(private readonly config: ConfigService) {
    const region =
      this.config.get<string>('AWS_DYNAMO_REGION') || 'ap-southeast-1';
    const endpoint = this.config.get<string>('AWS_DYNAMO_ENDPOINT'); // Optional for local
    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID') || '';
    const secretAccessKey =
      this.config.get<string>('AWS_SECRET_ACCESS_KEY') || '';

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('Missing AWS credentials in environment variables');
    }

    const client = new DynamoDBClient({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.docClient = DynamoDBDocumentClient.from(client);
    this.sessionTable =
      this.config.get<string>('AWS_DYNAMO_SESSIONS_TABLE') ||
      'collaboration_sessions';
    this.participantsTable =
      this.config.get<string>('AWS_DYNAMO_PARTICIPANTS_TABLE') || 'session_participants';
  }

  async createSession(fileId: string, startedByUserId: string) {
    const sessionId = uuidv4();
    const item = {
      sessionId,
      fileId,
      startedByUserId,
      startedAt: new Date().toISOString(),
      status: 'active',
    };

    try {
      await this.docClient.send(
        new PutCommand({ TableName: this.sessionTable, Item: item }),
      );
      this.logger.log(`Session ${sessionId} created for file ${fileId}`);
      return item;
    } catch (err) {
      this.logger.error('Error creating session:', err);
      throw new InternalServerErrorException('Failed to create session');
    }
  }

  /**
   * Join an existing collaboration session
   */
  async addParticipant(sessionId: string, userId: string, displayName: string) {
    const participantId = uuidv4();
    const item = {
      id: participantId,
      sessionId,
      userId,
      displayName,
      joinedAt: new Date().toISOString(),
      active: true,
    };

    try {
      await this.docClient.send(
        new PutCommand({
          TableName: this.participantsTable,
          Item: item,
        }),
      );
      this.logger.log(`User ${userId} joined session ${sessionId}`);
      return item;
    } catch (err) {
      this.logger.error('Error adding participant:', err);
      throw new InternalServerErrorException('Failed to join session');
    }
  }

  /**
   * List all participants for a session
   */
  async getParticipants(sessionId: string) {
    try {
      const result = await this.docClient.send(
        new DocQueryCommand({
          TableName: this.participantsTable,
          IndexName: 'sessionId-index',
          KeyConditionExpression: 'sessionId = :sid',
          ExpressionAttributeValues: { ':sid': sessionId },
        }),
      );
      return result.Items || [];
    } catch (err) {
      this.logger.error('Error listing participants:', err);
      throw new InternalServerErrorException('Failed to fetch participants');
    }
  }

  /**
   * Mark a participant as inactive (leave session)
   */
  async leaveSession(sessionId: string, userId: string) {
    try {
      await this.docClient.send(
        new UpdateCommand({
          TableName: this.participantsTable,
          Key: { id: `${sessionId}-${userId}` },
          UpdateExpression: 'set active = :a, leftAt = :l',
          ExpressionAttributeValues: {
            ':a': false,
            ':l': new Date().toISOString(),
          },
        }),
      );
      this.logger.log(`User ${userId} left session ${sessionId}`);
      return { message: 'Participant marked inactive' };
    } catch (err) {
      this.logger.error('Error leaving session:', err);
      throw new InternalServerErrorException('Failed to leave session');
    }
  }

  /**
   * End a session (update status)
   */
  async endSession(sessionId: string) {
    try {
      await this.docClient.send(
        new UpdateCommand({
          TableName: this.sessionTable,
          Key: { sessionId },
          UpdateExpression: 'set #s = :s, endedAt = :e',
          ExpressionAttributeNames: { '#s': 'status' },
          ExpressionAttributeValues: {
            ':s': 'ended',
            ':e': new Date().toISOString(),
          },
        }),
      );
      this.logger.log(`Session ${sessionId} ended`);
      return { sessionId, status: 'ended' };
    } catch (err) {
      this.logger.error('Error ending session:', err);
      throw new InternalServerErrorException('Failed to end session');
    }
  }

  /**
   * Delete session (optional cleanup)
   */
  async deleteSession(sessionId: string) {
    try {
      await this.docClient.send(
        new DeleteCommand({
          TableName: this.sessionTable,
          Key: { sessionId },
        }),
      );
      this.logger.log(`Session ${sessionId} deleted`);
      return { message: 'Session deleted' };
    } catch (err) {
      this.logger.error('Error deleting session:', err);
      throw new InternalServerErrorException('Failed to delete session');
    }
  }

  /**
   * Health check for DynamoDB connectivity
   */
  async healthCheck() {
    try {
      await this.docClient.send(
        new GetCommand({
          TableName: this.sessionTable,
          Key: { sessionId: 'dummy' },
        }),
      );
      return { healthy: true, message: 'DynamoDB connection successful' };
    } catch (err) {
      this.logger.warn('DynamoDB health check failed:', err.message);
      return { healthy: false, message: 'DynamoDB unreachable' };
    }
  }
}