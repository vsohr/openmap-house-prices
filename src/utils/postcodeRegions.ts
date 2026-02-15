import type { UkRegion, RegionalDaysToSellData } from '../types/regional';

/**
 * Maps UK postcode area prefixes (1-2 letters) to their region.
 * Source: Royal Mail postcode area boundaries / ONS regional mapping.
 */
const POSTCODE_AREA_TO_REGION: Record<string, UkRegion> = {
  // London
  E: 'London', EC: 'London', N: 'London', NW: 'London',
  SE: 'London', SW: 'London', W: 'London', WC: 'London',

  // South East
  BN: 'South East', CT: 'South East', GU: 'South East',
  HP: 'South East', ME: 'South East', MK: 'South East',
  OX: 'South East', PO: 'South East', RG: 'South East',
  RH: 'South East', SL: 'South East', SO: 'South East',
  TN: 'South East',

  // South West
  BA: 'South West', BH: 'South West', BS: 'South West',
  DT: 'South West', EX: 'South West', GL: 'South West',
  PL: 'South West', SN: 'South West', SP: 'South West',
  TA: 'South West', TQ: 'South West', TR: 'South West',

  // East of England
  AL: 'East of England', CB: 'East of England', CM: 'East of England',
  CO: 'East of England', EN: 'East of England', IG: 'East of England',
  IP: 'East of England', LU: 'East of England', NR: 'East of England',
  PE: 'East of England', RM: 'East of England', SG: 'East of England',
  SS: 'East of England',

  // West Midlands
  B: 'West Midlands', CV: 'West Midlands', DY: 'West Midlands',
  HR: 'West Midlands', ST: 'West Midlands', SY: 'West Midlands',
  TF: 'West Midlands', WR: 'West Midlands', WS: 'West Midlands',
  WV: 'West Midlands',

  // East Midlands
  DE: 'East Midlands', DN: 'East Midlands', LE: 'East Midlands',
  LN: 'East Midlands', NG: 'East Midlands', NN: 'East Midlands',

  // North West
  BB: 'North West', BL: 'North West', CA: 'North West',
  CH: 'North West', CW: 'North West', FY: 'North West',
  L: 'North West', LA: 'North West', M: 'North West',
  OL: 'North West', PR: 'North West', SK: 'North West',
  WA: 'North West', WN: 'North West',

  // North East
  DH: 'North East', DL: 'North East', NE: 'North East',
  SR: 'North East', TS: 'North East',

  // Yorkshire & The Humber
  BD: 'Yorkshire & The Humber', HD: 'Yorkshire & The Humber',
  HG: 'Yorkshire & The Humber', HU: 'Yorkshire & The Humber',
  HX: 'Yorkshire & The Humber', LS: 'Yorkshire & The Humber',
  S: 'Yorkshire & The Humber', WF: 'Yorkshire & The Humber',
  YO: 'Yorkshire & The Humber',

  // Wales
  CF: 'Wales', LD: 'Wales', LL: 'Wales', NP: 'Wales', SA: 'Wales',

  // Scotland
  AB: 'Scotland', DD: 'Scotland', DG: 'Scotland',
  EH: 'Scotland', FK: 'Scotland', G: 'Scotland',
  HS: 'Scotland', IV: 'Scotland', KA: 'Scotland',
  KW: 'Scotland', KY: 'Scotland', ML: 'Scotland',
  PA: 'Scotland', PH: 'Scotland', TD: 'Scotland',
  ZE: 'Scotland',
};

/**
 * Extract the postcode area (letter prefix) from a district code.
 * E.g. "SW1" → "SW", "M1" → "M", "LS1" → "LS"
 */
function extractPostcodeArea(districtCode: string): string {
  const match = districtCode.match(/^([A-Z]+)/i);
  return match ? match[1].toUpperCase() : districtCode.toUpperCase();
}

/** Look up the UK region for a given postcode district code. */
export function getRegionForDistrict(districtCode: string): UkRegion | null {
  const area = extractPostcodeArea(districtCode);
  return POSTCODE_AREA_TO_REGION[area] ?? null;
}

/** Look up average days to sell for a district code using regional data. */
export function getDaysToSellForDistrict(
  districtCode: string,
  regionalData: RegionalDaysToSellData | null,
): number | null {
  if (!regionalData) return null;
  const region = getRegionForDistrict(districtCode);
  if (!region) return null;
  const entry = regionalData.regions.find((r) => r.region === region);
  return entry?.avgDaysToSell ?? null;
}
