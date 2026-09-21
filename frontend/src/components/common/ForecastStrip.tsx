"use client";

import React from "react";
import { useAetherData } from "@/context/AetherDataContext";
import { CloudRain, CloudSun, Sun, Wind, CheckCircle2 } from "lucide-react";

export const ForecastStrip: React.FC = () => {
  const { data, variable, leadTimeHours, setLeadTimeHours } = useAetherData();
  const horizons = data?.multi_horizon || [];

  const getUnit = () =>
    variable === "rainfall_mm" ? "mm" : variable === "temperature_c" ? "°C" : "m/s";

  return (
    <div className="w-full rounded-xl border border-border bg-surface shadow-xs p-3 select-none">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          Multi-Horizon Synthesis Strip
        </span>
        <span className="text-[10px] font-mono text-text-muted">
          Dynamic Calibrated Blend
        </span>
      </div>

      <div className="grid grid-cols-6 gap-2 overflow-x-auto text-center">
        {horizons.map((h) => {
          const isActive = leadTimeHours === h.horizon_hours;
          return (
            <button
              key={h.lead_time}
              type="button"
              onClick={() => setLeadTimeHours(h.horizon_hours)}
              className={`p-2 rounded-lg border transition text-left flex flex-col justify-between ${
                isActive
                  ? "bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800 ring-1 ring-sky-400"
                  : "bg-surface-secondary/50 border-border hover:bg-surface-secondary"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-text-primary">{h.lead_time}</span>
                <CloudRain className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              </div>

              <div className="my-1">
                <span className="text-sm sm:text-base font-black font-mono text-text-primary">
                  {h.AETHER}
                </span>
                <span className="text-[10px] font-mono text-text-muted ml-0.5">
                  {getUnit()}
                </span>
              </div>

              <div className="text-[10px] text-text-muted pt-1 border-t border-border flex justify-between">
                <span>Spread:</span>
                <span className="font-mono font-semibold text-text-secondary">
                  ±{((h.upper - h.lower) / 2).toFixed(1)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
