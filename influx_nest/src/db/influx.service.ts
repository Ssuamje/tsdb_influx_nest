import { Inject, Injectable, Logger } from '@nestjs/common';
import { InfluxDB, QueryApi, WriteApi } from '@influxdata/influxdb-client';
import { MyUsageData } from './influx.types';
import { UserUsagePoint } from './influx.point';
import { FluxQueryBuilder } from './influx-query-builder';

@Injectable()
export class InfluxService {
  private readonly ORGANIZATION = 'sanan_test';
  private readonly BUCKET = 'init_bucket';
  private readonly queryApi: QueryApi;
  private readonly writeApi: WriteApi;

  constructor(@Inject(InfluxDB) private readonly influx: InfluxDB) {
    this.queryApi = this.influx.getQueryApi(this.ORGANIZATION);
    this.writeApi = this.influx.getWriteApi(this.ORGANIZATION, this.BUCKET);
  }

  async writeUserUsagePoint() {
    const point = new UserUsagePoint(
      'sanan_id',
      'sanan_device_id',
      1,
      new Date(),
    );
    Logger.debug(`'point = ${JSON.stringify(point)}`);
    this.writeApi.writePoint(point);
    await this.writeApi.flush();
  }

  async query(): Promise<MyUsageData[]> {
    const builder = new FluxQueryBuilder();

    const deviceData = builder
      .from('init_bucket')
      .range('-1h')
      .filter('_measurement', 'usage')
      .filter('_field', 'deviceId')
      .filter('userId', 'sanan_id')
      .keep(['_time', '_value'])
      .rename({ _value: 'deviceId' })
      .build();

    const usageData = builder
      .reset()
      .from('init_bucket')
      .range('-1h')
      .filter('_measurement', 'usage')
      .filter('_field', 'usageMinutes')
      .filter('userId', 'sanan_id')
      .keep(['_time', '_value'])
      .rename({ _value: 'usageMinutes' })
      .build();

    const joinedQuery = builder
      .reset()
      .join({ device: deviceData, usage: usageData }, ['_time'])
      .build();

    console.log(`joinedQuery = ${joinedQuery}`);
    const results = [];
    return new Promise((resolve, reject) => {
      this.queryApi.queryRows(joinedQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          results.push(o);
        },
        error(error) {
          Logger.error(`Error executing query: ${error}`);
          reject(error);
        },
        complete() {
          Logger.debug(
            `Query completed with results: ${JSON.stringify(results)}`,
          );
          resolve(results);
        },
      });
    });
  }
}
