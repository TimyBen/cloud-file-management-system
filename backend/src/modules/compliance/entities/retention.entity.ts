import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('retention_policies')
export class Retention {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileId: string;

  @Column()
  status: string;

  @CreateDateColumn()
  updatedAt: Date;
}
