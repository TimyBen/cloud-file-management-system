import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  fileType: string;

  @Column({ nullable: true })
  fileSize: number;

  @CreateDateColumn()
  uploadDate: Date;

  @Column()
  storagePath: string;
}
