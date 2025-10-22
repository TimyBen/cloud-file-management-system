import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  displayName: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 'user' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  consentGiven: boolean;

  @Column({ nullable: true })
  consentTimestamp: Date;

  @Column({ nullable: true })
  deletedAt: Date;

  @Column({ nullable: false })
  password: string;
}
