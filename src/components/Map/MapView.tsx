import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import { ChoroplethLayer } from './ChoroplethLayer';
import { FlyToDistrict } from './FlyToDistrict';
import { RecentSalesLayer } from './RecentSalesLayer';
import { Legend } from './Legend';
import type { DistrictCollection } from '../../types';

interface MapViewProps {
  data: DistrictCollection | null;
}

// Center of UK (England & Wales overview)
const INITIAL_CENTER: [number, number] = [54.0, -2.0];
const INITIAL_ZOOM = 6;

export function MapView({ data }: MapViewProps) {
  return (
    <MapContainer
      center={INITIAL_CENTER}
      zoom={INITIAL_ZOOM}
      zoomControl={false}
      className="h-full w-full"
      minZoom={5}
      maxZoom={18}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="topright" />
      {data && <ChoroplethLayer data={data} />}
      {data && <FlyToDistrict data={data} />}
      <RecentSalesLayer />
      <Legend />
    </MapContainer>
  );
}
