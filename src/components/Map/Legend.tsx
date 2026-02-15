import { formatPercent } from '../../utils/formatters';
import { growthToColor } from '../../utils/colors';

const GROWTH_STOPS = [-10, -5, 0, 5, 10];

export function Legend() {
  return (
    <div className="absolute bottom-6 left-6 z-[1000] rounded-lg bg-white p-3 shadow-md">
      <h4 className="mb-1 text-xs font-semibold text-gray-700">Year-over-Year Change</h4>
      <p className="mb-2 max-w-[180px] text-[10px] leading-tight text-gray-500">
        Average price change vs previous year
      </p>
      <div className="flex flex-col gap-1">
        {GROWTH_STOPS.map((value) => {
          const label =
            value < 0 ? 'Prices fell' : value === 0 ? 'No change' : 'Prices rose';
          return (
            <div key={value} className="flex items-center gap-2">
              <div
                className="h-4 w-6 rounded-sm"
                style={{ backgroundColor: growthToColor(value) }}
              />
              <span className="text-xs text-gray-600">
                {formatPercent(value)} {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
