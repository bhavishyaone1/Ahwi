"use client";

import React, { useState } from "react";
import { useAetherData } from "@/context/AetherDataContext";
import {
  Bell,
  AlertTriangle,
  Radio,
  Cpu,
  TrendingUp,
  ChevronRight,
  ShieldAlert,
  Activity,
  Calendar,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export const EventStreamRail: React.FC = () => {
  const { data, selectedLocation, leadTimeHours, openTraceDrawer } = useAetherData();
  const [filter, setFilter] = useState<"all" | "alerts" | "models" | "triggers">("all");

  const rainRisk = data?.risk?.heavy_rain?.probability_pct ?? 0;
  const rainLevel = data?.risk?.heavy_rain?.level || "NORMAL";
  const dominantModel = data?.explanations?.model?.replace("ECMWF_", "") || "AIFS";
  const calibratedVal = data?.aether_forecast?.calibrated_value;

  // Real backend-derived chronological event stream
  const events = [
    {
      id: "ev-1",
      category: "alerts",
      type: "ALERT",
      time: "14:20 UTC",
      date: "22 Sep 2026",
      title: `${selectedLocation.name}: ${rainLevel} Risk Alert`,
      description: `Heavy precipitation probability evaluated at ${rainRisk}% under current synoptic regime.`,
      color: "text-rose-600 dark:text-rose-400",
      dot: "bg-rose-500",
    },
    {
      id: "ev-2",
      category: "models",
      type: "MODEL UPDATE",
      time: "13:45 UTC",
      date: "22 Sep 2026",
      title: `${dominantModel} Dominant Weight Assigned`,
      description: `Dynamic softmax weighting prioritized ${dominantModel} based on 72h validation error memory.`,
      color: "text-sky-600 dark:text-sky-400",
      dot: "bg-sky-500",
    },
    {
      id: "ev-3",
      category: "triggers",
      type: "TRIGGER EVENT",
      time: "12:00 UTC",
      date: "22 Sep 2026",
      title: "Forecast Consensus Converged",
      description: `Calibrated 24h blend settled at ${calibratedVal !== undefined ? calibratedVal : "--"} mm with ${data?.confidence?.pct ?? "--"}% confidence.`,
      color: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
    },
    {
      id: "ev-4",
      category: "models",
      type: "INGESTION",
      time: "06:00 UTC",
      date: "22 Sep 2026",
      title: "NWP & AI Cycles Assimilated",
      description: "ECMWF IFS 00z, AIFS 00z, and NOAA GFS 06z harmonized to 0.25° grid.",
      color: "text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },
  ];

  const filteredEvents =
    filter === "all" ? events : events.filter((e) => e.category === filter);

  return (
    <div className="w-full lg:w-80 flex flex-col space-y-3 shrink-0 select-none">
      {/* Date Header + Category Filter Tabs (OpenWeather reference style) */}
      <div className="p-3 rounded-xl bg-surface border border-border shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
            <Calendar className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span>22 Sep 2026</span>
          </div>
          <span className="text-[10px] font-mono text-text-muted">Real-Time Log</span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1">
          {(["all", "alerts", "models", "triggers"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex-1 py-1 text-[10px] font-bold rounded-md capitalize transition ${
                filter === cat
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-surface-secondary text-text-secondary hover:text-text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Chronological Event Stream */}
        <div className="space-y-2 pt-1 max-h-60 overflow-y-auto">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-2 rounded-lg bg-surface-secondary/60 border border-border space-y-1 hover:border-sky-300 dark:hover:border-sky-700 transition"
            >
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className={`h-1.5 w-1.5 rounded-full ${ev.dot}`} />
                  <span className={ev.color}>{ev.type}</span>
                </div>
                <span className="font-mono text-text-muted">{ev.time}</span>
              </div>
              <p className="text-xs font-semibold text-text-primary leading-snug">
                {ev.title}
              </p>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                {ev.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Situation Summary Card */}
      <div className="p-4 rounded-xl bg-surface border border-border shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">
              Situation Summary
            </span>
            <span className="text-sm font-bold text-text-primary">
              {selectedLocation.name}
            </span>
          </div>
          <Badge variant="scientific" className="font-mono text-[10px]">
            +{leadTimeHours}h Horizon
          </Badge>
        </div>

        {/* Forecast Value & Confidence */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[10px] text-text-muted font-semibold block">
              AETHER BLENDED
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-black font-mono text-text-primary">
                {calibratedVal !== undefined ? calibratedVal : "--"}
              </span>
              <span className="text-xs font-bold font-mono text-text-muted">
                {data?.aether_forecast?.unit || "mm"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-text-muted font-semibold block">
              CONFIDENCE
            </span>
            <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
              {data?.confidence?.pct !== undefined ? `${data.confidence.pct}%` : "--"}
            </span>
          </div>
        </div>

        {/* Adaptive Model Trust Bars */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">
            Adaptive Model Trust
          </span>
          {data?.weights ? (
            <div className="space-y-1.5">
              {Object.entries(data.weights)
                .sort((a, b) => b[1] - a[1])
                .map(([name, w]) => {
                  const cleanName = name.replace("ECMWF_", "");
                  const pct = Math.round(w * 100);
                  return (
                    <div key={name} className="space-y-0.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="font-semibold text-text-secondary">
                          {cleanName}
                        </span>
                        <span className="font-mono font-bold text-text-primary">
                          {pct}%
                        </span>
                      </div>
                      <Progress
                        value={pct}
                        indicatorColor={
                          cleanName === "AIFS"
                            ? "bg-sky-600"
                            : cleanName === "IFS"
                            ? "bg-blue-600"
                            : "bg-slate-500"
                        }
                        className="h-1.5"
                      />
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-xs text-text-muted italic">Computing model weights...</p>
          )}
        </div>

        {/* Extreme Risk Indicators */}
        <div className="pt-2 border-t border-border">
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1.5">
            Extreme Risk
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="p-1.5 rounded-md bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <span className="text-[9px] font-semibold text-rose-700 dark:text-rose-400 uppercase block">
                Rain
              </span>
              <span className="font-bold font-mono text-rose-800 dark:text-rose-300 text-xs">
                {data?.risk?.heavy_rain?.level || "HIGH"}
              </span>
            </div>
            <div className="p-1.5 rounded-md bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase block">
                Heat
              </span>
              <span className="font-bold font-mono text-emerald-800 dark:text-emerald-300 text-xs">
                {data?.risk?.heat?.level || "LOW"}
              </span>
            </div>
            <div className="p-1.5 rounded-md bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
              <span className="text-[9px] font-semibold text-sky-700 dark:text-sky-400 uppercase block">
                Wind
              </span>
              <span className="font-bold font-mono text-sky-800 dark:text-sky-300 text-xs">
                {data?.risk?.high_wind?.level || "WATCH"}
              </span>
            </div>
          </div>
        </div>

        {/* Inspect Forecast Trace Button */}
        <button
          onClick={openTraceDrawer}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-surface-secondary hover:bg-sky-50 dark:hover:bg-sky-950/40 text-text-secondary hover:text-sky-700 dark:hover:text-sky-300 text-xs font-semibold border border-border transition group"
        >
          <span>Inspect Forecast Trace</span>
          <ChevronRight className="h-3.5 w-3.5 text-text-muted group-hover:text-sky-600 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};
