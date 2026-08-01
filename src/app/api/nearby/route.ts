import { NextRequest, NextResponse } from "next/server";
import { haversineMeters } from "@/lib/geo";

const CATEGORY_FILTERS: Record<string, string> = {
  restaurant: '"amenity"="restaurant"',
  cafe: '"amenity"="cafe"',
  hotel: '"tourism"="hotel"',
  museum: '"tourism"="museum"',
  hospital: '"amenity"="hospital"',
  parking: '"amenity"="parking"',
  atm: '"amenity"="atm"',
  fuel: '"amenity"="fuel"',
  charging_station: '"amenity"="charging_station"',
  bus_station: '"highway"="bus_stop"',
  subway_station: '"railway"="station"',
  shopping: '"shop"="mall"',
  nightlife: '"amenity"="bar"',
};

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lon = req.nextUrl.searchParams.get("lon");
  const category = req.nextUrl.searchParams.get("category") || "restaurant";
  const radius = req.nextUrl.searchParams.get("radius") || "1500";

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
  }

  const filter = CATEGORY_FILTERS[category] ?? CATEGORY_FILTERS.restaurant;
  const query = `
    [out:json][timeout:20];
    (
      node[${filter}](around:${radius},${lat},${lon});
      way[${filter}](around:${radius},${lat},${lon});
    );
    out center 25;
  `;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: query,
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      return NextResponse.json({ places: [], error: "Nearby-places service unavailable" }, { status: 502 });
    }

    const data = await res.json();
    type OverpassEl = {
      id: number;
      lat?: number;
      lon?: number;
      center?: { lat: number; lon: number };
      tags?: Record<string, string>;
    };

    const places = (data.elements as OverpassEl[])
      .map((el) => {
        const plat = el.lat ?? el.center?.lat;
        const plon = el.lon ?? el.center?.lon;
        if (plat == null || plon == null) return null;
        return {
          id: String(el.id),
          name: el.tags?.name || "Unnamed place",
          category,
          lat: plat,
          lon: plon,
          distanceMeters: Math.round(haversineMeters(parseFloat(lat), parseFloat(lon), plat, plon)),
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null && p.name !== "Unnamed place")
      .sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0))
      .slice(0, 15);

    return NextResponse.json({ places });
  } catch {
    return NextResponse.json({ places: [], error: "Nearby-places request failed" }, { status: 500 });
  }
}
