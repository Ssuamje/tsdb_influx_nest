import { Inject, Injectable, Logger } from '@nestjs/common';
import { InfluxDB, QueryApi, WriteApi } from '@influxdata/influxdb-client';
import { IFKeys, MyUsageData } from './influx.types';
import { UserUsagePoint } from './influx.point';
import { IFFluxQueryBuilder } from './influx-query-builder';

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
    const idFromArgument = 'sanan_id';
    const deviceData = new IFFluxQueryBuilder()
      .from(this.BUCKET)
      .range('-1h')
      .filter(IFKeys._measurement, UserUsagePoint.MEASUREMENT)
      .filter(IFKeys._field, UserUsagePoint.FIELD_DEVICE_ID)
      .filter(UserUsagePoint.TAG_USER_ID, idFromArgument)
      .keep([IFKeys._time, IFKeys._value])
      .rename({ _value: UserUsagePoint.FIELD_DEVICE_ID })
      .build();

    const usageData = new IFFluxQueryBuilder()
      .from(this.BUCKET)
      .range('-1h')
      .filter(IFKeys._measurement, UserUsagePoint.MEASUREMENT)
      .filter(IFKeys._field, UserUsagePoint.FIELD_USAGE_MINUTES)
      .filter(UserUsagePoint.TAG_USER_ID, idFromArgument)
      .keep([IFKeys._time, IFKeys._value])
      .rename({ _value: UserUsagePoint.FIELD_USAGE_MINUTES })
      .build();

    const joinedQuery = new IFFluxQueryBuilder()
      .join({ device: deviceData, usage: usageData }, [IFKeys._time])
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
