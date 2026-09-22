"use client";

import React from "react";
import * as Slider from "@radix-ui/react-slider";
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

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
  const shouldReduceMotion = useReducedMotion();
  const currentIndex = TIME_STEPS.findIndex((s) => s.hours === currentHours);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const activeStep = TIME_STEPS[safeIndex] || TIME_STEPS[0];

  const handlePrev = () => {
    const prevIndex = (safeIndex - 1 + TIME_STEPS.length) % TIME_STEPS.length;
    onChangeHours(TIME_STEPS[prevIndex].hours);
  };

  const handleNext = () => {
    const nextIndex = (safeIndex + 1) % TIME_STEPS.length;
    onChangeHours(TIME_STEPS[nextIndex].hours);
  };

  return (
    <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-col items-center">
      {/* Floating Active Time Indicator */}
      <div className="mb-1 pointer-events-none flex flex-col items-center">
        <div className="px-3 py-1 rounded-full bg-surface/95 dark:bg-[#18181b]/95 border border-accent/50 shadow-md backdrop-blur-md text-[11px] font-mono font-bold text-text-primary flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span>22 September at {activeStep.label} UTC ({activeStep.lead})</span>
        </div>
        <div className="w-0.5 h-1.5 bg-accent" />
      </div>

      {/* Main Scrubber Capsule Bar with Radix Slider integration */}
      <div className="w-full max-w-4xl flex flex-col gap-1.5 rounded-2xl border border-border/80 bg-surface/90 dark:bg-[#18181b]/90 px-3.5 py-2 shadow-xl backdrop-blur-md text-xs transition-colors">
        {/* Radix Slider Continuous Scrubbing Track */}
        <div className="px-2 pt-1">
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-4 cursor-pointer"
            value={[safeIndex]}
            max={TIME_STEPS.length - 1}
            step={1}
            onValueChange={(val) => {
              const stepIdx = val[0];
              if (stepIdx !== undefined && TIME_STEPS[stepIdx]) {
                onChangeHours(TIME_STEPS[stepIdx].hours);
              }
            }}
            aria-label="Forecast Lead Time Horizon Scrubber"
          >
            <Slider.Track className="bg-border relative grow rounded-full h-1.5 overflow-hidden">
              <Slider.Range className="absolute bg-gradient-to-r from-accent to-accent-hover h-full" />
            </Slider.Track>
            <Slider.Thumb
              className="block w-4 h-4 bg-accent border-2 border-white dark:border-slate-900 rounded-full shadow-lg shadow-accent/50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 transition-transform hover:scale-125 cursor-grab active:cursor-grabbing"
              aria-label="Horizon slider thumb"
            />
          </Slider.Root>
        </div>

        {/* Controls row: Play/Pause, Step Ticks, and Nav Chevrons */}
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          {/* Play/Pause & Left Chevron */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onTogglePlay}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-slate-950 hover:bg-accent-hover active:scale-95 transition shadow-md shadow-accent/35 ring-2 ring-accent/30"
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

          {/* Timeline Ticks Bar */}
          <div className="flex flex-1 items-center justify-between px-2 gap-1 overflow-x-auto">
            {TIME_STEPS.map((step, idx) => {
              const isActive = safeIndex === idx;
              return (
                <button
                  key={step.hours}
                  type="button"
                  onClick={() => onChangeHours(step.hours)}
                  className={`group relative flex flex-col items-center justify-center px-2 py-0.5 rounded-full text-xs font-mono transition-all duration-200 ${
                    isActive
                      ? "text-accent font-bold"
                      : "text-text-muted hover:text-text-primary hover:bg-surface-secondary/70"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="timeline-pill-highlight"
                      className="absolute inset-0 rounded-full bg-accent/20 border-2 border-accent ring-2 ring-accent/40 shadow-lg shadow-accent/35"
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 450, damping: 30 }
                      }
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
    </div>
  );
}
