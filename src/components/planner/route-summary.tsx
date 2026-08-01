"use client";

import { Clock, Route, TrendingUp, Fuel, Leaf, TriangleAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { OptimizedRoute } from "@/types";
import { estimateCarbonKg, estimateFuelCost, formatDistance, formatDuration } from "@/lib/utils";
import type { Settings } from "@/lib/storage";

interface RouteSummaryProps {
  route: OptimizedRoute;
  settings: Settings;
}

export function RouteSummary({ route, settings }: RouteSummaryProps) {
  const avgSpeedKmh = route.totalDuration > 0
    ? Math.round((route.totalDistance / 1000) / (route.totalDuration / 3600))
    : 0;

  const isDriving = route.profile === "driving-car";

  return (
    <div className="space-y-3">
      {route.usedFallback && (
        <div className="flex items-start gap-2 rounded-lg border border-accent/30 bg-accent/10 p-3 text-xs text-accent-foreground">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-accent" />
          <span>
            Showing straight-line estimates — add a free OpenRouteService API key to{" "}
            <code className="rounded bg-black/10 px-1 py-0.5">.env.local</code> for real
            road-based routing, turn-by-turn directions, and elevation.
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <Route className="size-3.5" /> Distance
            </div>
            <p className="mt-1.5 font-display text-2xl font-bold">
              {formatDistance(route.totalDistance)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <Clock className="size-3.5" /> Time
            </div>
            <p className="mt-1.5 font-display text-2xl font-bold text-primary">
              {formatDuration(route.totalDuration)}
            </p>
          </CardContent>
        </Card>

        {route.elevation && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <TrendingUp className="size-3.5" /> Elevation
              </div>
              <p className="mt-1.5 font-display text-lg font-bold">
                +{route.elevation.ascent}m <span className="text-muted-foreground">/</span> -
                {route.elevation.descent}m
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Avg. speed
            </div>
            <p className="mt-1.5 font-display text-lg font-bold">{avgSpeedKmh} km/h</p>
          </CardContent>
        </Card>

        {isDriving && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <Fuel className="size-3.5" /> Est. fuel cost
                </div>
                <p className="mt-1.5 font-display text-lg font-bold">
                  {settings.currency}{" "}
                  {estimateFuelCost(route.totalDistance, 7, settings.fuelPricePerLiter * 100)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <Leaf className="size-3.5" /> Est. CO₂
                </div>
                <p className="mt-1.5 font-display text-lg font-bold">
                  {estimateCarbonKg(route.totalDistance)} kg
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Badge variant={route.usedFallback ? "outline" : "secondary"}>
        {route.usedFallback ? "Straight-line estimate" : "Real road routing"} ·{" "}
        {route.order.length} stops
      </Badge>
    </div>
  );
}
