"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";

interface MapLegendProps {
  activeLayer: string;
}

export const CONTINUOUS_LEGENDS: Record<
  string,
  {
    title: string;
    unit: string;
    gradient: string;
    ticks: string[];
  }
> = {
  rainfall: {
    title: "Precipitation",
    unit: "mm/h",
    gradient: "linear-gradient(to right, rgba(254, 243, 199, 0.5) 0%, #fde68a 12%, #f59e0b 28%, #ea580c 45%, #dc2626 65%, #b91c1c 78%, #7f1d1d 90%, #450a0a 100%)",
    ticks: ["0", "0.5", "1", "2", "4", "6", "7", "10", "12", "14", "16", "24", "32", "60"],
  },
  temperature: {
    title: "Temperature",
    unit: "°C",
    gradient: "linear-gradient(to right, #fde68a 0%, #f59e0b 25%, #ea580c 50%, #dc2626 75%, #7f1d1d 90%, #450a0a 100%)",
    ticks: ["15", "20", "25", "30", "35", "40", "45", "50+"],
  },
  wind: {
    title: "Wind Speed",
    unit: "m/s",
    gradient: "linear-gradient(to right, #94a3b8 0%, #38bdf8 25%, #6366f1 50%, #d946ef 75%, #ef4444 100%)",
    ticks: ["0", "2", "5", "10", "15", "20", "28", "35+"],
  },
  pressure: {
    title: "Atmospheric Pressure",
    unit: "hPa",
    gradient: "linear-gradient(to right, #6366f1 0%, #3b82f6 30%, #10b981 60%, #f59e0b 85%, #ef4444 100%)",
    ticks: ["980", "995", "1005", "1013", "1020", "1030"],
  },
  satellite: {
    title: "Cloud Coverage",
    unit: "%",
    gradient: "linear-gradient(to right, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0.75) 75%, #ffffff 100%)",
    ticks: ["0", "20", "40", "60", "80", "100"],
  },
  risk: {
    title: "Severe Weather Risk",
    unit: "Index",
    gradient: "linear-gradient(to right, #10b981 0%, #f59e0b 35%, #ea580c 70%, #dc2626 100%)",
    ticks: ["Low", "Watch", "High", "Extreme"],
  },
  trust: {
    title: "Model Trust Distribution",
    unit: "Softmax",
    gradient: "linear-gradient(to right, #059669 0%, #64748b 33%, #2563eb 66%, #0284c7 100%)",
    ticks: ["Consensus", "GFS", "IFS", "AIFS"],
  },
};

export function MapLegend({ activeLayer }: MapLegendProps) {
  const config = CONTINUOUS_LEGENDS[activeLayer] || CONTINUOUS_LEGENDS.rainfall;

  return (
    <div className="absolute bottom-16 left-3 z-20 rounded-xl border border-border/80 bg-surface/90 dark:bg-[#18181b]/90 p-2.5 shadow-lg backdrop-blur-md pointer-events-auto transition-colors max-w-[92vw] sm:max-w-xs">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeLayer}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.15 }}
          className="space-y-1.5"
        >
          {/* Ticks header / numbers */}
          <div className="flex items-center justify-between gap-1 text-[9px] font-mono text-text-muted/80 tracking-tighter select-none">
            {config.ticks.map((t, idx) => (
              <span key={idx} className="shrink-0">
                {t}
              </span>
            ))}
          </div>

          {/* Continuous Gradient Bar */}
          <div
            className="h-2.5 w-full rounded-full border border-black/20 shadow-inner"
            style={{ background: config.gradient }}
          />

          {/* Unit & Title footer */}
          <div className="flex items-center justify-between text-[10px] select-none pt-0.5">
            <span className="font-semibold text-text-primary text-[11px]">
              {config.title}
            </span>
            <span className="font-mono font-bold text-text-muted">
              {config.unit}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
