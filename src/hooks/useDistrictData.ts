import { useState, useEffect } from 'react';
import type { DistrictCollection } from '../types';

export function useDistrictData() {
  const [data, setData] = useState<DistrictCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch('/data/districts-summary.geojson');
        if (!response.ok) {
          throw new Error(`Failed to load district data: ${response.status}`);
        }
        const geojson: DistrictCollection = await response.json();
        if (!cancelled) {
          setData(geojson);
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
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
