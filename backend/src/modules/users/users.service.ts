import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { LogsService } from '../logs/logs.service';
import { LogAction } from '../logs/logs.service';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly logsService: LogsService,
  ) {}

  /**
   *  Create a new user (manual or by admin)
   */
  async create(data: Partial<User>) {
    const existing = await this.userRepo.findOne({
      where: { email: data.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(data.password!, 10);
    const newUser = this.userRepo.create({
      ...data,
      password: hashedPassword,
      role: data.role || 'user',
    });

    const savedUser = await this.userRepo.save(newUser);
    const { password, ...safeUser } = savedUser;

    // Log user creation
    await this.logsService.logAction(savedUser.id, LogAction.USER_CREATE, {
      details: { email: savedUser.email, role: savedUser.role },
    });

    return safeUser;
  }

  /**
   * 👥 Get all users (admin only)
   */
  async findAll() {
    const users = await this.userRepo.find({
      where: { deleted_at: null as any }, // ✅ bypass type issue
      order: { created_at: 'DESC' },
    });
    return users.map(({ password, ...user }) => user);
  }
  /**
   * 🔍 Find user by email
   */
  async findByEmail(email: string) {
    return await this.userRepo.findOne({ where: { email } });
  }

  /**
   * 🔎 Get a single user by ID
   */
  async findOne(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...safeUser } = user;
    return safeUser;
  }

  /**
   * ✏️ Update user (profile or admin change)
   */
  async update(id: string, data: Partial<User>) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const oldData = { ...user };

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    Object.assign(user, data);
    const updatedUser = await this.userRepo.save(user);

    const { password, ...safeUser } = updatedUser;

    // Log update
    await this.logsService.logAction(user.id, LogAction.USER_UPDATE, {
      details: { before: oldData, after: safeUser },
    });

    return safeUser;
  }

  /**
   * Delete user (soft delete)
   */
  async remove(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    user.deleted_at = new Date();
    await this.userRepo.save(user);

    const { password, ...safeUser } = user;

    // Log deletion
    await this.logsService.logAction(user.id, LogAction.USER_DELETE, {
      details: { email: user.email },
    });

    return { message: `User ${user.email} deleted`, user: safeUser };
  }

  /**
   * Soft-delete user (flag only)
   */
  async softDeleteUser(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    user.deleted_at = new Date();
    await this.userRepo.save(user);

    // Log soft deletion
    await this.logsService.logAction(user.id, LogAction.USER_DELETE, {
      details: { email: user.email, softDelete: true },
    });

    return { message: `User ${user.email} marked as deleted` };
  }
}
