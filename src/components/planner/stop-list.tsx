"use client";

import * as React from "react";
import { GripVertical, Star, X } from "lucide-react";
import type { Stop } from "@/types";
import { cn, formatDistance, formatDuration } from "@/lib/utils";

interface LegInfo {
  distance: number | null;
  duration: number | null;
}

interface StopListProps {
  stops: Stop[];
  onReorder: (next: Stop[]) => void;
  onRemove: (id: string) => void;
  optimized: boolean;
  legs?: LegInfo[]; // index-aligned with stops; legs[0] is always null (start point)
  favoriteIds: Set<string>;
  onToggleFavorite: (stop: Stop) => void;
}

export function StopList({
  stops,
  onReorder,
  onRemove,
  optimized,
  legs,
  favoriteIds,
  onToggleFavorite,
}: StopListProps) {
  const dragIndex = React.useRef<number | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);

  function handleDrop(dropIndex: number) {
    if (dragIndex.current === null || dragIndex.current === dropIndex) {
      setOverIndex(null);
      return;
    }
    const next = [...stops];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(dropIndex, 0, moved);
    onReorder(next);
    dragIndex.current = null;
    setOverIndex(null);
  }

  if (stops.length === 0) {
    return (
      <p className="py-6 text-sm leading-relaxed text-muted-foreground">
        No stops yet. Search above to add your first location — add at least 2 (up to 12) to
        build a route. Drag stops to reorder manually, or hit Optimize to sort them
        automatically.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {stops.map((stop, i) => {
        const leg = legs?.[i];
        const isFavorite = favoriteIds.has(stop.id);
        return (
          <li
            key={stop.id}
            draggable
            onDragStart={() => (dragIndex.current = i)}
            onDragOver={(e) => {
              e.preventDefault();
              setOverIndex(i);
            }}
            onDragLeave={() => setOverIndex((v) => (v === i ? null : v))}
            onDrop={() => handleDrop(i)}
            className={cn(
              "group flex items-start gap-2.5 rounded-2xl border border-border bg-card p-3 shadow-sm transition-all hover:shadow-md",
              overIndex === i && "border-primary ring-2 ring-primary/30"
            )}
          >
            <GripVertical className="mt-1.5 size-4 shrink-0 cursor-grab text-muted-foreground/50 active:cursor-grabbing" />

            <div
              className={cn(
                "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-border bg-muted font-mono text-[11px] font-bold text-muted-foreground",
                optimized && "border-primary bg-primary text-primary-foreground"
              )}
            >
              {i + 1}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{stop.name}</p>
              <p className="mt-0.5 font-mono text-[10.5px] text-muted-foreground">
                {stop.lat.toFixed(4)}, {stop.lon.toFixed(4)}
              </p>
              {optimized && leg && leg.distance != null && (
                <p className="mt-1.5 font-mono text-[11px] font-semibold text-secondary">
                  ↳ {formatDuration(leg.duration)} · {formatDistance(leg.distance)} from previous
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-center gap-1">
              <button
                onClick={() => onToggleFavorite(stop)}
                title="Save as favorite"
                className="rounded-full p-1 text-muted-foreground hover:text-accent"
              >
                <Star className={cn("size-4", isFavorite && "fill-accent text-accent")} />
              </button>
              <button
                onClick={() => onRemove(stop.id)}
                title="Remove stop"
                className="rounded-full p-1 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
