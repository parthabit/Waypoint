import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lon = req.nextUrl.searchParams.get("lon");
  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lon);
  url.searchParams.set("format", "jsonv2");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Waypoint-TripPlanner/1.0 (educational project)",
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      return NextResponse.json({ name: "My location" });
    }
    const data = await res.json();
    const name = (data.display_name as string | undefined)
      ?.split(",")
      .slice(0, 2)
      .join(",")
      .trim();
    return NextResponse.json({ name: name || "My location" });
  } catch {
    return NextResponse.json({ name: "My location" });
  }
}
