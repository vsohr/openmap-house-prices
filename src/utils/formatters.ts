export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `\u00A3${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `\u00A3${(value / 1_000).toFixed(0)}K`;
  return `\u00A3${value.toFixed(0)}`;
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-GB');
}
