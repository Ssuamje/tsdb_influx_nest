import { Controller, Get, Logger, Post } from '@nestjs/common';
import { InfluxService } from './db/influx.service';

@Controller()
export class AppController {
  constructor(private readonly influxService: InfluxService) {}

  @Get()
  async query() {
    const result = await this.influxService.query();
    result.forEach((r) => {
      Logger.debug(`${r.userId}, ${r._field}, ${r._value}`);
    });
    return result;
  }

  @Post()
  async writePoint() {
    return this.influxService.writeUserUsagePoint();
  }
}
