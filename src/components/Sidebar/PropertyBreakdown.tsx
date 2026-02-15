import type { DistrictTrend, PropertyType } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';

interface PropertyBreakdownProps {
  trend: DistrictTrend;
}

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  D: 'Detached',
  S: 'Semi-detached',
  T: 'Terraced',
  F: 'Flat/Maisonette',
  O: 'Other',
};

const TYPE_ORDER: PropertyType[] = ['D', 'S', 'T', 'F', 'O'];

export function PropertyBreakdown({ trend }: PropertyBreakdownProps) {
  const latest = trend.years[trend.years.length - 1];
  if (!latest) return null;

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-gray-700">
        By Property Type ({latest.year})
      </h3>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="pb-1">Type</th>
            <th className="pb-1 text-right">Avg Price</th>
            <th className="pb-1 text-right">Count</th>
          </tr>
        </thead>
        <tbody>
          {TYPE_ORDER.map((pType) => {
            const data = latest.byType[pType];
            if (!data || data.count === 0) return null;
            return (
              <tr key={pType} className="border-b border-gray-100">
                <td className="py-1 text-gray-700">
                  {PROPERTY_TYPE_LABELS[pType]}
                </td>
                <td className="py-1 text-right font-medium text-gray-900">
                  {formatCurrency(data.avgPrice)}
                </td>
                <td className="py-1 text-right text-gray-600">
                  {formatNumber(data.count)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
