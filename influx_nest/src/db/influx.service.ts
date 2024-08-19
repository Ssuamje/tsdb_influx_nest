import { Inject, Injectable } from '@nestjs/common';
import {
  InfluxDB,
  Point,
  QueryApi,
  WriteApi,
} from '@influxdata/influxdb-client';

@Injectable()
export class InfluxService {
  private readonly ORGANIZATION = 'sanan_test';
  private readonly BUCKET = 'init_bucket';
  private readonly USAGE_MEASUREMENT = 'usage';
  private readonly queryApi: QueryApi;
  private readonly writeApi: WriteApi;

  constructor(@Inject(InfluxDB) private readonly influx: InfluxDB) {
    this.queryApi = this.influx.getQueryApi(this.ORGANIZATION);
    this.writeApi = this.influx.getWriteApi(this.ORGANIZATION, this.BUCKET);
  }

  async writePoint() {
    const point = new Point(this.USAGE_MEASUREMENT);
    point.tag('userId', 'sanan_id');
    point.stringField('deviceId', 'sanan_device_id');
    point.intField('usageMinutes', 1);
    point.timestamp(new Date());
    this.writeApi.writePoint(point);
  }

  async query() {
    const query = `from(bucket: "${this.BUCKET}")
        |> range(start: -1h)
        |> filter(fn: (r) => r._measurement == "${this.USAGE_MEASUREMENT}")`;

    const results = [];
    this.queryApi.queryRows(query, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row);
        results.push(o);
      },
      error(error) {
        console.error(error);
      },
      complete() {
        console.log('Query completed');
      },
    });

    return results;
  }
}
