import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileShare } from './entities/share.entity';
import { File } from '../files/entities/file.entity';
import { SharesService } from './shares.service';
import { SharesController } from './shares.controller';
import { ContextRoleGuard } from '../../common/guards/context-role.guard';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([FileShare, File]), LogsModule],
  providers: [SharesService, ContextRoleGuard],
  controllers: [SharesController],
  exports: [SharesService, ContextRoleGuard, TypeOrmModule],
})
export class SharesModule {}
