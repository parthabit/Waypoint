"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { MapPin, Trash2, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { deleteTrip, getSavedTrips } from "@/lib/storage";
import type { SavedTrip } from "@/types";

const PROFILE_LABEL: Record<string, string> = {
  "driving-car": "Driving",
  "foot-walking": "Walking",
  "cycling-regular": "Cycling",
};

export default function SavedTripsPage() {
  const [trips, setTrips] = React.useState<SavedTrip[]>([]);

  React.useEffect(() => {
    setTrips(getSavedTrips());
  }, []);

  function handleDelete(id: string) {
    deleteTrip(id);
    setTrips(getSavedTrips());
    toast.success("Trip deleted.");
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="font-display text-2xl font-bold">Saved trips</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Trips you save in the planner are stored on this device.
      </p>

      {trips.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <MapPin className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No saved trips yet. Build a route in the planner and hit &ldquo;Save this trip&rdquo;.
            </p>
            <Button asChild>
              <Link href="/planner">Go to planner</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-3">
          {trips.map((trip) => (
            <Card key={trip.id}>
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="font-display font-semibold">{trip.name}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {new Date(trip.createdAt).toLocaleDateString()}
                    </span>
                    <Badge variant="outline">{trip.stops.length} stops</Badge>
                    <Badge variant="secondary">{PROFILE_LABEL[trip.profile]}</Badge>
                    {trip.roundTrip && <Badge variant="accent">Round trip</Badge>}
                  </div>
                  <p className="mt-2 truncate text-xs text-muted-foreground">
                    {trip.stops.map((s) => s.name).join(" → ")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(trip.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                  <Button asChild size="sm">
                    <Link href={`/planner?loadTrip=${trip.id}`}>
                      Open <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
