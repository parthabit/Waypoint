"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { MapPinned, Moon, Sun, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/planner", label: "Trip Planner" },
  { href: "/saved", label: "Saved Trips" },
  { href: "/settings", label: "Settings" },
];

export function Header() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MapPinned className="size-4.5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">Waypoint</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname === item.href && "bg-muted text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="Toggle dark mode"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </button>
          <Link
            href="/planner"
            className="hidden rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition hover:brightness-110 sm:block"
          >
            Plan a trip
          </Link>
          <button
            className="flex size-9 items-center justify-center rounded-full border border-border md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-border px-5 py-3 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
