export function clamp(min: number, max: number, value: number): number {
  return Math.max(min, Math.min(max, value));
}
