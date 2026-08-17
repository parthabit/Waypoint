# Waypoint — Trip Planner (Map & Route Optimization core)
 
A multi-stop trip planner: add locations, get the shortest visiting order automatically
(TSP), see it on a live map, and get real distance/time for driving, walking, or cycling —
all on **free, keyless APIs** (plus one optional free key for real road routing).

This build focuses on the **map + planner core** of the original spec. Auth, a database,
AI itinerary generation, and real-time collaboration are intentionally not included yet —
see [What's not built yet](#whats-not-built-yet) for why and how to add them. 

## Features implemented

- **Add unlimited stops** by search (autocomplete) or current GPS location
- **Route optimization**: nearest-neighbor + 2-opt TSP heuristic over a real distance
  matrix, with an optional round-trip toggle
- **Three travel profiles**: driving, walking, cycling — each re-optimizes with real
  mode-specific speeds when an ORS key is configured
- **Live interactive map** (Leaflet): numbered markers, marker clustering for 9+ stops,
  animated route line, street/satellite toggle, locate-me, fullscreen
- **Route summary**: total distance, time, elevation gain/loss, average speed, estimated
  fuel cost and CO₂ (driving)
- **Turn-by-turn directions** with an optional "read aloud" voice button (Web Speech API)
- **Manual drag-to-reorder** stops, remove, and favorite (saved locally)
- **Nearby places** finder around any stop (restaurants, hotels, ATMs, fuel, EV charging,
  etc.) via OpenStreetMap/Overpass — add results straight to your route
- **Live weather** per stop (Open-Meteo) and on the home page (based on your location)
- **Save trips locally** and reload them later (no account needed — see note below)
- **Dark/light/system theme**, responsive layout

## Free APIs used

| Purpose | Service | Key required? |
|---|---|---|
| Geocoding / search | [Nominatim](https://nominatim.org/) | No |
| Route optimization matrix + directions | [OpenRouteService](https://openrouteservice.org/) | **Yes (free tier)** — falls back to straight-line estimates without it |
| Weather | [Open-Meteo](https://open-meteo.com/) | No |
| Nearby places | [Overpass API](https://overpass-api.de/) (OpenStreetMap) | No |
| Map tiles | CARTO (street) / Esri World Imagery (satellite) | No |

All external calls happen server-side through Next.js API routes in `src/app/api/*`, so
your ORS key is never exposed to the browser and Nominatim's usage policy (identifying
User-Agent, no client-side hammering) is respected automatically.

## Getting started

```bash
npm install
cp .env.example .env.local   # then add your free ORS key (see below) — optional but recommended
npm run dev
```

Open http://localhost:3000. The app works immediately with no keys — try the planner and
you'll see a banner noting that routes are straight-line estimates until you add a key.

### Get a free OpenRouteService key (~2 minutes, unlocks real road routing)

1. Sign up at https://openrouteservice.org/dev/#/signup
2. Create a token on the free "Standard" plan (2,000 requests/day, more than enough for
   personal use)
3. Put it in `.env.local`:
   ```
   ORS_API_KEY=your_key_here
   ```
4. Restart `npm run dev`

## Deploying

This is a standard Next.js app — deploy to [Vercel](https://vercel.com) (recommended,
free tier) by importing the repo and adding `ORS_API_KEY` as an environment variable in
the project settings. No other setup is required since there's no database yet.

## Project structure

```
src/
  app/
    page.tsx              home page
    planner/page.tsx       the trip planner (core feature)
    saved/page.tsx          saved trips (localStorage)
    settings/page.tsx       units, currency, theme, data
    api/
      geocode/               Nominatim search proxy
      reverse-geocode/        Nominatim reverse geocode proxy
      matrix/                 ORS distance matrix (+ haversine fallback)
      directions/             ORS directions (+ straight-line fallback)
      weather/                Open-Meteo proxy
      nearby/                 Overpass proxy
  components/
    ui/                      hand-written shadcn-style primitives
    map/                     Leaflet map + marker clustering
    planner/                 search, stop list, route summary, directions, nearby, weather
    home/                    hero, popular destinations, features
    layout/                  header, footer
    providers/               theme + react-query providers
  lib/                       TSP solver, haversine geo, API client, localStorage helpers
  types/                     shared TypeScript types
```

## Why no database/auth yet

Wiring up Supabase or Clerk needs *your* free-tier project and credentials — there's no
way to provision those on your behalf. The app is built so adding them later is
straightforward:

- **Auth + database**: saved trips currently live in `localStorage` via
  `src/lib/storage.ts`. Swapping that for Supabase means adding `@supabase/supabase-js`,
  creating a `trips` table, and replacing the functions in `storage.ts` with Supabase
  queries — the rest of the app (planner page, saved-trips page) calls those functions
  and won't need to change much.
- **AI itinerary generation**: would be a new `/api/ai-plan` route calling the Gemini
  free tier, returning a day-by-day plan you could render similarly to the route summary.
- **PDF export**: `jspdf` or browser print-to-PDF on a dedicated print-friendly itinerary
  view.
- **Collaboration**: Supabase Realtime channels once a database is in place.

## Known limitations

- Nominatim and Overpass are shared public instances with fair-use rate limits — fine for
  personal/demo use, but you'd want a paid geocoding provider for production traffic.
- The TSP solver is a heuristic (nearest-neighbor + 2-opt), not an exact solver — great
  results up to ~12 stops, which is the app's current cap.
- Weather and directions in fallback mode (no ORS key) use rough averages, not real
  traffic or terrain data.
