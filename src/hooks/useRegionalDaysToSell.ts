import { useState, useEffect } from 'react';
import type { RegionalDaysToSellData } from '../types/regional';

let cachedData: RegionalDaysToSellData | null = null;

export function useRegionalDaysToSell() {
  const [data, setData] = useState<RegionalDaysToSellData | null>(cachedData);
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedData) return;

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/data/regional-days-to-sell.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: RegionalDaysToSellData = await res.json();
        cachedData = json;
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}
