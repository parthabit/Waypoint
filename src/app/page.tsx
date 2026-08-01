"use client";

import { motion } from "framer-motion";
import { HeroSearch } from "@/components/home/hero-search";
import { HomeWeather } from "@/components/home/home-weather";
import { Features } from "@/components/home/features";
import { PopularDestinations } from "@/components/home/popular-destinations";

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden px-5 pb-20 pt-20 sm:pt-28">
        {/* Animated gradient background */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            className="absolute -left-32 -top-32 size-[420px] rounded-full bg-primary/20 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -right-32 top-10 size-[380px] rounded-full bg-secondary/20 blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 left-1/3 size-[300px] rounded-full bg-accent/20 blur-3xl"
            animate={{ x: [0, 25, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            Built entirely on free & open APIs
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Plan multi-stop trips with the{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              shortest route
            </span>{" "}
            done for you
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Add every stop on your list — Waypoint automatically works out the fastest order to
            visit them, by car, on foot, or by bike.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-9"
        >
          <HeroSearch />
          <HomeWeather />
        </motion.div>
      </section>

      <Features />
      <PopularDestinations />
    </div>
  );
}
