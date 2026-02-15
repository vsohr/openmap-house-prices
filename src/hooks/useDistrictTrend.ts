import { useState, useEffect, useRef } from 'react';
import type { DistrictTrend } from '../types';

/** Simple in-memory cache for fetched trend data */
const trendCache = new Map<string, DistrictTrend>();

export function useDistrictTrend(districtCode: string | null) {
  const [trend, setTrend] = useState<DistrictTrend | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!districtCode) {
      setTrend(null);
      setLoading(false);
      return;
    }

    const cached = trendCache.get(districtCode);
    if (cached) {
      setTrend(cached);
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    fetch(`/data/trends/${districtCode}.json`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<DistrictTrend>;
      })
      .then((data) => {
        trendCache.set(districtCode, data);
        setTrend(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [districtCode]);

  return { trend, loading, error };
}
