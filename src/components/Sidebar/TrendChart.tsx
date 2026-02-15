import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { DistrictTrend } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useAppState } from '../../context/AppContext';

interface TrendChartProps {
  trend: DistrictTrend;
}

export function TrendChart({ trend }: TrendChartProps) {
  const state = useAppState();
  const [minYear, maxYear] = state.yearRange;

  const chartData = trend.years
    .filter((y) => y.year >= minYear && y.year <= maxYear)
    .map((y) => ({
      year: y.year,
      avgPrice: y.avgPrice,
      medianPrice: y.medianPrice,
    }));

  if (chartData.length === 0) {
    return <p className="text-xs text-gray-400">No data in selected range</p>;
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-gray-700">Price Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis
            tickFormatter={formatCurrency}
            width={55}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(value: number | undefined) => value != null ? formatCurrency(value) : ''}
            labelFormatter={(label) => `Year: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="avgPrice"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            name="Average"
          />
          <Line
            type="monotone"
            dataKey="medianPrice"
            stroke="#9333ea"
            strokeWidth={2}
            dot={false}
            name="Median"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
