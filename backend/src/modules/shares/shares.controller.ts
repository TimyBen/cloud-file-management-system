import { Controller, Post, Get, Body } from '@nestjs/common';
import { SharesService } from './shares.service';

@Controller('shares')
export class SharesController {
  constructor(private service: SharesService) {}

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Get()
  getAll() {
    return this.service.findAll();
  }
}
