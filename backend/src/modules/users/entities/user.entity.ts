import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { File } from '../../files/entities/file.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'display_name', nullable: false })
  display_name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string; // global role: user | admin

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ name: 'consent_given', default: false })
  consent_given: boolean;

  @Column({ name: 'consent_timestamp', nullable: true })
  consent_timestamp: Date;

  @Column({ name: 'deleted_at', nullable: true })
  deleted_at: Date;

  // Relationship: A user owns many files
  @OneToMany(() => File, (file) => file.owner)
  files: File[];
}
