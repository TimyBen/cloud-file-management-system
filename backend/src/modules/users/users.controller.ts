import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../modules/auth/strategies/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Req } from '@nestjs/common';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //Get all users (Admin only)
  @Get()
  @Roles('admin')
  async findAll() {
    return await this.usersService.findAll();
  }

  // Get one user (Admin or self)
  @Get(':id')
  @Roles('admin', 'user')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  // Create new user (Admin)
  @Post()
  @Roles('admin')
  async create(@Body() body: any) {
    return await this.usersService.create(body);
  }

  // FIND BY EMAIL
  @Get('email/:email')
  @Roles('admin', 'user')
  async findByEmail(@Param('email') email: string) {
    return await this.usersService.findByEmail(email);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req, @Body() body: any) {
    const userId = req.user.sub;
    return await this.usersService.update(userId, body);
  }

  // Update user profile or role
  @Patch(':id')
  @Roles('admin', 'user')
  async update(@Param('id') id: string, @Body() body: any) {
    return await this.usersService.update(id, body);
  }

  // Delete user (Admin or self)
  @Delete(':id')
  @Roles('admin', 'user')
  async delete(@Param('id') id: string) {
    return await this.usersService.softDeleteUser(id);
  }
}
