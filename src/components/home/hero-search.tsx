"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { geocode, type GeocodeResult } from "@/lib/api";

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<GeocodeResult[]>([]);
  const [open, setOpen] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.trim().length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await geocode(query);
        setResults(r);
        setOpen(r.length > 0);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [query]);

  function goToPlanner(place?: GeocodeResult) {
    const params = new URLSearchParams();
    if (place) {
      params.set("name", place.name);
      params.set("lat", String(place.lat));
      params.set("lon", String(place.lon));
    } else if (query) {
      params.set("q", query);
    }
    router.push(`/planner?${params.toString()}`);
  }

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && goToPlanner(results[0])}
          placeholder="Where are you headed? Try 'Paris' or 'Goa beaches'…"
          className="h-14 rounded-full pl-12 pr-32 text-base shadow-lg shadow-primary/5"
        />
        <Button
          onClick={() => goToPlanner(results[0])}
          className="absolute right-1.5 top-1.5 h-11 rounded-full px-6"
        >
          {searching ? <Loader2 className="size-4 animate-spin" /> : "Plan trip"}
        </Button>
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => goToPlanner(r)}
              className="block w-full truncate px-4 py-3 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {r.fullAddress}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
