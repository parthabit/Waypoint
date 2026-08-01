import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";

interface Destination {
  name: string;
  country: string;
  lat: number;
  lon: number;
  image: string;
}

const DESTINATIONS: Destination[] = [
  {
    name: "Paris",
    country: "France",
    lat: 48.8566,
    lon: 2.3522,
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&q=80",
  },
  {
    name: "Tokyo",
    country: "Japan",
    lat: 35.6762,
    lon: 139.6503,
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&q=80",
  },
  {
    name: "Bali",
    country: "Indonesia",
    lat: -8.3405,
    lon: 115.092,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&q=80",
  },
  {
    name: "New York",
    country: "USA",
    lat: 40.7128,
    lon: -74.006,
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=500&q=80",
  },
  {
    name: "Rome",
    country: "Italy",
    lat: 41.9028,
    lon: 12.4964,
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=500&q=80",
  },
  {
    name: "Jaipur",
    country: "India",
    lat: 26.9124,
    lon: 75.7873,
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=500&q=80",
  },
];

export function PopularDestinations() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Popular destinations</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Jump straight into planning a trip around one of these.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {DESTINATIONS.map((d) => (
          <Link
            key={d.name}
            href={`/planner?name=${encodeURIComponent(d.name)}&lat=${d.lat}&lon=${d.lon}`}
            className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-border shadow-sm transition-shadow hover:shadow-lg"
          >
            <Image
              src={d.image}
              alt={d.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <p className="flex items-center gap-1 text-xs opacity-80">
                <MapPin className="size-3" /> {d.country}
              </p>
              <p className="font-display text-base font-bold">{d.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
