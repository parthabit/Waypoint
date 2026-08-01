export interface Stop {
  id: string;
  name: string;
  address?: string;
  lat: number;
  lon: number;
  category?: string;
}

export type TravelProfile = "driving-car" | "foot-walking" | "cycling-regular";

export interface RouteLeg {
  distance: number; // meters
  duration: number; // seconds
}

export interface ElevationSummary {
  ascent: number;
  descent: number;
}

export interface DirectionStep {
  instruction: string;
  distance: number;
  duration: number;
}

export interface OptimizedRoute {
  order: Stop[];
  totalDistance: number;
  totalDuration: number;
  geometry: [number, number][]; // [lat, lon][]
  legs: RouteLeg[];
  elevation?: ElevationSummary;
  steps?: DirectionStep[];
  profile: TravelProfile;
  usedFallback: boolean; // true if computed via straight-line haversine, not real roads
}

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  humidity: number;
  code: number;
  description: string;
  isDay: boolean;
  sunrise?: string;
  sunset?: string;
  daily?: {
    date: string;
    tempMax: number;
    tempMin: number;
    code: number;
  }[];
}

export interface NearbyPlace {
  id: string;
  name: string;
  category: string;
  lat: number;
  lon: number;
  distanceMeters?: number;
}

export interface SavedTrip {
  id: string;
  name: string;
  createdAt: string;
  stops: Stop[];
  profile: TravelProfile;
  roundTrip: boolean;
}
