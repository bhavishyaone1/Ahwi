"use client";

import React from "react";
import { Play, Pause } from "lucide-react";
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
  return (
    <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-xs backdrop-blur-xs text-xs">
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={onTogglePlay}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sky-600 text-white hover:bg-sky-700 active:scale-95 transition-all shadow-xs"
        aria-label={isPlaying ? "Pause Forecast Loop" : "Play Forecast Loop"}
      >
        {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
      </button>

      {/* Horizontal Steps with Motion Active Pill */}
      <div className="flex flex-1 items-center justify-between gap-1 overflow-x-auto py-0.5">
        {TIME_STEPS.map((step) => {
          const isActive = currentHours === step.hours;
          return (
            <button
              key={step.label}
              type="button"
              onClick={() => onChangeHours(step.hours)}
              className={`relative flex flex-col items-center justify-center px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                isActive
                  ? "text-sky-900 font-bold"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/70"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="timeline-active-pill"
                  className="absolute inset-0 rounded-md bg-sky-100/90 border border-sky-300/80 shadow-xs"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              <span className="relative z-10">{step.label}</span>
              <span className="relative z-10 text-[9px] font-mono text-slate-400">
                {step.hours === 0 ? "UTC" : `T+${step.hours}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
