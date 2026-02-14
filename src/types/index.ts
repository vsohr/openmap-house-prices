import type { Geometry } from 'geojson';

export interface DistrictProperties {
  code: string;           // e.g. "SW1", "B1"
  name: string;           // District name
  avgPrice: number;       // Latest average price
  medianPrice: number;    // Latest median price
  transactionCount: number;
  yoyChange: number;      // Year-over-year % change
  avgPriceByType: {
    detached: number | null;
    semi: number | null;
    terraced: number | null;
    flat: number | null;
  };
  latestYear: number;
}

export interface DistrictFeature {
  type: 'Feature';
  properties: DistrictProperties;
  geometry: Geometry;
}

export interface DistrictCollection {
  type: 'FeatureCollection';
  features: DistrictFeature[];
}

export interface YearlyStats {
  year: number;
  avgPrice: number;
  medianPrice: number;
  transactionCount: number;
  byType: {
    detached: { avg: number; count: number } | null;
    semi: { avg: number; count: number } | null;
    terraced: { avg: number; count: number } | null;
    flat: { avg: number; count: number } | null;
  };
}

export interface DistrictTrend {
  code: string;
  name: string;
  yearlyStats: YearlyStats[];
}

export type PropertyType = 'detached' | 'semi' | 'terraced' | 'flat';
export type ColorMode = 'price' | 'growth';

export interface AppState {
  selectedDistrict: string | null;
  colorMode: ColorMode;
  propertyTypeFilter: PropertyType | 'all';
  yearRange: [number, number];
}

export type AppAction =
  | { type: 'SELECT_DISTRICT'; code: string | null }
  | { type: 'SET_COLOR_MODE'; mode: ColorMode }
  | { type: 'SET_PROPERTY_FILTER'; filter: PropertyType | 'all' }
  | { type: 'SET_YEAR_RANGE'; range: [number, number] };
