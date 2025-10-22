import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Share } from './entities/share.entity';

@Injectable()
export class SharesService {
  constructor(@InjectRepository(Share) private repo: Repository<Share>) {}

  create(data: Partial<Share>) {
    const share = this.repo.create(data);
    return this.repo.save(share);
  }

  findAll() {
    return this.repo.find();
  }
}
