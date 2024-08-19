import { Point } from '@influxdata/influxdb-client';

export class UserUsagePoint extends Point {
  public static MEASUREMENT = 'usage';
  public static TAG_USER_ID = 'userId';
  public static FIELD_DEVICE_ID = 'deviceId';
  public static FIELD_USAGE_MINUTES = 'usageMinutes';

  constructor(
    userId: string,
    deviceId: string,
    usageMinutes: number,
    timestamp: Date,
  ) {
    super(UserUsagePoint.MEASUREMENT);
    this.tag('userId', userId);
    this.stringField('deviceId', deviceId);
    this.intField('usageMinutes', usageMinutes);
    this.timestamp(timestamp);
  }
}
