"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Car, Footprints, Bike, Save, RotateCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LocationSearch } from "@/components/planner/location-search";
import { StopList } from "@/components/planner/stop-list";
import { RouteSummary } from "@/components/planner/route-summary";
import { TurnByTurn } from "@/components/planner/turn-by-turn";
import { NearbyPlaces } from "@/components/planner/nearby-places";
import { WeatherStrip } from "@/components/planner/weather-strip";
import { geocode, optimizeRoute } from "@/lib/api";
import { getFavorites, getSavedTrips, getSettings, saveTrip, toggleFavorite as toggleFavoriteStorage } from "@/lib/storage";
import type { OptimizedRoute, Stop, TravelProfile } from "@/types";

const TripMap = dynamic(() => import("@/components/map/trip-map").then((m) => m.TripMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-muted" />,
});

const PROFILES: { value: TravelProfile; label: string; icon: React.ElementType }[] = [
  { value: "driving-car", label: "Driving", icon: Car },
  { value: "foot-walking", label: "Walking", icon: Footprints },
  { value: "cycling-regular", label: "Cycling", icon: Bike },
];

function PlannerPageInner() {
  const searchParams = useSearchParams();
  const [stops, setStops] = React.useState<Stop[]>([]);
  const [profile, setProfile] = React.useState<TravelProfile>("driving-car");
  const [roundTrip, setRoundTrip] = React.useState(false);
  const [route, setRoute] = React.useState<OptimizedRoute | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [favoriteIds, setFavoriteIds] = React.useState<Set<string>>(new Set());
  const settings = React.useMemo(() => (typeof window !== "undefined" ? getSettings() : undefined), []);

  React.useEffect(() => {
    setFavoriteIds(new Set(getFavorites().map((f) => f.id)));
  }, []);

  // Handle links coming from the home page (?name=&lat=&lon= or ?q=) or
  // from the Saved Trips page (?loadTrip=<id>)
  const consumedParams = React.useRef(false);
  React.useEffect(() => {
    if (consumedParams.current) return;
    consumedParams.current = true;

    const loadTripId = searchParams.get("loadTrip");
    if (loadTripId) {
      const trip = getSavedTrips().find((t) => t.id === loadTripId);
      if (trip) {
        setStops(trip.stops);
        setProfile(trip.profile);
        setRoundTrip(trip.roundTrip);
        toast.success(`Loaded "${trip.name}"`);
      }
      return;
    }

    const name = searchParams.get("name");
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    if (name && lat && lon) {
      setStops([{ id: crypto.randomUUID(), name, lat: parseFloat(lat), lon: parseFloat(lon) }]);
      return;
    }

    const q = searchParams.get("q");
    if (q) {
      geocode(q).then((results) => {
        if (results[0]) {
          const r = results[0];
          setStops([{ id: crypto.randomUUID(), name: r.name, lat: r.lat, lon: r.lon }]);
        }
      });
    }
  }, [searchParams]);

  const displayStops = route ? route.order : stops;

  function markDirty() {
    setRoute(null);
  }

  function addStop(stop: Stop) {
    if (stops.length >= 12) {
      toast.error("Maximum 12 stops supported.");
      return;
    }
    setStops((prev) => [...prev, stop]);
    markDirty();
  }

  function removeStop(id: string) {
    setStops((prev) => prev.filter((s) => s.id !== id));
    markDirty();
  }

  function reorderStops(next: Stop[]) {
    setStops(next);
    markDirty();
  }

  function handleToggleFavorite(stop: Stop) {
    const next = toggleFavoriteStorage(stop);
    setFavoriteIds(new Set(next.map((f) => f.id)));
  }

  async function handleOptimize() {
    if (stops.length < 2) {
      toast.error("Add at least 2 stops first.");
      return;
    }
    setLoading(true);
    try {
      const result = await optimizeRoute(stops, profile, roundTrip);
      setRoute(result);
      if (result.usedFallback) {
        toast.warning("Optimized using straight-line estimates (no ORS API key configured).");
      } else {
        toast.success(`Route optimized across ${result.order.length} stops.`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not optimize route.");
    } finally {
      setLoading(false);
    }
  }

  function handleSaveTrip() {
    const name = window.prompt("Name this trip:", "My trip");
    if (!name) return;
    saveTrip({
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      stops: displayStops,
      profile,
      roundTrip,
    });
    toast.success("Trip saved.");
  }

  const legs = route
    ? route.order.map((_, i) =>
        i === 0
          ? { distance: null, duration: null }
          : { distance: route.legs[i - 1]?.distance ?? null, duration: route.legs[i - 1]?.duration ?? null }
      )
    : undefined;

  return (
    <div className="mx-auto grid h-[calc(100vh-4rem)] max-w-[1600px] grid-cols-1 lg:grid-cols-[420px_1fr]">
      {/* Sidebar */}
      <div className="flex h-full flex-col overflow-y-auto border-r border-border bg-background p-5">
        <div className="mb-5">
          <h1 className="font-display text-xl font-bold">Trip Planner</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add stops, then optimize for the shortest route.
          </p>
        </div>

        <LocationSearch onAdd={addStop} disabled={loading} />

        <div className="my-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Stops ({stops.length})
          </p>
          <StopList
            stops={displayStops}
            onReorder={reorderStops}
            onRemove={removeStop}
            optimized={!!route}
            legs={legs}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>

        <div className="space-y-3 border-t border-border pt-4">
          <Tabs value={profile} onValueChange={(v) => { setProfile(v as TravelProfile); markDirty(); }}>
            <TabsList className="grid w-full grid-cols-3">
              {PROFILES.map((p) => (
                <TabsTrigger key={p.value} value={p.value} className="gap-1.5">
                  <p.icon className="size-3.5" /> {p.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center justify-between">
            <Label htmlFor="roundtrip" className="text-sm text-muted-foreground">
              Round trip (return to start)
            </Label>
            <Switch
              id="roundtrip"
              checked={roundTrip}
              onCheckedChange={(v) => {
                setRoundTrip(v);
                markDirty();
              }}
            />
          </div>

          <Button className="w-full" size="lg" onClick={handleOptimize} disabled={loading || stops.length < 2}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <RotateCw className="size-4" />}
            {route ? "Re-optimize route" : "Optimize route"}
          </Button>

          {route && (
            <Button variant="outline" className="w-full" onClick={handleSaveTrip}>
              <Save className="size-4" /> Save this trip
            </Button>
          )}
        </div>

        {route && settings && (
          <div className="mt-5 space-y-4 border-t border-border pt-4">
            <RouteSummary route={route} settings={settings} />
            <TurnByTurn steps={route.steps ?? []} />
          </div>
        )}

        {settings && (
          <div className="mt-5 space-y-3 border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Weather at first stop
            </p>
            <WeatherStrip stop={displayStops[0] ?? null} units={settings.units} />
          </div>
        )}

        <Card className="mt-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Find places nearby</CardTitle>
          </CardHeader>
          <CardContent>
            <NearbyPlaces around={displayStops[0] ?? null} onAddStop={addStop} />
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <div className="h-[50vh] p-4 lg:h-full">
        <TripMap
          stops={displayStops}
          routeGeometry={route?.geometry}
          optimized={!!route}
          onLocateResult={(lat, lon) => addStop({ id: crypto.randomUUID(), name: "My location", lat, lon })}
        />
      </div>
    </div>
  );
}

export default function PlannerPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PlannerPageInner />
    </React.Suspense>
  );
}
