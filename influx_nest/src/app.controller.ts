import { Controller, Get, Logger, Post } from '@nestjs/common';
import { InfluxService } from './db/influx.service';

@Controller()
export class AppController {
  constructor(private readonly influxService: InfluxService) {}

  @Get()
  async query() {
    Logger.debug(`current token = ${process.env.INFLUX_DB_TOKEN}`);
    return this.influxService.query();
  }

  @Post()
  async writePoint() {
    return this.influxService.writePoint();
  }
}
