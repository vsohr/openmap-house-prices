import { useAppState, useAppDispatch } from '../../context/AppContext';
import type { PropertyType } from '../../types';

const PROPERTY_TYPE_LABELS: Record<PropertyType | 'all', string> = {
  all: 'All Types',
  D: 'Detached',
  S: 'Semi-detached',
  T: 'Terraced',
  F: 'Flat/Maisonette',
  O: 'Other',
};

const FILTER_OPTIONS = Object.entries(PROPERTY_TYPE_LABELS) as [PropertyType | 'all', string][];

export function FilterBar() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-wrap items-center gap-4 border-t border-gray-200 bg-white px-4 py-2">
      {/* Property type filter */}
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <span>Filter:</span>
        <select
          value={state.propertyTypeFilter}
          onChange={(e) =>
            dispatch({
              type: 'SET_PROPERTY_FILTER',
              filter: e.target.value as PropertyType | 'all',
            })
          }
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
        >
          {FILTER_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      {/* Year range - From */}
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <span>From:</span>
        <input
          type="range"
          min={1995}
          max={2025}
          value={state.yearRange[0]}
          onChange={(e) =>
            dispatch({
              type: 'SET_YEAR_RANGE',
              range: [parseInt(e.target.value, 10), state.yearRange[1]],
            })
          }
          className="w-24"
        />
        <span className="w-10 text-xs font-medium">{state.yearRange[0]}</span>
      </label>

      {/* Year range - To */}
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <span>To:</span>
        <input
          type="range"
          min={1995}
          max={2025}
          value={state.yearRange[1]}
          onChange={(e) =>
            dispatch({
              type: 'SET_YEAR_RANGE',
              range: [state.yearRange[0], parseInt(e.target.value, 10)],
            })
          }
          className="w-24"
        />
        <span className="w-10 text-xs font-medium">{state.yearRange[1]}</span>
      </label>
    </div>
  );
}
