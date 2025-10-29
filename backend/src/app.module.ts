// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './config/database.config';
import { UsersModule } from './modules/users/users.module';
import { FilesModule } from './modules/files/files.module';
import { SharesModule } from './modules/shares/shares.module';
import { LogsModule } from './modules/logs/logs.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';
import { AIModule } from './modules/ai/ai.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { AuthModule } from './modules/auth/auth.module';
import { EventsGateway } from './websocket/events.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useClass: DatabaseConfig }),
    UsersModule,
    AuthModule,
    FilesModule,
    SharesModule,
    LogsModule,
    CollaborationModule,
    AIModule,
    ComplianceModule,
  ],
  providers: [EventsGateway],
})
export class AppModule {}
