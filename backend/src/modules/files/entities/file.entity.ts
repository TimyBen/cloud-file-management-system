import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('files')
@Index('idx_files_owner_relative_path', ['owner_id', 'relative_path'])
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  owner_id: string;

  @ManyToOne(() => User, (user) => user.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  file_type: string;

  @Column({ type: 'bigint', nullable: true })
  file_size: number;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'upload_date',
    default: () => 'CURRENT_TIMESTAMP',
  })
  upload_date: Date;

  @Column({ type: 'text' })
  storage_path: string;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  version_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  previous_version_id?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @Column({ type: 'boolean', default: true })
  is_encrypted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  retention_until: Date;

  // ✅ NEW: stores folder structure like "MyFolder/sub/photo.jpg"
  @Column({ type: 'text', nullable: true })
  relative_path: string | null;

  @Column({ type: 'boolean', default: false })
  has_thumbnail: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnail_path: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  preview_status: string;

  @Column({ type: 'timestamp', nullable: true })
  preview_generated_at: Date;
}
