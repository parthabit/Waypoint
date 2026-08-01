import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format seconds into a human duration like "1h 24m" or "38 min" */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || Number.isNaN(seconds)) return "—";
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** Format meters into "1.2 km" or "480 m" */
export function formatDistance(meters: number | null | undefined): string {
  if (meters == null || Number.isNaN(meters)) return "—";
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

/** Rough fuel cost estimate: distance in meters, price per liter, avg consumption L/100km */
export function estimateFuelCost(
  meters: number,
  litersPer100km = 7,
  pricePerLiter = 100
): number {
  const km = meters / 1000;
  const liters = (km / 100) * litersPer100km;
  return Math.round(liters * pricePerLiter);
}

/** Rough CO2 estimate in kg for a car trip (avg ~0.121 kg CO2 per km) */
export function estimateCarbonKg(meters: number): number {
  const km = meters / 1000;
  return Math.round(km * 0.121 * 10) / 10;
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}
