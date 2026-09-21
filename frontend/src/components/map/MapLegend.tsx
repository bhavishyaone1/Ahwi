"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";

interface MapLegendProps {
  activeLayer: string;
}

export const LEGEND_CONFIGS: Record<
  string,
  { title: string; unit: string; stops: { color: string; label: string }[] }
> = {
  rainfall: {
    title: "Precipitation",
    unit: "mm/24h",
    stops: [
      { color: "#08306b", label: "> 100" },
      { color: "#08519c", label: "50–100" },
      { color: "#2171b5", label: "25–50" },
      { color: "#4292c6", label: "10–25" },
      { color: "#6baed6", label: "5–10" },
      { color: "#9ecae1", label: "1–5" },
      { color: "#c6dbef", label: "0–1" },
    ],
  },
  temperature: {
    title: "Surface Temp",
    unit: "°C",
    stops: [
      { color: "#7f0000", label: "> 45" },
      { color: "#b30000", label: "40–45" },
      { color: "#d7301f", label: "35–40" },
      { color: "#ef6548", label: "30–35" },
      { color: "#fdbb84", label: "25–30" },
      { color: "#fee8c8", label: "20–25" },
      { color: "#2b83ba", label: "< 20" },
    ],
  },
  wind: {
    title: "Wind Velocity",
    unit: "km/h",
    stops: [
      { color: "#49006a", label: "> 60 (Gale)" },
      { color: "#7a0177", label: "45–60" },
      { color: "#ae017e", label: "30–45" },
      { color: "#dd3497", label: "20–30" },
      { color: "#f768a1", label: "10–20" },
      { color: "#fcc5c0", label: "< 10" },
    ],
  },
  satellite: {
    title: "INSAT-3D IR Cloud Top",
    unit: "Brightness Temp",
    stops: [
      { color: "#ffffff", label: "Deep Convection" },
      { color: "#d9d9d9", label: "Cirrus / High" },
      { color: "#969696", label: "Mid-level Stratum" },
      { color: "#525252", label: "Low Stratus" },
      { color: "#252525", label: "Clear Ground" },
    ],
  },
  risk: {
    title: "Severe Weather Risk",
    unit: "Compound Index",
    stops: [
      { color: "#dc2626", label: "EXTREME (>85%)" },
      { color: "#ea580c", label: "HIGH (70–85%)" },
      { color: "#d97706", label: "WATCH (40–70%)" },
      { color: "#16a34a", label: "LOW (<40%)" },
    ],
  },
  trust: {
    title: "Dominant Model Trust",
    unit: "Softmax Weight",
    stops: [
      { color: "#0284c7", label: "AIFS Dominant (>40%)" },
      { color: "#2563eb", label: "ECMWF Dominant (>40%)" },
      { color: "#64748b", label: "GFS Dominant (>40%)" },
      { color: "#059669", label: "Consensus (Disagreement <5%)" },
    ],
  },
};

export function MapLegend({ activeLayer }: MapLegendProps) {
  const legend = LEGEND_CONFIGS[activeLayer] || LEGEND_CONFIGS.rainfall;

  return (
    <div className="absolute bottom-16 left-3 z-20 rounded-xl border border-border bg-surface/95 dark:bg-surface/95 px-3 py-2.5 shadow-md backdrop-blur-md text-xs pointer-events-auto max-w-[180px] transition-colors">
      <div className="flex items-center justify-between border-b border-border pb-1 mb-1.5">
        <span className="font-semibold text-text-primary text-[11px] truncate">
          {legend.title}
        </span>
        <span className="text-[10px] font-mono text-text-muted ml-1">
          {legend.unit}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeLayer}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="space-y-1"
        >
          {legend.stops.map((stop, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[10px]">
              <span
                className="h-2.5 w-3.5 shrink-0 rounded-xs border border-border"
                style={{ backgroundColor: stop.color }}
              />
              <span className="text-text-secondary font-mono truncate">
                {stop.label}
              </span>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
