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
  display_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 'user' })
  role: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ default: false })
  consent_given: boolean;

  @Column({ nullable: true })
  consent_timestamp: Date;

  @Column({ nullable: true })
  deleted_at: Date;

  @Column({ nullable: false })
  password: string;
}
