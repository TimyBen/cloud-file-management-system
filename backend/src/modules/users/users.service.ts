import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  softDelete: any;
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

  async findByEmail(email: string) {
    return await this.userRepo.findOne({ where: { email } });
  }

  // Get single user by ID
  async findOne(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async update(id: string, data: Partial<User>) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new Error('User not found');

    Object.assign(user, data);
    await this.userRepo.save(user);

    if ('password' in user) delete (user as any).password;
    return user;
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

  async softDeleteUser(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    user.deleted_at = new Date(); // soft delete timestamp
    await this.userRepo.save(user);

    return { message: `User ${user.email} marked as deleted` };
  }
}
