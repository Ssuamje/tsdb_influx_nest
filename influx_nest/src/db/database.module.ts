import { Module, Provider } from '@nestjs/common';
import { InfluxDB } from '@influxdata/influxdb-client';
import { InfluxService } from './influx.service';

const INFLUX_PROVIDER: Provider = {
  provide: InfluxDB,
  useFactory: () => {
    return new InfluxDB({
      url: 'http://localhost:8086',
      token: process.env.INFLUX_DB_TOKEN,
    });
  },
};

@Module({
  imports: [],
  controllers: [],
  providers: [INFLUX_PROVIDER, InfluxService],
  exports: [InfluxService],
})
export class DatabaseModule {}
