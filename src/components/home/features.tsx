import { Route, CloudSun, MapPinned, Navigation2 } from "lucide-react";

const FEATURES = [
  {
    icon: Route,
    title: "Automatic route optimization",
    description:
      "Add your stops in any order — a TSP solver works out the shortest sequence to visit them, using real road data.",
  },
  {
    icon: Navigation2,
    title: "Driving, walking & cycling",
    description:
      "Switch between travel modes and get real distances, times, and turn-by-turn directions for each.",
  },
  {
    icon: CloudSun,
    title: "Live weather along the way",
    description: "Check current conditions and a 7-day forecast for any stop on your trip.",
  },
  {
    icon: MapPinned,
    title: "Find places nearby",
    description:
      "Discover restaurants, hotels, ATMs, and more near any stop, and add them straight to your route.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <f.icon className="size-5" />
            </div>
            <h3 className="font-display text-sm font-semibold">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
