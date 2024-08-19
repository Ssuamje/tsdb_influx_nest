export enum INFLUX_KEY {
  _field = '_field',
  _value = '_value',
  _time = '_time',
  _measurement = '_measurement',
}

interface TimeSeriesMetadata {
  result: string;
  table: number;
  _start: string;
  _stop: string;
  _time: string;
  _measurement: string;
}

interface UsageData {
  _field: string;
  _value: string | number; // `deviceId` | `usageMinutes`
  userId: string;
}

export interface MyUsageData extends TimeSeriesMetadata, UsageData {}
