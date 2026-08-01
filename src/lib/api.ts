import type { NearbyPlace, OptimizedRoute, Stop, TravelProfile, WeatherData } from "@/types";
import { solveTsp } from "@/lib/tsp";

export interface GeocodeResult {
  name: string;
  fullAddress: string;
  lat: number;
  lon: number;
  category?: string;
}

export async function geocode(query: string): Promise<GeocodeResult[]> {
  if (query.trim().length < 2) return [];
  const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  return data.results;
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
  if (!res.ok) return "My location";
  const data = await res.json();
  return data.name;
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error("Weather request failed");
  return res.json();
}

export async function fetchNearby(
  lat: number,
  lon: number,
  category: string,
  radius = 1500
): Promise<NearbyPlace[]> {
  const res = await fetch(
    `/api/nearby?lat=${lat}&lon=${lon}&category=${category}&radius=${radius}`
  );
  if (!res.ok) throw new Error("Nearby-places request failed");
  const data = await res.json();
  return data.places;
}

interface MatrixResponse {
  distances: number[][];
  durations: number[][];
  usedFallback: boolean;
}

interface DirectionsResponse {
  geometry: [number, number][];
  totalDistance: number;
  totalDuration: number;
  legs: { distance: number; duration: number }[];
  steps: { instruction: string; distance: number; duration: number }[];
  elevation?: { ascent: number; descent: number };
  usedFallback: boolean;
}

/**
 * Full pipeline: fetch a distance matrix for all stops, solve the
 * shortest-order (TSP) locally, then fetch the real routed geometry +
 * turn-by-turn directions for that optimized order.
 */
export async function optimizeRoute(
  stops: Stop[],
  profile: TravelProfile,
  roundTrip: boolean
): Promise<OptimizedRoute> {
  if (stops.length < 2) {
    throw new Error("Add at least 2 stops to build a route");
  }

  const coordinates: [number, number][] = stops.map((s) => [s.lon, s.lat]);

  const matrixRes = await fetch("/api/matrix", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coordinates, profile }),
  });
  if (!matrixRes.ok) throw new Error("Could not compute distance matrix");
  const matrix: MatrixResponse = await matrixRes.json();

  const order = solveTsp(matrix.distances, { startIndex: 0, roundTrip });
  const orderedStops = order.map((i) => stops[i]);
  const routeCoordinates: [number, number][] = orderedStops.map((s) => [s.lon, s.lat]);
  if (roundTrip) routeCoordinates.push(routeCoordinates[0]);

  const directionsRes = await fetch("/api/directions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coordinates: routeCoordinates, profile }),
  });
  if (!directionsRes.ok) throw new Error("Could not compute route directions");
  const directions: DirectionsResponse = await directionsRes.json();

  return {
    order: orderedStops,
    totalDistance: directions.totalDistance,
    totalDuration: directions.totalDuration,
    geometry: directions.geometry,
    legs: directions.legs,
    elevation: directions.elevation,
    steps: directions.steps,
    profile,
    usedFallback: matrix.usedFallback || directions.usedFallback,
  };
}
