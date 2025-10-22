// src/modules/collaboration/collaboration.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollaborationSession } from './entities/session.entity';
import { CollaborationService } from './collaboration.service';
import { CollaborationGateway } from './collaboration.gateway';
import { DynamoDBService } from './dynamodb.service';

@Module({
  imports: [TypeOrmModule.forFeature([CollaborationSession])],
  providers: [CollaborationService, CollaborationGateway, DynamoDBService],
  exports: [CollaborationService],
})
export class CollaborationModule {}
