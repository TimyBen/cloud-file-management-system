import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './strategies/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookies(res: Response, access: string, refresh: string) {
    const isProd = process.env.NODE_ENV === 'production';

    // IMPORTANT:
    // - secure must be false in local http dev
    // - sameSite should be 'lax' for same-site dev; use 'none' + secure=true if cross-site https
    res.cookie('access_token', access, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refresh_token', refresh, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
  }

  // ---------------- REGISTER ----------------
  @Post('register')
  async register(@Body() data: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(data);

    // Your AuthService returns access_token and refresh_token (snake_case)
    this.setAuthCookies(res, result.access_token, result.refresh_token);

    // Don’t send tokens to client anymore (optional, but recommended)
    const { access_token, refresh_token, ...safe } = result;
    return safe;
  }

  // ---------------- LOGIN ----------------
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() data: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(data);

    this.setAuthCookies(res, result.access_token, result.refresh_token);

    const { access_token, refresh_token, ...safe } = result;
    return safe;
  }

  // ---------------- PROFILE ----------------
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    const userId = (req.user as any).sub;
    return this.authService.getProfile(userId);
  }

  // ---------------- REFRESH ----------------
  // Cookie-based refresh: read refresh_token from cookies, rotate cookies
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refresh = req.cookies?.refresh_token;
    if (!refresh) {
      // keep it simple; your service will throw Unauthorized otherwise
      return { message: 'Missing refresh token' };
    }

    const result = await this.authService.refreshToken(refresh);

    this.setAuthCookies(res, result.access_token, result.refresh_token);

    const { access_token, refresh_token, ...safe } = result;
    return safe;
  }

  // ---------------- LOGOUT ----------------
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = (req.user as any).sub;

    // Optional: blacklist access token if you want
    const access = req.cookies?.access_token;
    await this.authService.logout(userId, access);

    this.clearAuthCookies(res);
    return { message: 'Logout successful' };
  }
}
