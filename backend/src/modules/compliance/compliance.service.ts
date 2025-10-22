import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Retention } from './entities/retention.entity';

@Injectable()
export class ComplianceService {
  constructor(@InjectRepository(Retention) private repo: Repository<Retention>) {}

  async flagFile(fileId: string, status: string) {
    const entry = this.repo.create({ fileId, status });
    return this.repo.save(entry);
  }
}
