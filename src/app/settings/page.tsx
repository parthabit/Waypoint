"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Moon, Sun, Laptop, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DEFAULT_SETTINGS, getSettings, saveSettings, type Settings } from "@/lib/storage";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "AED"];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = React.useState<Settings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setSettings(getSettings());
    setMounted(true);
  }, []);

  function update(next: Partial<Settings>) {
    const merged = { ...settings, ...next };
    setSettings(merged);
    saveSettings(merged);
  }

  function clearData() {
    if (!window.confirm("This clears saved trips, favorites, and settings from this device. Continue?")) return;
    window.localStorage.removeItem("waypoint:trips");
    window.localStorage.removeItem("waypoint:favorites");
    window.localStorage.removeItem("waypoint:settings");
    setSettings(DEFAULT_SETTINGS);
    toast.success("Local data cleared.");
  }

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-display text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Stored locally on this device — there&apos;s no account yet, so nothing syncs across
        devices.
      </p>

      <div className="mt-8 space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose how Waypoint looks.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            {[
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
              { value: "system", label: "System", icon: Laptop },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1.5 rounded-xl border border-border py-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted",
                  theme === opt.value && "border-primary bg-primary/10 text-primary"
                )}
              >
                <opt.icon className="size-4" />
                {opt.label}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Units & currency</CardTitle>
            <CardDescription>Used across route summaries and cost estimates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Distance units</Label>
              <div className="flex gap-2">
                {(["km", "mi"] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => update({ units: u })}
                    className={cn(
                      "rounded-lg border border-border px-3.5 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted",
                      settings.units === u && "border-primary bg-primary/10 text-primary"
                    )}
                  >
                    {u === "km" ? "Kilometers" : "Miles"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Currency</Label>
              <Select value={settings.currency} onValueChange={(v) => update({ currency: v })}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Fuel price (per liter)</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={settings.fuelPricePerLiter}
                onChange={(e) => update({ fuelPricePerLiter: parseFloat(e.target.value) || 0 })}
                className="w-32"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data</CardTitle>
            <CardDescription>Everything is stored only in this browser.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={clearData}>
              <Trash2 className="size-4" /> Clear local data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
