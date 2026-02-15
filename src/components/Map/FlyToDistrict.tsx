import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppState } from '../../context/AppContext';
import type { DistrictCollection } from '../../types';

interface FlyToDistrictProps {
  data: DistrictCollection;
}

/**
 * Watches state for flyTo coordinates or selectedDistrict changes,
 * and flies the map accordingly.
 */
export function FlyToDistrict({ data }: FlyToDistrictProps) {
  const state = useAppState();
  const map = useMap();
  const prevDistrict = useRef<string | null>(null);
  const prevFlyTo = useRef<string | null>(null);

  // Handle exact coordinate fly-to (from postcode search)
  useEffect(() => {
    if (!state.flyTo) return;
    const key = `${state.flyTo.lat},${state.flyTo.lng}`;
    if (key === prevFlyTo.current) return;
    prevFlyTo.current = key;
    prevDistrict.current = state.selectedDistrict;

    map.flyTo([state.flyTo.lat, state.flyTo.lng], state.flyTo.zoom, { duration: 0.8 });
  }, [state.flyTo, state.selectedDistrict, map]);

  // Handle district selection fly-to (from clicking map or selecting district code)
  useEffect(() => {
    if (state.flyTo) return; // flyTo takes priority
    const code = state.selectedDistrict;
    if (!code || code === prevDistrict.current) return;
    prevDistrict.current = code;

    const feature = data.features.find((f) => f.properties.code === code);
    if (!feature) return;

    const tempLayer = L.geoJSON(feature as GeoJSON.Feature);
    const bounds = tempLayer.getBounds();
    if (bounds.isValid()) {
      map.flyToBounds(bounds, { padding: [50, 50], duration: 0.5 });
    }
  }, [state.selectedDistrict, state.flyTo, data, map]);

  return null;
}
