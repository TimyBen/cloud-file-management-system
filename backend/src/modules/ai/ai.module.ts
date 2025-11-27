import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { ServiceAccountService } from './service-account.service';
import { AuthController } from './auth.controller';

@Module({
  providers: [AiService, ServiceAccountService],
  controllers: [AuthController],
  exports: [AiService],
})
export class AiModule {}
