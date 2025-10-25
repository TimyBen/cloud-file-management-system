import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { File } from './entities/file.entity';
import { FileShare } from '../shares/entities/share.entity'; // ✅ ADD THIS
import { ContextRoleGuard } from '../../common/guards/context-role.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([File, FileShare]), // ✅ Add FileShare here
  ],
  controllers: [FilesController],
  providers: [FilesService, ContextRoleGuard],
  exports: [FilesService],
})
export class FilesModule {}
