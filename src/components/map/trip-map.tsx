"use client";

import * as React from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import { Crosshair, Maximize, Minimize, Layers } from "lucide-react";
import { useTheme } from "next-themes";
import { ClusterLayer } from "./cluster-layer";
import type { Stop } from "@/types";
import { cn } from "@/lib/utils";

const STREET_TILES = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const SATELLITE_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

function numberedIcon(index: number, optimized: boolean) {
  return L.divIcon({
    className: "",
    html: `<div class="num-pin ${optimized ? "optimized" : ""}"><span>${index + 1}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28],
  });
}

interface TripMapProps {
  stops: Stop[];
  routeGeometry?: [number, number][];
  optimized: boolean;
  onLocateResult?: (lat: number, lon: number) => void;
  className?: string;
}

export function TripMap({ stops, routeGeometry, optimized, onLocateResult, className }: TripMapProps) {
  const mapRef = React.useRef<L.Map | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();
  const [satellite, setSatellite] = React.useState(false);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [locating, setLocating] = React.useState(false);
  const useCluster = stops.length > 8;

  const center: [number, number] =
    stops.length > 0 ? [stops[0].lat, stops[0].lon] : [20.5937, 78.9629];

  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || stops.length === 0) return;
    if (stops.length === 1) {
      map.setView([stops[0].lat, stops[0].lon], 13);
    } else {
      const bounds = L.latLngBounds(stops.map((s) => [s.lat, s.lon] as [number, number]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops.length, stops[0]?.id]);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapRef.current?.flyTo([latitude, longitude], 15);
        onLocateResult?.(latitude, longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  React.useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const markerIcons = React.useMemo(
    () => stops.map((s, i) => ({ id: s.id, lat: s.lat, lon: s.lon, icon: numberedIcon(i, optimized), popupHtml: `<b>${s.name}</b>` })),
    [stops, optimized]
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full overflow-hidden rounded-xl border border-border", className)}
    >
      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom
        className={cn("h-full w-full", resolvedTheme === "dark" && !satellite && "map-tiles-dark")}
        ref={mapRef}
      >
        <TileLayer
          key={satellite ? "sat" : "street"}
          url={satellite ? SATELLITE_TILES : STREET_TILES}
          attribution={
            satellite
              ? "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics"
              : "&copy; OpenStreetMap contributors &copy; CARTO"
          }
        />

        {routeGeometry && routeGeometry.length > 1 && (
          <Polyline
            positions={routeGeometry}
            pathOptions={{ color: "#5b4de6", weight: 4, opacity: 0.85 }}
          />
        )}

        {useCluster ? (
          <ClusterLayer markers={markerIcons} />
        ) : (
          stops.map((s, i) => (
            <Marker key={s.id} position={[s.lat, s.lon]} icon={numberedIcon(i, optimized)}>
              <Popup>
                <b>{s.name}</b>
                <br />
                {s.lat.toFixed(4)}, {s.lon.toFixed(4)}
              </Popup>
            </Marker>
          ))
        )}
      </MapContainer>

      {/* Floating controls */}
      <div className="absolute right-3 top-3 z-[500] flex flex-col gap-2">
        <button
          onClick={toggleFullscreen}
          title="Fullscreen"
          className="flex size-9 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-sm backdrop-blur hover:bg-muted"
        >
          {fullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
        </button>
        <button
          onClick={() => setSatellite((v) => !v)}
          title="Toggle satellite view"
          className={cn(
            "flex size-9 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-sm backdrop-blur hover:bg-muted",
            satellite && "bg-primary text-primary-foreground border-primary"
          )}
        >
          <Layers className="size-4" />
        </button>
        <button
          onClick={handleLocate}
          title="Locate me"
          disabled={locating}
          className="flex size-9 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-sm backdrop-blur hover:bg-muted disabled:opacity-50"
        >
          <Crosshair className={cn("size-4", locating && "animate-spin")} />
        </button>
      </div>

      {stops.length === 0 && (
        <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-full border border-border bg-card/90 px-4 py-2 text-xs font-medium text-muted-foreground backdrop-blur">
          Add stops to begin plotting your route
        </div>
      )}
    </div>
  );
}
