"use client";

import React from "react";
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

export const TIME_STEPS = [
  { label: "00:00", hours: 0, lead: "+0h" },
  { label: "06:00", hours: 6, lead: "+6h" },
  { label: "12:00", hours: 12, lead: "+12h" },
  { label: "18:00", hours: 18, lead: "+18h" },
  { label: "24:00", hours: 24, lead: "+24h" },
  { label: "36:00", hours: 36, lead: "+36h" },
  { label: "48:00", hours: 48, lead: "+48h" },
  { label: "72:00", hours: 72, lead: "+72h" },
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
  const activeStep = TIME_STEPS[currentIndex] || TIME_STEPS[0];

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + TIME_STEPS.length) % TIME_STEPS.length;
    onChangeHours(TIME_STEPS[prevIndex].hours);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % TIME_STEPS.length;
    onChangeHours(TIME_STEPS[nextIndex].hours);
  };

  return (
    <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-col items-center">
      {/* Floating Active Time Indicator (OpenWeather reference style: "27 November at 11:00") */}
      <div className="mb-1 pointer-events-none flex flex-col items-center">
        <div className="px-3 py-1 rounded-full bg-surface/95 dark:bg-[#18181b]/95 border border-[#e87a53]/50 shadow-md backdrop-blur-md text-[11px] font-mono font-bold text-text-primary flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#e87a53] animate-pulse" />
          <span>22 September at {activeStep.label} UTC ({activeStep.lead})</span>
        </div>
        <div className="w-0.5 h-1.5 bg-[#e87a53]" />
      </div>

      {/* Main Scrubber Capsule Bar */}
      <div className="w-full flex items-center justify-between gap-1 sm:gap-2 rounded-full border border-border/80 bg-surface/90 dark:bg-[#18181b]/90 px-3 py-1.5 shadow-lg backdrop-blur-md text-xs transition-colors overflow-x-auto">
        {/* Play/Pause & Left Chevron */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onTogglePlay}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e87a53] text-slate-950 hover:bg-[#de6e46] active:scale-95 transition shadow-xs"
            title={isPlaying ? "Pause Forecast Loop" : "Play Forecast Loop"}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={handlePrev}
            className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-surface-secondary transition"
            title="Previous lead time"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Timeline Ticks Bar matching OpenWeather: 10:10 10:20 ... */}
        <div className="flex flex-1 items-center justify-between px-2 gap-1 overflow-x-auto">
          {TIME_STEPS.map((step) => {
            const isActive = currentHours === step.hours;
            return (
              <button
                key={step.hours}
                type="button"
                onClick={() => onChangeHours(step.hours)}
                className={`group relative flex flex-col items-center justify-center px-2 py-1 rounded-full text-xs font-mono transition-all ${
                  isActive
                    ? "text-[#e87a53] dark:text-[#f89b78] font-bold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="timeline-pill-highlight"
                    className="absolute inset-0 rounded-full bg-amber-500/15 dark:bg-[#38231c] border border-amber-500/30 dark:border-[#e87a53]/40 shadow-xs"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  />
                )}
                <span className="relative z-10 text-[11px] font-semibold">{step.label}</span>
                <span className="relative z-10 text-[9px] opacity-70 group-hover:opacity-100">
                  {step.lead}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Chevron */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={handleNext}
            className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-surface-secondary transition"
            title="Next lead time"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
