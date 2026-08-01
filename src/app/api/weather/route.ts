import { NextRequest, NextResponse } from "next/server";

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lon = req.nextUrl.searchParams.get("lon");
  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lon);
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day"
  );
  url.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset"
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "7");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 900 } });
    if (!res.ok) {
      return NextResponse.json({ error: "Weather service unavailable" }, { status: 502 });
    }
    const data = await res.json();

    const payload = {
      temperature: data.current.temperature_2m,
      windSpeed: data.current.wind_speed_10m,
      humidity: data.current.relative_humidity_2m,
      code: data.current.weather_code,
      description: WMO_DESCRIPTIONS[data.current.weather_code] ?? "Unknown",
      isDay: data.current.is_day === 1,
      sunrise: data.daily?.sunrise?.[0],
      sunset: data.daily?.sunset?.[0],
      daily: (data.daily?.time as string[] | undefined)?.map((date, i) => ({
        date,
        tempMax: data.daily.temperature_2m_max[i],
        tempMin: data.daily.temperature_2m_min[i],
        code: data.daily.weather_code[i],
        description: WMO_DESCRIPTIONS[data.daily.weather_code[i]] ?? "Unknown",
      })),
    };

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: "Weather request failed" }, { status: 500 });
  }
}
