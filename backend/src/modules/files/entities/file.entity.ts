import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  owner_id: string; // <== foreign key reference to users.id

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

  @ManyToOne(() => User, user => user.files)
  @JoinColumn({ name: 'owner_id' })
  owner: User;
}
