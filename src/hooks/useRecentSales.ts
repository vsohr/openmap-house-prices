import { useState, useEffect, useRef } from 'react';
import type { RecentSale, GeocodedSale } from '../types/sales';

const salesCache = new Map<string, GeocodedSale[]>();

/** Bulk geocode postcodes via postcodes.io (max 100 per request) */
async function bulkGeocode(
  postcodes: string[]
): Promise<Map<string, { lat: number; lng: number }>> {
  const results = new Map<string, { lat: number; lng: number }>();
  const unique = [...new Set(postcodes)];

  // postcodes.io accepts max 100 per batch
  for (let i = 0; i < unique.length; i += 100) {
    const batch = unique.slice(i, i + 100);
    try {
      const res = await fetch('https://api.postcodes.io/postcodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postcodes: batch }),
      });
      if (!res.ok) continue;
      const json = await res.json();
      if (json.status !== 200 || !Array.isArray(json.result)) continue;

      for (const item of json.result) {
        if (item.result) {
          results.set(item.query, {
            lat: item.result.latitude,
            lng: item.result.longitude,
          });
        }
      }
    } catch {
      // Skip failed batches
    }
  }

  return results;
}

export function useRecentSales(districtCode: string | null) {
  const [sales, setSales] = useState<GeocodedSale[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!districtCode) {
      setSales([]);
      setLoading(false);
      return;
    }

    const cached = salesCache.get(districtCode);
    if (cached) {
      setSales(cached);
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    fetch(`/data/sales/${districtCode}.json`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<RecentSale[]>;
      })
      .then(async (rawSales) => {
        if (controller.signal.aborted) return;

        const coords = await bulkGeocode(rawSales.map((s) => s.postcode));
        if (controller.signal.aborted) return;

        const geocoded: GeocodedSale[] = [];
        for (const sale of rawSales) {
          const loc = coords.get(sale.postcode);
          if (loc) {
            geocoded.push({ ...sale, lat: loc.lat, lng: loc.lng });
          }
        }

        salesCache.set(districtCode, geocoded);
        setSales(geocoded);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [districtCode]);

  return { sales, loading };
}
