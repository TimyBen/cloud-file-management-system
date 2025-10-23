// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // ---------------- REGISTER ----------------
  async register(data: RegisterDto) {
    const existing = await this.userRepo.findOne({
      where: { email: data.email },
    });
    if (existing) throw new UnauthorizedException('Email already registered');

    const hashed = await bcrypt.hash(data.password, 10);

    const user = this.userRepo.create({
      display_name: data.display_name,
      email: data.email,
      password: hashed,
      role: data.role || 'user', // ✅ Default to 'user' if not provided
    });

    await this.userRepo.save(user);

    // ✅ Include role when generating tokens
    const tokens = await this.getTokens(user.id, user.email, user.role);

    delete (user as any).password;

    return {
      user,
      ...tokens,
    };
  }

  // ---------------- LOGIN ----------------
  async login(data: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: data.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.getTokens(user.id, user.email, user.role);

    delete (user as any).password;

    return {
      user,
      ...tokens,
    };
  }

  // ---------------- PROFILE ----------------
  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    delete (user as any).password;

    return user;
  }

  // ---------------- TOKEN GENERATION ----------------
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

  // ---------------- REFRESH TOKEN ----------------
  async refreshToken(token: string) {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userRepo.findOne({ where: { id: decoded.sub } });
      if (!user) throw new UnauthorizedException('User not found');

      const tokens = await this.getTokens(user.id, user.email, user.role);

      delete (user as any).password;

      return {
        user,
        ...tokens,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
