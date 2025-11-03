import { Injectable, NotFoundException } from '@nestjs/common';
import { DynamoDBService } from './dynamo/dynamodb.service';
import { LogsService, LogAction } from '../logs/logs.service';

@Injectable()
export class CollaborationService {
  constructor(
    private readonly dynamo: DynamoDBService,
    private readonly logsService: LogsService,
  ) {}

  /**
   * Start a collaboration session for a given file.
   * The creator becomes the session host.
   */
  async startSession(fileId: string, startedByUserId: string) {
    const session = await this.dynamo.createSession(fileId, startedByUserId);

    // Log session start
    await this.logsService.logAction(startedByUserId, LogAction.COLLAB_START, {
      fileId,
      sessionId: session.sessionId,
      details: { message: 'Collaboration session started' },
    });

    return {
      message: 'Session started successfully',
      session,
    };
  }

  /**
   * Join an existing collaboration session.
   */
  async joinSession(sessionId: string, userId: string, displayName: string) {
    const participant = await this.dynamo.addParticipant(
      sessionId,
      userId,
      displayName,
    );

    // Log join action
    await this.logsService.logAction(userId, LogAction.COLLAB_JOIN, {
      sessionId,
      details: { displayName, message: 'User joined collaboration session' },
    });

    return {
      message: 'Joined session successfully',
      participant,
    };
  }

  /**
   * Leave a session voluntarily.
   */
  async leaveSession(sessionId: string, userId: string) {
    await this.dynamo.leaveSession(sessionId, userId);

    // Log leave action
    await this.logsService.logAction(userId, LogAction.COLLAB_LEAVE, {
      sessionId,
      details: { message: 'User left collaboration session' },
    });

    return {
      message: 'Left session successfully',
    };
  }

  /**
   * End a session (for the host or admin).
   * Once ended, no further collaboration occurs.
   */
  async endSession(sessionId: string, userId: string) {
    const result = await this.dynamo.endSession(sessionId);
    if (!result)
      throw new NotFoundException(`Session ${sessionId} not found or inactive`);

    // Log end action
    await this.logsService.logAction(userId, LogAction.COLLAB_END, {
      sessionId,
      details: { message: 'Collaboration session ended' },
    });

    return {
      message: 'Session ended successfully',
      result,
    };
  }

  /**
   * Retrieve all participants currently in a session.
   */
  async listParticipants(sessionId: string, userId: string) {
    const participants = await this.dynamo.getParticipants(sessionId);
    if (!participants)
      throw new NotFoundException(`Session ${sessionId} not found`);

    // Log participant listing
    await this.logsService.logAction(
      userId,
      LogAction.COLLAB_PARTICIPANTS_LIST,
      {
        sessionId,
        details: {
          message: `User listed ${participants.length} participant(s)`,
        },
      },
    );

    return {
      message: `Found ${participants.length} participant(s)`,
      participants,
    };
  }
}
