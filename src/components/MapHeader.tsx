import { useAppDispatch } from '../context/AppContext';
import { useState, useCallback, useMemo } from 'react';
import type { DistrictCollection } from '../types';

interface MapHeaderProps {
  data: DistrictCollection | null;
}

/** Extract postcode district from a full postcode, e.g. "SW1A 1AA" -> "SW1A", "E1 6AN" -> "E1" */
function extractDistrict(postcode: string): string {
  const trimmed = postcode.trim().toUpperCase();
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return parts[0];
  }
  // No space - outward code is everything except last 3 chars
  if (trimmed.length > 3) {
    return trimmed.slice(0, -3);
  }
  return trimmed;
}

/** Check if input looks like a full UK postcode (has both outward + inward parts) */
function isFullPostcode(value: string): boolean {
  const trimmed = value.trim();
  // Full postcode: "SW1A 1AA" or "SW1A1AA" - at least 5 chars with letters and numbers
  return /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(trimmed);
}

interface PostcodeResult {
  postcode: string;
  outcode: string; // district code
  latitude: number;
  longitude: number;
}

async function lookupPostcode(postcode: string): Promise<PostcodeResult | null> {
  try {
    const encoded = encodeURIComponent(postcode.trim());
    const res = await fetch(`https://api.postcodes.io/postcodes/${encoded}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (json.status !== 200 || !json.result) return null;
    return {
      postcode: json.result.postcode,
      outcode: json.result.outcode,
      latitude: json.result.latitude,
      longitude: json.result.longitude,
    };
  } catch {
    return null;
  }
}

async function autocompletePostcode(partial: string): Promise<string[]> {
  try {
    const encoded = encodeURIComponent(partial.trim());
    const res = await fetch(`https://api.postcodes.io/postcodes/${encoded}/autocomplete`);
    if (!res.ok) return [];
    const json = await res.json();
    if (json.status !== 200 || !json.result) return [];
    return json.result.slice(0, 6);
  } catch {
    return [];
  }
}

export function MapHeader({ data }: MapHeaderProps) {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ label: string; type: 'district' | 'postcode' }[]>([]);
  const [searching, setSearching] = useState(false);

  const districtCodes = useMemo(() => {
    if (!data) return [];
    return data.features.map((f) => f.properties.code).sort();
  }, [data]);

  const selectDistrict = useCallback(
    (code: string) => {
      setQuery(code);
      setSuggestions([]);
      dispatch({ type: 'SELECT_DISTRICT', code });
    },
    [dispatch]
  );

  const handleChange = useCallback(
    async (value: string) => {
      setQuery(value);
      const trimmed = value.trim();

      if (trimmed.length === 0) {
        setSuggestions([]);
        return;
      }

      const upper = trimmed.toUpperCase();

      // Match district codes first
      const districtMatches = districtCodes
        .filter((c) => c.startsWith(upper))
        .slice(0, 4)
        .map((c) => ({ label: c, type: 'district' as const }));

      setSuggestions(districtMatches);

      // If input is 3+ chars, also fetch postcode autocomplete
      if (trimmed.length >= 3) {
        const postcodes = await autocompletePostcode(trimmed);
        const postcodeItems = postcodes.map((p) => ({ label: p, type: 'postcode' as const }));

        setSuggestions((prev) => {
          // Merge district matches with postcode suggestions, deduplicate
          const combined = [...prev.filter((s) => s.type === 'district'), ...postcodeItems];
          return combined.slice(0, 8);
        });
      }
    },
    [districtCodes]
  );

  const handleSelect = useCallback(
    async (label: string, type: 'district' | 'postcode') => {
      setSuggestions([]);

      if (type === 'district') {
        selectDistrict(label);
        return;
      }

      // Full postcode - look it up to get coordinates and fly there
      setSearching(true);
      setQuery(label);
      const result = await lookupPostcode(label);
      setSearching(false);

      if (result) {
        dispatch({
          type: 'FLY_TO',
          lat: result.latitude,
          lng: result.longitude,
          zoom: 14,
          district: result.outcode,
        });
      }
    },
    [dispatch]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim().toUpperCase();

      if (trimmed.length === 0) return;

      // Check if it's a known district code
      if (districtCodes.includes(trimmed)) {
        selectDistrict(trimmed);
        return;
      }

      // Check if it's a district extracted from partial input
      const district = extractDistrict(trimmed);
      if (districtCodes.includes(district)) {
        selectDistrict(district);
        return;
      }

      // Try full postcode lookup - fly to exact coordinates
      if (isFullPostcode(trimmed)) {
        setSearching(true);
        const result = await lookupPostcode(trimmed);
        setSearching(false);
        if (result) {
          dispatch({
            type: 'FLY_TO',
            lat: result.latitude,
            lng: result.longitude,
            zoom: 14,
            district: result.outcode,
          });
        }
      }
    },
    [query, districtCodes, selectDistrict, dispatch]
  );

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 shadow-sm">
      <h1 className="text-lg font-bold text-gray-900">UK House Price Map</h1>
      <div className="flex items-center gap-4">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search postcode e.g. SW1A 1AA"
            className="w-56 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {searching && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              ...
            </span>
          )}
          {suggestions.length > 0 && (
            <ul className="absolute right-0 z-50 mt-1 max-h-64 w-56 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
              {suggestions.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item.label, item.type)}
                    className="flex w-full items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-blue-50"
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] text-gray-400">
                      {item.type === 'district' ? 'District' : 'Postcode'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>
      </div>
    </header>
  );
}
