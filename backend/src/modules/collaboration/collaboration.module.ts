import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollaborationSession } from './entities/session.entity';
import { CollaborationService } from './collaboration.service';
import { CollaborationController } from './collaboration.controller';
import { CollaborationGateway } from './collaboration.gateway';
import { DynamoDBService } from './dynamo/dynamodb.service';
import { LogsModule } from '../logs/logs.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CollaborationSession]),
    LogsModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [CollaborationController],
  providers: [CollaborationService, CollaborationGateway, DynamoDBService],
  exports: [CollaborationService],
})
export class CollaborationModule {}
