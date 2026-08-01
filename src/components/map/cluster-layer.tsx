"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";

interface ClusterLayerProps {
  markers: { id: string; lat: number; lon: number; icon: L.DivIcon; popupHtml?: string }[];
}

/**
 * leaflet.markercluster is a plain Leaflet plugin (no React bindings), so
 * we manage its layer imperatively via the map instance and keep it in
 * sync with the markers prop.
 */
export function ClusterLayer({ markers }: ClusterLayerProps) {
  const map = useMap();
  const groupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    const group = L.markerClusterGroup({
      maxClusterRadius: 45,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
    });
    groupRef.current = group;
    map.addLayer(group);
    return () => {
      map.removeLayer(group);
      groupRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.clearLayers();
    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lon], { icon: m.icon });
      if (m.popupHtml) marker.bindPopup(m.popupHtml);
      group.addLayer(marker);
    });
  }, [markers]);

  return null;
}
