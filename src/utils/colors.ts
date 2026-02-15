export function growthToColor(growth: number): string {
  // Blue (negative) -> White (zero) -> Red (positive)
  const clamped = Math.min(20, Math.max(-20, growth));
  const ratio = (clamped + 20) / 40;
  if (ratio < 0.5) {
    const intensity = Math.round(255 * (ratio * 2));
    return `rgb(${intensity}, ${intensity}, 255)`;
  } else {
    const intensity = Math.round(255 * (1 - (ratio - 0.5) * 2));
    return `rgb(255, ${intensity}, ${intensity})`;
  }
}
