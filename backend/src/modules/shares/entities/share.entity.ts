import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('file_shares')
export class Share {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileId: string;

  @Column()
  sharedByUserId: string;

  @Column()
  sharedWithUserId: string;

  @Column()
  permission: string;

  @CreateDateColumn()
  sharedAt: Date;

  @Column({ nullable: true })
  revokedAt: Date;
}
