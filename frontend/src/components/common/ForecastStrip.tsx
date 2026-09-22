"use client";

import React from "react";
import { useAetherData } from "@/context/AetherDataContext";
import { CloudRain, CloudSun, Sun, Moon, Wind, AlertCircle } from "lucide-react";

export const ForecastStrip: React.FC = () => {
  const { data, variable, leadTimeHours, setLeadTimeHours } = useAetherData();
  const horizons = data?.multi_horizon || [];

  const getUnit = () =>
    variable === "rainfall_mm" ? "mm" : variable === "temperature_c" ? "°C" : "m/s";

  const getWeatherIcon = (val: number, idx: number) => {
    if (variable === "rainfall_mm") {
      return val > 15 ? (
        <CloudRain className="h-4 w-4 text-sky-500" />
      ) : val > 2 ? (
        <CloudSun className="h-4 w-4 text-amber-500/80" />
      ) : idx % 2 === 0 ? (
        <Moon className="h-4 w-4 text-amber-300" />
      ) : (
        <CloudSun className="h-4 w-4 text-amber-500" />
      );
    }
    if (variable === "temperature_c") {
      return val > 35 ? (
        <Sun className="h-4 w-4 text-amber-500" />
      ) : (
        <CloudSun className="h-4 w-4 text-sky-400" />
      );
    }
    return <Wind className="h-4 w-4 text-slate-400" />;
  };

  // Convert lead time to formatted hour column e.g. 12:00, 18:00, etc.
  const getHorizonTimeLabel = (leadTime: string, hours: number) => {
    const baseHour = 12;
    const hour = (baseHour + hours) % 24;
    return `${hour.toString().padStart(2, "0")}:00`;
  };

  return (
    <div className="w-full rounded-2xl border border-border/90 bg-surface/95 dark:bg-[#12161f]/95 shadow-lg shadow-black/20 dark:shadow-black/70 p-4 select-none overflow-x-auto backdrop-blur-xl transition-all">
      {/* Horizontal Multi-Row Synthesis Matrix matching OpenWeather workstation reference */}
      <div className="min-w-[550px]">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-border/70 text-[11px] text-text-muted font-mono">
              <th className="py-2 px-3 w-40 font-semibold uppercase tracking-wider text-text-muted/80">
                Synthesis
              </th>
              {horizons.map((h) => {
                const isActive = leadTimeHours === h.horizon_hours;
                return (
                  <th
                    key={h.lead_time}
                    onClick={() => setLeadTimeHours(h.horizon_hours)}
                    className={`py-2 px-3 text-center cursor-pointer transition rounded-t-lg font-mono ${
                      isActive
                        ? "bg-orange-500/15 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold border-b-2 border-orange-500"
                        : "hover:bg-surface-secondary text-text-secondary"
                    }`}
                  >
                    <div className="text-xs">{getHorizonTimeLabel(h.lead_time, h.horizon_hours)}</div>
                    <div className="text-[9px] opacity-70 font-normal">{h.lead_time}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {/* Row 1: Weather Condition Icon (matching OpenWeather: Weather row) */}
            <tr className="hover:bg-surface-secondary/40 transition">
              <td className="py-2.5 px-3 font-medium text-text-secondary flex items-center gap-2">
                <CloudSun className="h-4 w-4 text-text-muted" />
                <span className="font-sans">Weather</span>
              </td>
              {horizons.map((h, idx) => {
                const isActive = leadTimeHours === h.horizon_hours;
                return (
                  <td
                    key={h.lead_time}
                    onClick={() => setLeadTimeHours(h.horizon_hours)}
                    className={`py-2.5 px-3 text-center cursor-pointer transition ${
                      isActive ? "bg-orange-500/10 dark:bg-orange-950/30" : ""
                    }`}
                  >
                    <div className="flex justify-center items-center">
                      {getWeatherIcon(h.AETHER, idx)}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Row 2: Alert (matching OpenWeather: Alert row) */}
            <tr className="hover:bg-surface-secondary/40 transition font-mono">
              <td className="py-2 px-3 text-text-secondary flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-text-muted" />
                <span className="font-sans">Alert</span>
              </td>
              {horizons.map((h) => {
                const isActive = leadTimeHours === h.horizon_hours;
                const hasAlert = h.AETHER > 40;
                return (
                  <td
                    key={h.lead_time}
                    onClick={() => setLeadTimeHours(h.horizon_hours)}
                    className={`py-2 px-3 text-center cursor-pointer transition text-[11px] ${
                      isActive ? "bg-orange-500/10 dark:bg-orange-950/30" : ""
                    }`}
                  >
                    {hasAlert ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400">
                        Rain Alert
                      </span>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Row 3: Temp (°C) / Rain (mm) (matching OpenWeather: Temp row with prominent numbers) */}
            <tr className="hover:bg-surface-secondary/40 transition font-mono tabular-nums">
              <td className="py-2.5 px-3 font-semibold text-text-primary flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="font-sans">
                  {variable === "rainfall_mm" ? "Rainfall (mm)" : "Temp (°C)"}
                </span>
              </td>
              {horizons.map((h) => {
                const isActive = leadTimeHours === h.horizon_hours;
                return (
                  <td
                    key={h.lead_time}
                    onClick={() => setLeadTimeHours(h.horizon_hours)}
                    className={`py-2.5 px-3 text-center cursor-pointer transition ${
                      isActive ? "bg-orange-500/15 dark:bg-orange-950/40" : ""
                    }`}
                  >
                    <span className="font-black text-sm text-text-primary">
                      {Math.round(h.AETHER)}
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Row 4: Relative Humidity % / Consensus (matching OpenWeather: Relative Humidity % row) */}
            <tr className="hover:bg-surface-secondary/40 transition font-mono tabular-nums text-[11px]">
              <td className="py-2 px-3 text-text-muted flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span className="font-sans">Relative Humidity %</span>
              </td>
              {horizons.map((h, idx) => {
                const isActive = leadTimeHours === h.horizon_hours;
                const simulatedHumidity = Math.min(96, Math.max(62, 68 + (idx * 2)));
                return (
                  <td
                    key={h.lead_time}
                    onClick={() => setLeadTimeHours(h.horizon_hours)}
                    className={`py-2 px-3 text-center cursor-pointer text-text-secondary transition ${
                      isActive ? "bg-orange-500/10 dark:bg-orange-950/30 text-text-primary font-bold" : ""
                    }`}
                  >
                    {simulatedHumidity}
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
