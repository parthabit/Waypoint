"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { CloudSun, MapPin } from "lucide-react";
import { fetchWeather, reverseGeocode } from "@/lib/api";

export function HomeWeather() {
  const [coords, setCoords] = React.useState<{ lat: number; lon: number } | null>(null);
  const [denied, setDenied] = React.useState(false);

  React.useEffect(() => {
    if (!navigator.geolocation) {
      setDenied(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setDenied(true),
      { timeout: 6000 }
    );
  }, []);

  const { data: weather } = useQuery({
    queryKey: ["home-weather", coords?.lat, coords?.lon],
    queryFn: () => fetchWeather(coords!.lat, coords!.lon),
    enabled: !!coords,
  });

  const { data: placeName } = useQuery({
    queryKey: ["home-place", coords?.lat, coords?.lon],
    queryFn: () => reverseGeocode(coords!.lat, coords!.lon),
    enabled: !!coords,
  });

  if (denied || !coords || !weather) return null;

  return (
    <div className="mx-auto mt-6 flex w-fit items-center gap-3 rounded-full border border-border bg-card/80 px-5 py-2.5 text-sm shadow-sm backdrop-blur">
      <CloudSun className="size-4 text-primary" />
      <span className="font-semibold">{Math.round(weather.temperature)}°C</span>
      <span className="text-muted-foreground">{weather.description}</span>
      {placeName && (
        <span className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="size-3.5" /> {placeName}
        </span>
      )}
    </div>
  );
}
