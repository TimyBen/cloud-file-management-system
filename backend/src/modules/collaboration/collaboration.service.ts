// src/modules/collaboration/collaboration.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollaborationSession } from './entities/session.entity';
import { DynamoDBService } from './dynamodb.service';

@Injectable()
export class CollaborationService {
  constructor(
    @InjectRepository(CollaborationSession)
    private sessionRepo: Repository<CollaborationSession>,
    private dynamoService: DynamoDBService,
  ) {}

  async startSession(fileId: string, userId: string) {
    const session = this.sessionRepo.create({ fileId, startedByUserId: userId });
    await this.sessionRepo.save(session);
    await this.dynamoService.createSession(session.id, fileId, userId);
    return session;
  }

  async endSession(sessionId: string) {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) return null;

    session.status = 'ended';
    session.endedAt = new Date();

    await this.sessionRepo.save(session);
    await this.dynamoService.deleteSession(sessionId);
    return session;
  }
}
