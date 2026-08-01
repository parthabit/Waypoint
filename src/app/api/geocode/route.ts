import { NextRequest, NextResponse } from "next/server";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// Nominatim's usage policy requires a descriptive User-Agent and caps
// requests at ~1/sec per client. Since this route runs server-side, we
// can set that header (browsers block custom User-Agent client-side).
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", q);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "6");
  url.searchParams.set("addressdetails", "1");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Waypoint-TripPlanner/1.0 (educational project)",
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ results: [], error: "Geocoding service unavailable" }, { status: 502 });
    }

    const data = await res.json();
    const results = (data as Array<Record<string, unknown>>).map((r) => ({
      name: (r.display_name as string).split(",").slice(0, 2).join(",").trim(),
      fullAddress: r.display_name as string,
      lat: parseFloat(r.lat as string),
      lon: parseFloat(r.lon as string),
      category: (r.type as string) || (r.class as string) || undefined,
    }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [], error: "Geocoding request failed" }, { status: 500 });
  }
}
