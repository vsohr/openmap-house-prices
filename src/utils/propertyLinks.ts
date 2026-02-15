/** Build search URLs for external property sites */

export function rightmoveUrl(postcode: string): string {
  const formatted = postcode.trim().replace(/\s+/g, '-');
  return `https://www.rightmove.co.uk/house-prices/${formatted}.html`;
}

export function zooplaUrl(postcode: string): string {
  const formatted = postcode.trim().replace(/\s+/g, '-');
  return `https://www.zoopla.co.uk/house-prices/${formatted}/`;
}

export function googleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/@${lat},${lng},18z`;
}

export function googleStreetViewUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
}
