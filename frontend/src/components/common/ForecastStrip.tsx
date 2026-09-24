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
        <CloudRain className="h-4 w-4 text-info" />
      ) : val > 2 ? (
        <CloudSun className="h-4 w-4 text-accent/80" />
      ) : idx % 2 === 0 ? (
        <Moon className="h-4 w-4 text-accent-hover" />
      ) : (
        <CloudSun className="h-4 w-4 text-accent" />
      );
    }
    if (variable === "temperature_c") {
      return val > 35 ? (
        <Sun className="h-4 w-4 text-accent" />
      ) : (
        <CloudSun className="h-4 w-4 text-info" />
      );
    }
    return <Wind className="h-4 w-4 text-text-muted" />;
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
              <th className="py-2.5 px-3 w-44 text-[10px] font-bold uppercase tracking-[0.08em] text-text-muted/80">
                Operational Horizon
              </th>
              {horizons.map((h) => {
                const isActive = leadTimeHours === h.horizon_hours;
                return (
                  <th
                    key={h.lead_time}
                    onClick={() => setLeadTimeHours(h.horizon_hours)}
                    className={`py-2 px-3 text-center cursor-pointer transition rounded-t-lg font-mono ${
                      isActive
                        ? "bg-accent/15 text-accent font-bold border-b-2 border-accent"
                        : "hover:bg-surface-2 text-text-secondary"
                    }`}
                  >
                    <div className="text-xs font-bold tracking-tight">{getHorizonTimeLabel(h.lead_time, h.horizon_hours)}</div>
                    <div className="text-[9px] opacity-70 font-semibold">{h.lead_time}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {/* Row 1: Weather Condition Icon */}
            <tr className="hover:bg-surface-2/40 transition">
              <td className="py-2.5 px-3 font-semibold text-text-secondary flex items-center gap-2">
                <CloudSun className="h-4 w-4 text-text-muted shrink-0" />
                <span className="font-sans text-[11px]">Sky Condition</span>
              </td>
              {horizons.map((h, idx) => {
                const isActive = leadTimeHours === h.horizon_hours;
                return (
                  <td
                    key={h.lead_time}
                    onClick={() => setLeadTimeHours(h.horizon_hours)}
                    className={`py-2.5 px-3 text-center cursor-pointer transition ${
                      isActive ? "bg-accent/10" : ""
                    }`}
                  >
                    <div className="flex justify-center items-center">
                      {getWeatherIcon(h.AETHER, idx)}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Row 2: Convective Advisory */}
            <tr className="hover:bg-surface-2/40 transition font-mono">
              <td className="py-2 px-3 text-text-secondary flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-text-muted shrink-0" />
                <span className="font-sans text-[11px] font-semibold">Advisory Tier</span>
              </td>
              {horizons.map((h) => {
                const isActive = leadTimeHours === h.horizon_hours;
                const hasAlert = h.AETHER > 40;
                return (
                  <td
                    key={h.lead_time}
                    onClick={() => setLeadTimeHours(h.horizon_hours)}
                    className={`py-2 px-3 text-center cursor-pointer transition text-[11px] ${
                      isActive ? "bg-accent/10" : ""
                    }`}
                  >
                    {hasAlert ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-danger/15 text-danger border border-danger/30">
                        Rain Alert
                      </span>
                    ) : (
                      <span className="text-text-muted font-bold">-</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Row 3: Blended Consensus */}
            <tr className="hover:bg-surface-2/40 transition font-mono tabular-nums">
              <td className="py-2.5 px-3 font-bold text-text-primary flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
                <span className="font-sans text-[11px]">
                  {variable === "rainfall_mm" ? "Blended Rain (mm)" : "Blended Temp (°C)"}
                </span>
              </td>
              {horizons.map((h) => {
                const isActive = leadTimeHours === h.horizon_hours;
                return (
                  <td
                    key={h.lead_time}
                    onClick={() => setLeadTimeHours(h.horizon_hours)}
                    className={`py-2.5 px-3 text-center cursor-pointer transition ${
                      isActive ? "bg-accent/15" : ""
                    }`}
                  >
                    <span className="font-black text-sm font-mono tracking-tight text-text-primary">
                      {Math.round(h.AETHER)}
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Row 4: Relative Humidity % */}
            <tr className="hover:bg-surface-2/40 transition font-mono tabular-nums text-[11px]">
              <td className="py-2 px-3 text-text-muted flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                <span className="font-sans text-[11px]">Relative Humidity (%)</span>
              </td>
              {horizons.map((h, idx) => {
                const isActive = leadTimeHours === h.horizon_hours;
                const simulatedHumidity = Math.min(96, Math.max(62, 68 + (idx * 2)));
                return (
                  <td
                    key={h.lead_time}
                    onClick={() => setLeadTimeHours(h.horizon_hours)}
                    className={`py-2 px-3 text-center cursor-pointer text-text-secondary transition ${
                      isActive ? "bg-accent/10 text-text-primary font-bold" : ""
                    }`}
                  >
                    {simulatedHumidity}%
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
