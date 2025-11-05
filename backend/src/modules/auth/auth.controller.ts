import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './strategies/jwt.guard';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ---------------- REGISTER ----------------
  @Post('register')
  async register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  // ---------------- LOGIN ----------------
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  // ---------------- PROFILE ----------------
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    // Use req.user (set by JwtStrategy)
    const userId = (req.user as any).userId;
    return this.authService.getProfile(userId);
  }

  @Post('refresh')
  async refresh(@Body('refresh_token') token: string) {
    return this.authService.refreshToken(token);
  }

  // ---------------- LOGOUT ----------------
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req) {
    const userId = req.user.sub;
    return this.authService.logout(userId);
  }
}
