"use client";

import * as React from "react";
import { Loader2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchNearby } from "@/lib/api";
import { formatDistance } from "@/lib/utils";
import type { NearbyPlace, Stop } from "@/types";

const CATEGORIES = [
  { value: "restaurant", label: "Restaurants" },
  { value: "cafe", label: "Cafes" },
  { value: "hotel", label: "Hotels" },
  { value: "museum", label: "Museums" },
  { value: "hospital", label: "Hospitals" },
  { value: "parking", label: "Parking" },
  { value: "atm", label: "ATMs" },
  { value: "fuel", label: "Gas stations" },
  { value: "charging_station", label: "EV charging" },
  { value: "shopping", label: "Shopping malls" },
  { value: "nightlife", label: "Nightlife" },
];

interface NearbyPlacesProps {
  around: Stop | null;
  onAddStop: (stop: Stop) => void;
}

export function NearbyPlaces({ around, onAddStop }: NearbyPlacesProps) {
  const [category, setCategory] = React.useState("restaurant");
  const [loading, setLoading] = React.useState(false);
  const [places, setPlaces] = React.useState<NearbyPlace[]>([]);
  const [searched, setSearched] = React.useState(false);

  async function search() {
    if (!around) return;
    setLoading(true);
    setSearched(true);
    try {
      const results = await fetchNearby(around.lat, around.lon, category);
      setPlaces(results);
    } catch {
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }

  if (!around) {
    return (
      <p className="text-sm text-muted-foreground">
        Add a stop first, then come back here to find restaurants, hotels, and other places
        nearby.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Searching near <span className="font-medium text-foreground">{around.name}</span>
      </p>
      <div className="flex gap-2">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={search} disabled={loading} size="icon" variant="outline">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
        </Button>
      </div>

      {searched && !loading && places.length === 0 && (
        <p className="text-sm text-muted-foreground">No results found nearby.</p>
      )}

      {places.length > 0 && (
        <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {places.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{formatDistance(p.distanceMeters)} away</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                title="Add as a stop"
                onClick={() =>
                  onAddStop({
                    id: crypto.randomUUID(),
                    name: p.name,
                    lat: p.lat,
                    lon: p.lon,
                    category: p.category,
                  })
                }
              >
                <Plus className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
