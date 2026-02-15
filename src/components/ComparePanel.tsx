import { useAppState, useAppDispatch } from '../context/AppContext';
import { rightmoveUrl, zooplaUrl, googleMapsUrl } from '../utils/propertyLinks';
import type { CompareSale } from '../types';

const TYPE_LABELS: Record<string, string> = {
  D: 'Detached',
  S: 'Semi-detached',
  T: 'Terraced',
  F: 'Flat',
  O: 'Other',
};

function formatPrice(value: number): string {
  return `\u00A3${value.toLocaleString('en-GB')}`;
}

function SaleCard({ sale, label }: { sale: CompareSale | null; label: string }) {
  if (!sale) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-xs text-gray-400">Click a property marker on the map</p>
      </div>
    );
  }

  const pricePerSqm = sale.floorArea ? Math.round(sale.price / sale.floorArea) : null;

  return (
    <div className="flex flex-1 flex-col gap-1 rounded-lg border border-gray-200 bg-white p-4">
      <div className="text-lg font-bold text-gray-900">{formatPrice(sale.price)}</div>
      <div className="text-sm text-gray-700">{TYPE_LABELS[sale.type] ?? sale.type}</div>
      {(sale.floorArea || sale.rooms) && (
        <div className="text-sm text-gray-600">
          {sale.floorArea && <span>{sale.floorArea} m²</span>}
          {sale.floorArea && sale.rooms ? ' · ' : ''}
          {sale.rooms ? <span>{sale.rooms} rooms</span> : null}
        </div>
      )}
      {pricePerSqm && (
        <div className="text-xs text-gray-500">{formatPrice(pricePerSqm)}/m²</div>
      )}
      {sale.energyRating && (
        <div className="text-xs text-gray-500">EPC: {sale.energyRating}</div>
      )}
      <div className="text-xs text-gray-500">{sale.address}</div>
      <div className="text-xs text-gray-500">{sale.postcode}</div>
      <div className="text-xs text-gray-400">{sale.date}</div>
      <div className="mt-1 flex gap-2 text-[10px]">
        <a
          href={rightmoveUrl(sale.postcode)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Rightmove
        </a>
        <a
          href={zooplaUrl(sale.postcode)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Zoopla
        </a>
        <a
          href={googleMapsUrl(sale.lat, sale.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Map
        </a>
      </div>
    </div>
  );
}

export function ComparePanel() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [a, b] = state.compare;

  if (!a && !b) return null;

  const diff = a && b ? b.price - a.price : null;
  const diffPct = a && b && a.price > 0 ? ((b.price - a.price) / a.price) * 100 : null;

  return (
    <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Compare Properties</h3>
        <button
          onClick={() => dispatch({ type: 'CLEAR_COMPARE' })}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Clear
        </button>
      </div>
      <div className="flex gap-3">
        <SaleCard sale={a} label="Property A" />

        {a && b && diff !== null && diffPct !== null && (
          <div className="flex flex-col items-center justify-center px-2">
            <div
              className={`text-lg font-bold ${diff > 0 ? 'text-red-600' : diff < 0 ? 'text-green-600' : 'text-gray-600'}`}
            >
              {diff > 0 ? '+' : ''}
              {formatPrice(diff)}
            </div>
            <div
              className={`text-sm ${diff > 0 ? 'text-red-500' : diff < 0 ? 'text-green-500' : 'text-gray-500'}`}
            >
              {diff > 0 ? '+' : ''}
              {diffPct.toFixed(1)}%
            </div>
          </div>
        )}

        <SaleCard sale={b} label="Property B" />
      </div>
    </div>
  );
}
