export interface RecentSale {
  price: number;
  date: string;
  postcode: string;
  type: string;
  address: string;
  floorArea?: number;
  rooms?: number;
  energyRating?: string;
}

export interface GeocodedSale extends RecentSale {
  lat: number;
  lng: number;
}
