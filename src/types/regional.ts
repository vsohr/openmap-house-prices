/** UK regions for which "days to sell" data is available */
export type UkRegion =
  | 'North East'
  | 'North West'
  | 'Yorkshire & The Humber'
  | 'East Midlands'
  | 'West Midlands'
  | 'East of England'
  | 'London'
  | 'South East'
  | 'South West'
  | 'Wales'
  | 'Scotland';

export interface RegionalDaysToSellEntry {
  region: UkRegion;
  avgDaysToSell: number;
  /** ISO month string, e.g. "2026-01" */
  dataMonth: string;
  source: string;
}

export interface RegionalDaysToSellData {
  ukAverage: number;
  /** ISO month string for when this data was last updated */
  lastUpdated: string;
  regions: RegionalDaysToSellEntry[];
}
