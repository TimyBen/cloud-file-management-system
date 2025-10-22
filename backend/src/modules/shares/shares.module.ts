import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Share } from './entities/share.entity';
import { SharesService } from './shares.service';
import { SharesController } from './shares.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Share])],
  controllers: [SharesController],
  providers: [SharesService],
})
export class SharesModule {}
