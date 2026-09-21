"use client";

import React from "react";
import { Play, Pause, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { motion } from "motion/react";

export const TIME_STEPS = [
  { label: "Now", hours: 0 },
  { label: "+6h", hours: 6 },
  { label: "+12h", hours: 12 },
  { label: "+24h", hours: 24 },
  { label: "+48h", hours: 48 },
  { label: "+72h", hours: 72 },
];

interface MapTimelineProps {
  currentHours: number;
  onChangeHours: (hours: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export function MapTimeline({
  currentHours,
  onChangeHours,
  isPlaying,
  onTogglePlay,
}: MapTimelineProps) {
  const currentIndex = TIME_STEPS.findIndex((s) => s.hours === currentHours);

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + TIME_STEPS.length) % TIME_STEPS.length;
    onChangeHours(TIME_STEPS[prevIndex].hours);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % TIME_STEPS.length;
    onChangeHours(TIME_STEPS[nextIndex].hours);
  };

  return (
    <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface/95 dark:bg-surface/95 p-2 shadow-md backdrop-blur-md text-xs transition-colors">
      {/* Left: Play/Pause and Step Arrow Buttons (OpenWeather reference style) */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onTogglePlay}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-aether-sky text-white hover:bg-aether-sky-hover active:scale-95 transition-all shadow-xs"
          aria-label={isPlaying ? "Pause Forecast Loop" : "Play Forecast Loop"}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={handlePrev}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface-secondary text-text-muted hover:text-text-primary hover:bg-surface transition"
          title="Previous lead time"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface-secondary text-text-muted hover:text-text-primary hover:bg-surface transition"
          title="Next lead time"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Center: Timestamp chip */}
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-secondary/70 border border-border text-[11px] font-mono text-text-secondary">
        <Clock className="h-3 w-3 text-aether-sky" />
        <span>Valid: 22 Sep at +{currentHours}h UTC</span>
      </div>

      {/* Right: Step Scrubber Pills */}
      <div className="flex flex-1 sm:flex-none items-center justify-end gap-1 overflow-x-auto py-0.5">
        {TIME_STEPS.map((step) => {
          const isActive = currentHours === step.hours;
          return (
            <button
              key={step.label}
              type="button"
              onClick={() => onChangeHours(step.hours)}
              className={`relative flex flex-col items-center justify-center px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
                isActive
                  ? "text-aether-sky font-bold"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-secondary"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="timeline-active-pill"
                  className="absolute inset-0 rounded-lg bg-aether-sky/15 border border-aether-sky/40 shadow-xs"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              <span className="relative z-10">{step.label}</span>
              <span className="relative z-10 text-[9px] font-mono text-text-muted">
                {step.hours === 0 ? "00z" : `+${step.hours}h`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

