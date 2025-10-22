// src/modules/collaboration/entities/session.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('collaboration_sessions')
export class CollaborationSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileId: string;

  @Column()
  startedByUserId: string;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ nullable: true })
  endedAt: Date;

  @Column({ default: 'active' })
  status: string; // active | ended
}
