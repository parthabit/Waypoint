"use client";

import * as React from "react";
import { Volume2, VolumeX, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistance, formatDuration } from "@/lib/utils";
import type { DirectionStep } from "@/types";

interface TurnByTurnProps {
  steps: DirectionStep[];
}

export function TurnByTurn({ steps }: TurnByTurnProps) {
  const [open, setOpen] = React.useState(false);
  const [speaking, setSpeaking] = React.useState(false);

  if (!steps || steps.length === 0) return null;

  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const text = steps.map((s) => s.instruction).join(". ");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <span className="font-display text-sm font-semibold">
          Turn-by-turn directions ({steps.length} steps)
        </span>
        <ChevronDown className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-border p-4 pt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={speaking ? stopSpeaking : speak}
            className="mb-3"
          >
            {speaking ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            {speaking ? "Stop reading" : "Read directions aloud"}
          </Button>
          <ol className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[10px] font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-foreground">{step.instruction}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {formatDistance(step.distance)} · {formatDuration(step.duration)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
