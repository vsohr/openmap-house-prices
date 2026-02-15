import type { DistrictTrend } from '../../types';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/formatters';
import { useRegionalDaysToSell } from '../../hooks/useRegionalDaysToSell';
import { getDaysToSellForDistrict, getRegionForDistrict } from '../../utils/postcodeRegions';

interface DistrictSummaryProps {
  trend: DistrictTrend;
}

export function DistrictSummary({ trend }: DistrictSummaryProps) {
  const latest = trend.years[trend.years.length - 1];
  const { data: regionalData } = useRegionalDaysToSell();
  if (!latest) return null;

  const prevYear = trend.years.length >= 2
    ? trend.years[trend.years.length - 2]
    : null;

  const yoyChange = prevYear && prevYear.avgPrice > 0
    ? ((latest.avgPrice - prevYear.avgPrice) / prevYear.avgPrice) * 100
    : null;

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-gray-900">
        District: {trend.code}
      </h2>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-gray-500">Avg Price</dt>
        <dd className="font-semibold text-gray-900">
          {formatCurrency(latest.avgPrice)}
        </dd>

        <dt className="text-gray-500">Median Price</dt>
        <dd className="font-semibold text-gray-900">
          {formatCurrency(latest.medianPrice)}
        </dd>

        <dt className="text-gray-500">YoY Change</dt>
        <dd
          className={`font-semibold ${
            yoyChange !== null && yoyChange >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {yoyChange !== null ? formatPercent(yoyChange) : 'N/A'}
        </dd>

        <dt className="text-gray-500">Transactions</dt>
        <dd className="font-semibold text-gray-900">
          {formatNumber(latest.transactionCount)}
        </dd>

        <dt className="text-gray-500">Data Year</dt>
        <dd className="font-semibold text-gray-900">{latest.year}</dd>

        <dt className="text-gray-500" title="Regional average from Zoopla HPI">
          Avg Days to Sell
        </dt>
        <dd className="font-semibold text-gray-900">
          {getDaysToSellForDistrict(trend.code, regionalData) !== null ? (
            <span>
              {getDaysToSellForDistrict(trend.code, regionalData)} days
              <span className="ml-1 text-xs font-normal text-gray-400">
                ({getRegionForDistrict(trend.code)})
              </span>
            </span>
          ) : (
            'N/A'
          )}
        </dd>
      </dl>
    </div>
  );
}
