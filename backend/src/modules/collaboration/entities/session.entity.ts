import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('collaboration_sessions')
export class CollaborationSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  fileId: string;

  @Index()
  @Column({ type: 'uuid' })
  startedByUserId: string;

  @CreateDateColumn({ type: 'timestamp', name: 'started_at' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'ended_at' })
  endedAt: Date | null;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: 'active' | 'ended';

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}

