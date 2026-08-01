import { NextRequest, NextResponse } from "next/server";
import { haversineMatrix } from "@/lib/geo";

// Average speeds (km/h) used only for the no-API-key fallback estimate.
const FALLBACK_SPEED_KMH: Record<string, number> = {
  "driving-car": 35,
  "foot-walking": 5,
  "cycling-regular": 15,
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const coordinates: [number, number][] = body.coordinates; // [lon, lat][]
  const profile: string = body.profile || "driving-car";

  if (!coordinates || coordinates.length < 2) {
    return NextResponse.json({ error: "At least 2 coordinates are required" }, { status: 400 });
  }

  const apiKey = process.env.ORS_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch(`https://api.openrouteservice.org/v2/matrix/${profile}`, {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locations: coordinates,
          metrics: ["distance", "duration"],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          distances: data.distances,
          durations: data.durations,
          usedFallback: false,
        });
      }
      // fall through to haversine fallback on non-OK response
    } catch {
      // fall through to fallback
    }
  }

  // --- Fallback: straight-line distance + assumed average speed ---
  const points = coordinates.map(([lon, lat]) => ({ lat, lon }));
  const distances = haversineMatrix(points);
  const speedMps = (FALLBACK_SPEED_KMH[profile] ?? 30) / 3.6;
  const durations = distances.map((row) => row.map((d) => d / speedMps));

  return NextResponse.json({ distances, durations, usedFallback: true });
}
