import { NextRequest, NextResponse } from "next/server";
import { haversineMeters } from "@/lib/geo";

const FALLBACK_SPEED_KMH: Record<string, number> = {
  "driving-car": 35,
  "foot-walking": 5,
  "cycling-regular": 15,
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const coordinates: [number, number][] = body.coordinates; // [lon, lat][] in visit order
  const profile: string = body.profile || "driving-car";

  if (!coordinates || coordinates.length < 2) {
    return NextResponse.json({ error: "At least 2 coordinates are required" }, { status: 400 });
  }

  const apiKey = process.env.ORS_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch(`https://api.openrouteservice.org/v2/directions/${profile}/geojson`, {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates,
          instructions: true,
          elevation: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const feature = data.features[0];
        const props = feature.properties;
        const geometry: [number, number][] = feature.geometry.coordinates.map(
          (c: number[]) => [c[1], c[0]] as [number, number]
        );

        const legs = props.segments.map((seg: { distance: number; duration: number }) => ({
          distance: seg.distance,
          duration: seg.duration,
        }));

        const steps = props.segments.flatMap(
          (seg: { steps: { instruction: string; distance: number; duration: number }[] }) =>
            seg.steps.map((s) => ({
              instruction: s.instruction,
              distance: s.distance,
              duration: s.duration,
            }))
        );

        return NextResponse.json({
          geometry,
          totalDistance: props.summary.distance,
          totalDuration: props.summary.duration,
          legs,
          steps,
          elevation:
            props.ascent != null
              ? { ascent: Math.round(props.ascent), descent: Math.round(props.descent) }
              : undefined,
          usedFallback: false,
        });
      }
    } catch {
      // fall through to fallback
    }
  }

  // --- Fallback: straight lines between consecutive stops ---
  const geometry: [number, number][] = coordinates.map(([lon, lat]) => [lat, lon]);
  const speedMps = (FALLBACK_SPEED_KMH[profile] ?? 30) / 3.6;

  const legs = [];
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lon1, lat1] = coordinates[i];
    const [lon2, lat2] = coordinates[i + 1];
    const distance = haversineMeters(lat1, lon1, lat2, lon2);
    legs.push({ distance, duration: distance / speedMps });
  }

  const totalDistance = legs.reduce((s, l) => s + l.distance, 0);
  const totalDuration = legs.reduce((s, l) => s + l.duration, 0);

  const steps = legs.map((leg, i) => ({
    instruction: `Head toward stop ${i + 2} (straight-line estimate)`,
    distance: leg.distance,
    duration: leg.duration,
  }));

  return NextResponse.json({
    geometry,
    totalDistance,
    totalDuration,
    legs,
    steps,
    elevation: undefined,
    usedFallback: true,
  });
}
