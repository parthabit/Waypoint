"use client";

import * as React from "react";
import { Search, Crosshair, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { geocode, reverseGeocode, type GeocodeResult } from "@/lib/api";
import type { Stop } from "@/types";
import { cn } from "@/lib/utils";

interface LocationSearchProps {
  onAdd: (stop: Stop) => void;
  disabled?: boolean;
}

export function LocationSearch({ onAdd, disabled }: LocationSearchProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<GeocodeResult[]>([]);
  const [open, setOpen] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const [locating, setLocating] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.trim().length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await geocode(query);
        setResults(r);
        setOpen(r.length > 0);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  function pick(r: GeocodeResult) {
    onAdd({
      id: crypto.randomUUID(),
      name: r.name,
      address: r.fullAddress,
      lat: r.lat,
      lon: r.lon,
      category: r.category,
    });
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const name = await reverseGeocode(latitude, longitude);
        onAdd({ id: crypto.randomUUID(), name, lat: latitude, lon: longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            disabled={disabled}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) pick(results[0]);
            }}
            placeholder="Search a place or address…"
            className="pl-9"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled || locating}
          onClick={useMyLocation}
          title="Use my current location"
        >
          <Crosshair className={cn("size-4", locating && "animate-spin")} />
        </Button>
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => pick(r)}
              className="block w-full truncate px-3.5 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {r.fullAddress}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
