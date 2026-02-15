import { CircleMarker, Tooltip } from 'react-leaflet';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { useRecentSales } from '../../hooks/useRecentSales';
import { formatCurrency } from '../../utils/formatters';
import { rightmoveUrl, zooplaUrl, googleMapsUrl } from '../../utils/propertyLinks';
import type { GeocodedSale } from '../../types/sales';

const TYPE_COLORS: Record<string, string> = {
  D: '#e74c3c', // Detached - red
  S: '#e67e22', // Semi-detached - orange
  T: '#f1c40f', // Terraced - yellow
  F: '#3498db', // Flat - blue
  O: '#95a5a6', // Other - grey
};

const TYPE_LABELS: Record<string, string> = {
  D: 'Detached',
  S: 'Semi-detached',
  T: 'Terraced',
  F: 'Flat',
  O: 'Other',
};

function SaleMarker({ sale, isSelected }: { sale: GeocodedSale; isSelected: boolean }) {
  const dispatch = useAppDispatch();
  const color = TYPE_COLORS[sale.type] ?? '#95a5a6';

  return (
    <CircleMarker
      center={[sale.lat, sale.lng]}
      radius={isSelected ? 8 : 5}
      pathOptions={{
        fillColor: isSelected ? '#10b981' : color,
        fillOpacity: isSelected ? 1 : 0.8,
        color: isSelected ? '#065f46' : '#333',
        weight: isSelected ? 3 : 1,
      }}
      eventHandlers={{
        click: () => {
          dispatch({
            type: 'ADD_TO_COMPARE',
            sale: {
              price: sale.price,
              date: sale.date,
              postcode: sale.postcode,
              type: sale.type,
              address: sale.address,
              lat: sale.lat,
              lng: sale.lng,
              floorArea: sale.floorArea,
              rooms: sale.rooms,
              energyRating: sale.energyRating,
            },
          });
        },
      }}
    >
      <Tooltip>
        <div className="text-xs">
          <div className="font-semibold">{formatCurrency(sale.price)}</div>
          <div>{TYPE_LABELS[sale.type] ?? sale.type}</div>
          {sale.floorArea && <div>{sale.floorArea} m² · {sale.rooms ?? '?'} rooms</div>}
          {sale.energyRating && <div>EPC: {sale.energyRating}</div>}
          <div className="text-gray-500">{sale.date}</div>
          <div className="text-gray-500">{sale.address}</div>
          <div className="mt-1 flex gap-2 text-[10px]">
            <a href={rightmoveUrl(sale.postcode)} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Rightmove</a>
            <a href={zooplaUrl(sale.postcode)} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Zoopla</a>
            <a href={googleMapsUrl(sale.lat, sale.lng)} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Map</a>
          </div>
          <div className="mt-1 font-medium text-emerald-600">Click to compare</div>
        </div>
      </Tooltip>
    </CircleMarker>
  );
}

export function RecentSalesLayer() {
  const state = useAppState();
  const { sales, loading } = useRecentSales(state.selectedDistrict);

  if (loading || sales.length === 0) return null;

  const [a, b] = state.compare;
  const selectedKeys = new Set<string>();
  if (a) selectedKeys.add(`${a.lat},${a.lng},${a.date}`);
  if (b) selectedKeys.add(`${b.lat},${b.lng},${b.date}`);

  return (
    <>
      {sales.map((sale, i) => (
        <SaleMarker
          key={`${sale.postcode}-${sale.date}-${i}`}
          sale={sale}
          isSelected={selectedKeys.has(`${sale.lat},${sale.lng},${sale.date}`)}
        />
      ))}
    </>
  );
}
