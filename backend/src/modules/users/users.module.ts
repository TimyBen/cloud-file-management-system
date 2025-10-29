import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { LogsModule } from '../logs/logs.module'; // ✅ Import LogsModule for logging

@Module({
  imports: [TypeOrmModule.forFeature([User]), LogsModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], // ✅ Export if other modules (Auth, etc.) depend on it
})
export class UsersModule {}
