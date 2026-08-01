import Link from "next/link";
import { MapPinned } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <MapPinned className="size-4" />
              </span>
              <span className="font-display text-base font-bold">Waypoint</span>
            </div>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Plan multi-stop trips with automatically optimized routes — built entirely on
              free, open mapping APIs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <div>
              <p className="mb-2 font-semibold text-foreground">Product</p>
              <ul className="space-y-1.5 text-muted-foreground">
                <li><Link href="/planner" className="hover:text-foreground">Trip Planner</Link></li>
                <li><Link href="/saved" className="hover:text-foreground">Saved Trips</Link></li>
                <li><Link href="/settings" className="hover:text-foreground">Settings</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-semibold text-foreground">Powered by</p>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>OpenStreetMap</li>
                <li>OpenRouteService</li>
                <li>Open-Meteo</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          Built with free & open APIs. Map data © OpenStreetMap contributors.
        </div>
      </div>
    </footer>
  );
}
