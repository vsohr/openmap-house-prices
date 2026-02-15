import { useAppState } from '../../context/AppContext';
import { useDistrictTrend } from '../../hooks/useDistrictTrend';
import { DistrictSummary } from './DistrictSummary';
import { TrendChart } from './TrendChart';
import { PropertyBreakdown } from './PropertyBreakdown';

export function Sidebar() {
  const state = useAppState();
  const { trend, loading } = useDistrictTrend(state.selectedDistrict);

  if (!state.selectedDistrict) {
    return (
      <aside className="flex h-full w-80 flex-col items-center justify-center border-l border-gray-200 bg-white p-6 text-center">
        <p className="text-sm text-gray-500">
          Click a district on the map to see details
        </p>
      </aside>
    );
  }

  if (loading) {
    return (
      <aside className="flex h-full w-80 flex-col items-center justify-center border-l border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">Loading...</p>
      </aside>
    );
  }

  if (!trend) {
    return (
      <aside className="flex h-full w-80 flex-col items-center justify-center border-l border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">No data available for this district</p>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-80 flex-col gap-4 overflow-y-auto border-l border-gray-200 bg-white p-4">
      <DistrictSummary trend={trend} />
      <TrendChart trend={trend} />
      <PropertyBreakdown trend={trend} />
    </aside>
  );
}
