import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  // Create new user (manual or by admin)
  async create(data: Partial<User>) {
    const existing = await this.userRepo.findOne({
      where: { email: data.email },
    });
    if (existing) throw new Error('Email already registered');

    const hashedPassword = await bcrypt.hash(data.password!, 10);
    const newUser = this.userRepo.create({
      ...data,
      password: hashedPassword,
      role: data.role || 'user',
    });

    const savedUser = await this.userRepo.save(newUser);
    const { password, ...safeUser } = savedUser; // strip password safely
    return safeUser;
  }

  // Get all users (admin only)
  async findAll() {
    const users = await this.userRepo.find();
    return users.map(({ password, ...user }) => user); // remove passwords
  }

  // Get single user by ID
  async findOne(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...safeUser } = user;
    return safeUser;
  }

  // Update user details
  async update(id: string, updates: Partial<User>) {
    const user = await this.findOne(id);
    Object.assign(user, updates);
    const updated = await this.userRepo.save(user);
    const { password, ...safeUser } = updated;
    return safeUser;
  }

  // Delete (soft delete)
  async remove(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.deleted_at = new Date();
    await this.userRepo.save(user);
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
