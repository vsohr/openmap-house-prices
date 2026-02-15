import type { Geometry } from 'geojson';

/** Land Registry property type codes */
export type PropertyType = 'D' | 'S' | 'T' | 'F' | 'O';

export interface TypeStats {
  avgPrice: number;
  count: number;
}

export interface DistrictProperties {
  code: string;           // e.g. "SW1", "B1"
  name: string;           // District name
  avgPrice: number;       // Latest average price
  medianPrice: number;    // Latest median price
  transactionCount: number;
  yoyChange: number;      // Year-over-year % change
  byType: Record<PropertyType, TypeStats>;
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
  yoyChange: number | null;
  byType: Record<PropertyType, TypeStats>;
}

export interface DistrictTrend {
  code: string;
  name: string;
  years: YearlyStats[];
}

export interface CompareSale {
  price: number;
  date: string;
  postcode: string;
  type: string;
  address: string;
  lat: number;
  lng: number;
  floorArea?: number;
  rooms?: number;
  energyRating?: string;
}

export interface AppState {
  selectedDistrict: string | null;
  propertyTypeFilter: PropertyType | 'all';
  yearRange: [number, number];
  flyTo: { lat: number; lng: number; zoom: number } | null;
  compare: [CompareSale | null, CompareSale | null];
}

export type AppAction =
  | { type: 'SELECT_DISTRICT'; code: string | null }
  | { type: 'FLY_TO'; lat: number; lng: number; zoom: number; district: string }
  | { type: 'SET_PROPERTY_FILTER'; filter: PropertyType | 'all' }
  | { type: 'SET_YEAR_RANGE'; range: [number, number] }
  | { type: 'ADD_TO_COMPARE'; sale: CompareSale }
  | { type: 'CLEAR_COMPARE' };
