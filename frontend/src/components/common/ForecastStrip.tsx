"use client";

import React from "react";
import { useAetherData } from "@/context/AetherDataContext";
import { CloudRain, CloudSun, Sun, Wind, CheckCircle2, Award, ShieldAlert } from "lucide-react";

export const ForecastStrip: React.FC = () => {
  const { data, variable, leadTimeHours, setLeadTimeHours } = useAetherData();
  const horizons = data?.multi_horizon || [];

  const getUnit = () =>
    variable === "rainfall_mm" ? "mm" : variable === "temperature_c" ? "°C" : "m/s";

  const getWeatherIcon = (val: number) => {
    if (variable === "rainfall_mm") {
      return val > 15 ? (
        <CloudRain className="h-4 w-4 text-sky-600 dark:text-sky-400" />
      ) : val > 2 ? (
        <CloudSun className="h-4 w-4 text-sky-500" />
      ) : (
        <Sun className="h-4 w-4 text-amber-500" />
      );
    }
    if (variable === "temperature_c") {
      return val > 35 ? (
        <Sun className="h-4 w-4 text-amber-500" />
      ) : (
        <CloudSun className="h-4 w-4 text-sky-500" />
      );
    }
    return <Wind className="h-4 w-4 text-slate-500" />;
  };

  return (
    <div className="w-full rounded-xl border border-border bg-surface shadow-xs p-3 select-none overflow-x-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border min-w-[500px]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Multi-Horizon Forecast Synthesis Strip
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-aether-sky/10 text-aether-sky border border-aether-sky/20">
            OpenWeather Workstation Model
          </span>
        </div>
        <span className="text-[10px] font-mono text-text-muted">
          Click any column to sync map lead time
        </span>
      </div>

      {/* Horizontal Multi-Row Synthesis Matrix (OpenWeather reference style) */}
      <div className="min-w-[500px]">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-[11px] text-text-muted font-mono">
              <th className="py-1 px-2 w-32 font-semibold">HORIZON</th>
              {horizons.map((h) => {
                const isActive = leadTimeHours === h.horizon_hours;
                return (
                  <th
                    key={h.lead_time}
                    onClick={() => setLeadTimeHours(h.horizon_hours)}
                    className={`py-1 px-2 text-center cursor-pointer transition rounded-t-md ${
                      isActive
                        ? "bg-aether-sky/15 text-aether-sky font-bold"
                        : "hover:bg-surface-secondary text-text-primary"
                    }`}
                  >
                    {h.lead_time}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {/* Row 1: Weather Condition Icon */}
            <tr className="hover:bg-surface-secondary/40 transition">
              <td className="py-1.5 px-2 font-medium text-text-secondary flex items-center gap-1.5">
                <CloudSun className="h-3.5 w-3.5 text-text-muted" />
                <span>Weather</span>
              </td>
              {horizons.map((h) => {
                const isActive = leadTimeHours === h.horizon_hours;
                return (
                  <td
                    key={h.lead_time}
                    onClick={() => setLeadTimeHours(h.horizon_hours)}
                    className={`py-1.5 px-2 text-center cursor-pointer transition ${
                      isActive ? "bg-aether-sky/10" : ""
                    }`}
                  >
                    <div className="flex justify-center">
                      {getWeatherIcon(h.AETHER)}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Row 2: AETHER Calibrated Blend */}
            <tr className="hover:bg-surface-secondary/40 transition font-mono">
              <td className="py-1.5 px-2 font-bold text-text-primary flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-aether-sky" />
                <span>AETHER Blend</span>
              </td>
              {horizons.map((h) => {
                const isActive = leadTimeHours === h.horizon_hours;
                return (
                  <td
                    key={h.lead_time}
                    onClick={() => setLeadTimeHours(h.horizon_hours)}
                    className={`py-1.5 px-2 text-center cursor-pointer transition ${
                      isActive ? "bg-aether-sky/15" : ""
                    }`}
                  >
                    <span className="font-extrabold text-sm text-text-primary">
                      {h.AETHER}
                    </span>
                    <span className="text-[10px] text-text-muted ml-0.5">
                      {getUnit()}
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Row 3: ECMWF AIFS (Leading AI NWP) */}
            <tr className="hover:bg-surface-secondary/40 transition font-mono">
              <td className="py-1.5 px-2 text-text-secondary flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-blue-500" />
                <span>ECMWF AIFS</span>
              </td>
              {horizons.map((h) => {
                const isActive = leadTimeHours === h.horizon_hours;
                return (
                  <td
                    key={h.lead_time}
                    onClick={() => setLeadTimeHours(h.horizon_hours)}
                    className={`py-1.5 px-2 text-center cursor-pointer text-text-secondary transition ${
                      isActive ? "bg-aether-sky/10" : ""
                    }`}
                  >
                    {h.AIFS} {getUnit()}
                  </td>
                );
              })}
            </tr>

            {/* Row 4: Spread (σ) */}
            <tr className="hover:bg-surface-secondary/40 transition font-mono text-[11px]">
              <td className="py-1.5 px-2 text-text-muted flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-text-muted" />
                <span>Spread (σ)</span>
              </td>
              {horizons.map((h) => {
                const isActive = leadTimeHours === h.horizon_hours;
                const spread = ((h.upper - h.lower) / 2).toFixed(1);
                return (
                  <td
                    key={h.lead_time}
                    onClick={() => setLeadTimeHours(h.horizon_hours)}
                    className={`py-1.5 px-2 text-center cursor-pointer text-text-muted transition ${
                      isActive ? "bg-aether-sky/10" : ""
                    }`}
                  >
                    ±{spread}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
