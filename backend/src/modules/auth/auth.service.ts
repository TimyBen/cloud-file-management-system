import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LogsService } from '../logs/logs.service';
import { LogAction } from '../logs/logs.service';

@Injectable()
export class AuthService {
  private readonly tokenBlacklist = new Set<string>();

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly logsService: LogsService, // Inject LogsService
  ) {}

  /**
   * REGISTER
   */
  async register(data: RegisterDto) {
    const existing = await this.userRepo.findOne({
      where: { email: data.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(data.password, 10);
    const user = this.userRepo.create({
      display_name: data.display_name,
      email: data.email,
      password: hashed,
      role: data.role || 'user',
    });

    await this.userRepo.save(user);
    const tokens = await this.getTokens(user.id, user.email, user.role);

    delete (user as any).password;

    // Log registration
    await this.logsService.logAction(user.id, LogAction.REGISTER, {
      details: { email: user.email, role: user.role },
    });

    return { message: 'Registration successful', user, ...tokens };
  }

  /**
   * LOGIN
   */
  async login(data: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: data.email } });
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    delete (user as any).password;

    // Log login
    await this.logsService.logAction(user.id, LogAction.LOGIN, {
      details: { email: user.email, role: user.role },
    });

    return { message: 'Login successful', user, ...tokens };
  }

  /**
   * LOGOUT
   */
  async logout(userId: string, token?: string) {
    if (token) {
      this.tokenBlacklist.add(token);
    } else {
      this.tokenBlacklist.add(userId);
    }

    // Log logout
    await this.logsService.logAction(userId, LogAction.LOGOUT);

    return { message: 'Logout successful' };
  }

  /**
   * REFRESH TOKEN
   */
  async refreshToken(token: string) {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (this.tokenBlacklist.has(token)) {
        throw new UnauthorizedException('Token revoked');
      }

      const user = await this.userRepo.findOne({ where: { id: decoded.sub } });
      if (!user) throw new UnauthorizedException('User not found');

      const tokens = await this.getTokens(user.id, user.email, user.role);
      delete (user as any).password;

      // Log token refresh
      await this.logsService.logAction(user.id, LogAction.REFRESH_TOKEN);

      return { message: 'Token refreshed', user, ...tokens };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * TOKEN GENERATION
   */
  async getTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET,
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    return { access_token, refresh_token };
  }

  /**
   * 👤 PROFILE
   */
  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) throw new UnauthorizedException('User not found');

    delete (user as any).password;

    await this.logsService.logAction(user.id, LogAction.USER_UPDATE, {
      fileId: null,
      details: { viewedProfile: true },
    });

    return user;
  }
}
