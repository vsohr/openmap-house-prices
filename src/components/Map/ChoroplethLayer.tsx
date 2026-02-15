import { useCallback } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import type { Layer, PathOptions } from 'leaflet';
import type { Feature } from 'geojson';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { growthToColor } from '../../utils/colors';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import type { DistrictProperties, DistrictCollection } from '../../types';

interface ChoroplethLayerProps {
  data: DistrictCollection;
}

export function ChoroplethLayer({ data }: ChoroplethLayerProps) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const map = useMap();

  const style = useCallback(
    (feature: Feature | undefined): PathOptions => {
      if (!feature?.properties) {
        return { fillColor: '#ccc', weight: 1, color: '#999', fillOpacity: 0.7 };
      }
      const props = feature.properties as DistrictProperties;

      return {
        fillColor: growthToColor(props.yoyChange),
        weight: 1,
        color: '#666',
        fillOpacity: 0.7,
      };
    },
    []
  );

  const onEachFeature = useCallback(
    (feature: Feature, layer: Layer) => {
      const props = feature.properties as DistrictProperties;

      layer.bindTooltip(
        `<strong>${props.code}</strong><br/>` +
          `Avg: ${formatCurrency(props.avgPrice)}<br/>` +
          `YoY: ${formatPercent(props.yoyChange)}`,
        { sticky: true }
      );

      layer.on('click', () => {
        dispatch({ type: 'SELECT_DISTRICT', code: props.code });
        const bounds = (layer as L.GeoJSON).getBounds?.();
        if (bounds) {
          map.flyTo(bounds.getCenter(), 10, { duration: 0.5 });
        }
      });
    },
    [dispatch, map]
  );

  return (
    <GeoJSON
      key={`choropleth-${state.propertyTypeFilter}-${state.yearRange.join('-')}`}
      data={data}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}
