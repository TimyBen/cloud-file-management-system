import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { File } from '../../files/entities/file.entity';
import { User } from '../../users/entities/user.entity';

@Entity('file_shares')
export class FileShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  file_id: string;

  @Column({ type: 'uuid' })
  shared_by_user_id: string;

  @Column({ type: 'uuid' })
  shared_with_user_id: string;

  @Column({ type: 'varchar', length: 20 })
  permission: string; // read | write | comment

  @CreateDateColumn()
  shared_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  revoked_at?: Date | null;

  @Column({ default: true })
  is_active: boolean;

  @ManyToOne(() => File)
  @JoinColumn({ name: 'file_id' })
  file: File;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'shared_with_user_id' })
  sharedWith: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'shared_by_user_id' })
  sharedBy: User;
}
