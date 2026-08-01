import type { SavedTrip, Stop } from "@/types";

const TRIPS_KEY = "waypoint:trips";
const FAVORITES_KEY = "waypoint:favorites";
const SETTINGS_KEY = "waypoint:settings";

export interface Settings {
  units: "km" | "mi";
  currency: string;
  fuelPricePerLiter: number;
}

export const DEFAULT_SETTINGS: Settings = {
  units: "km",
  currency: "USD",
  fuelPricePerLiter: 1.2,
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

export function getSavedTrips(): SavedTrip[] {
  return read<SavedTrip[]>(TRIPS_KEY, []);
}

export function saveTrip(trip: SavedTrip) {
  const trips = getSavedTrips().filter((t) => t.id !== trip.id);
  write(TRIPS_KEY, [trip, ...trips]);
}

export function deleteTrip(id: string) {
  write(
    TRIPS_KEY,
    getSavedTrips().filter((t) => t.id !== id)
  );
}

export function getFavorites(): Stop[] {
  return read<Stop[]>(FAVORITES_KEY, []);
}

export function toggleFavorite(stop: Stop) {
  const favorites = getFavorites();
  const exists = favorites.some((f) => f.id === stop.id);
  const next = exists ? favorites.filter((f) => f.id !== stop.id) : [...favorites, stop];
  write(FAVORITES_KEY, next);
  return next;
}

export function getSettings(): Settings {
  return read<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export function saveSettings(settings: Settings) {
  write(SETTINGS_KEY, settings);
}
