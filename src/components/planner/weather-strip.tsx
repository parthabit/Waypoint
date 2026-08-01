"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { CloudSun, Droplets, Wind } from "lucide-react";
import { fetchWeather } from "@/lib/api";
import type { Stop } from "@/types";

interface WeatherStripProps {
  stop: Stop | null;
  units: "km" | "mi";
}

export function WeatherStrip({ stop, units }: WeatherStripProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["weather", stop?.id],
    queryFn: () => fetchWeather(stop!.lat, stop!.lon),
    enabled: !!stop,
  });

  if (!stop) return null;
  if (isLoading) {
    return <div className="h-16 animate-pulse rounded-xl bg-muted" />;
  }
  if (!data) return null;

  const tempUnit = units === "km" ? "°C" : "°F";
  const temp = units === "km" ? data.temperature : (data.temperature * 9) / 5 + 32;
  const wind = units === "km" ? `${Math.round(data.windSpeed)} km/h` : `${Math.round(data.windSpeed * 0.621)} mph`;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-gradient-to-br from-primary/5 to-secondary/5 px-4 py-3">
      <CloudSun className="size-8 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{stop.name}</p>
        <p className="text-xs text-muted-foreground">{data.description}</p>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="font-display text-lg font-bold text-foreground">
          {Math.round(temp)}
          {tempUnit}
        </span>
        <span className="flex items-center gap-1">
          <Droplets className="size-3.5" /> {data.humidity}%
        </span>
        <span className="flex items-center gap-1">
          <Wind className="size-3.5" /> {wind}
        </span>
      </div>
    </div>
  );
}
