import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceService } from './compliance.service';
import { Retention } from './entities/retention.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Retention])],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
