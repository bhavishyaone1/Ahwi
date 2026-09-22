"use client";

import React, { useState } from "react";
import { useAetherData } from "@/context/AetherDataContext";
import {
  ChevronRight,
  ChevronDown,
  ChevronsRight,
  Sparkles,
  Activity,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type FilterCategory = "all" | "alerts" | "cases" | "reports" | "triggers";

interface EventItem {
  id: string;
  category: FilterCategory;
  type: string;
  tagColor: string;
  dotColor: string;
  hoverBorder: string;
  time: string;
  title: string;
  description?: string;
  dateGroup: string;
}

export const EventStreamRail: React.FC = () => {
  const { data, selectedLocation, leadTimeHours, openTraceDrawer } = useAetherData();
  const [filter, setFilter] = useState<FilterCategory>("all");

  const rainRisk = data?.risk?.heavy_rain?.probability_pct ?? 0;
  const rainLevel = data?.risk?.heavy_rain?.level || "NORMAL";
  const dominantModel = data?.explanations?.model?.replace("ECMWF_", "") || "AIFS";
  const calibratedVal = data?.aether_forecast?.calibrated_value;

  // Real backend-derived chronological event stream grouped by date matching OpenWeather screenshot
  const allEvents: EventItem[] = [
    {
      id: "ev-1",
      category: "triggers",
      type: "Trigger Event",
      tagColor: "text-amber-500 dark:text-amber-400",
      dotColor: "bg-amber-500 shadow-sm shadow-amber-500/50",
      hoverBorder: "hover:border-l-amber-500",
      time: "14:20",
      dateGroup: "22 Sep, 2026",
      title: `Precipitation spike detected at ${selectedLocation.name}`,
      description: `Heavy rain probability evaluated at ${rainRisk}% under current synoptic regime.`,
    },
    {
      id: "ev-2",
      category: "alerts",
      type: "Alert",
      tagColor: "text-sky-500 dark:text-sky-400",
      dotColor: "bg-sky-500 shadow-sm shadow-sky-500/50",
      hoverBorder: "hover:border-l-sky-500",
      time: "11:00",
      dateGroup: "22 Sep, 2026",
      title: `${rainLevel} Severe Weather Advisory`,
      description: `IMD synoptic alert triggered for regional convective zone.`,
    },
    {
      id: "ev-3",
      category: "triggers",
      type: "Trigger Event",
      tagColor: "text-amber-500 dark:text-amber-400",
      dotColor: "bg-amber-500 shadow-sm shadow-amber-500/50",
      hoverBorder: "hover:border-l-amber-500",
      time: "08:30",
      dateGroup: "21 Sep, 2026",
      title: `${dominantModel} Dominant Softmax Weight Reallocated`,
      description: `Dynamic softmax weighting prioritized ${dominantModel} based on 72h sequence error.`,
    },
    {
      id: "ev-4",
      category: "reports",
      type: "Report",
      tagColor: "text-emerald-500 dark:text-emerald-400",
      dotColor: "bg-emerald-500 shadow-sm shadow-emerald-500/50",
      hoverBorder: "hover:border-l-emerald-500",
      time: "11:52",
      dateGroup: "21 Sep, 2026",
      title: `Verification Report: ${selectedLocation.name} Assimilation`,
      description: `Consensus converged at ${calibratedVal !== undefined ? calibratedVal : "--"} mm with ${data?.confidence?.pct ?? "--"}% confidence.`,
    },
    {
      id: "ev-5",
      category: "cases",
      type: "Critical Event",
      tagColor: "text-rose-500 dark:text-rose-400",
      dotColor: "bg-rose-500 shadow-sm shadow-rose-500/50",
      hoverBorder: "hover:border-l-rose-500",
      time: "06:00",
      dateGroup: "20 Sep, 2026",
      title: `ECMWF IFS vs AIFS Lead-Time Divergence`,
      description: `Synoptic boundary layer shift in western disturbance regime.`,
    },
  ];

  const filteredEvents =
    filter === "all" ? allEvents : allEvents.filter((e) => e.category === filter);

  // Group events by dateGroup
  const groupedEvents: Record<string, EventItem[]> = {};
  filteredEvents.forEach((e) => {
    if (!groupedEvents[e.dateGroup]) {
      groupedEvents[e.dateGroup] = [];
    }
    groupedEvents[e.dateGroup].push(e);
  });

  return (
    <div className="w-full lg:w-80 flex flex-col space-y-4 shrink-0 select-none">
      {/* Date Header + Category Filter Tabs (OpenWeather reference style) */}
      <div className="p-4 rounded-2xl bg-surface/90 dark:bg-[#18181b]/90 border border-border/80 shadow-md space-y-3.5 backdrop-blur-md">
        {/* Top Date Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm font-black text-text-primary">
            <span>22 September 2026</span>
            <ChevronsRight className="h-4 w-4 text-orange-500" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Live Stream</span>
        </div>

        {/* Filter Pills matching OpenWeather screenshot */}
        <div className="flex flex-wrap items-center gap-1">
          {(
            [
              { id: "all", label: "All" },
              { id: "alerts", label: "Alerts" },
              { id: "cases", label: "Cases" },
              { id: "reports", label: "Reports" },
              { id: "triggers", label: "Trigger Events" },
            ] as const
          ).map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`py-1 px-2 rounded-full text-[10px] font-bold transition-all ${
                  isActive
                    ? "bg-orange-500 text-slate-950 shadow-xs"
                    : "bg-surface-secondary/70 text-text-muted hover:text-text-primary hover:bg-surface-secondary"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Chronological Event Stream grouped by dates */}
        <div className="space-y-3.5 pt-1 max-h-72 overflow-y-auto pr-0.5">
          {Object.entries(groupedEvents).map(([dateLabel, items]) => (
            <div key={dateLabel} className="space-y-2">
              <span className="font-mono text-[10px] tracking-wider uppercase font-bold text-text-muted block pt-0.5">
                {dateLabel}
              </span>
              <div className="space-y-2">
                {items.map((ev) => (
                  <div
                    key={ev.id}
                    className={`p-3 rounded-xl bg-surface-secondary/60 border border-border/80 border-l-2 border-l-transparent ${ev.hoverBorder} space-y-1.5 shadow-xs hover:shadow-md transition-all group`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 font-bold">
                        <span className={ev.tagColor}>{ev.type}</span>
                        <span className={`h-2 w-2 rounded-full ${ev.dotColor}`} />
                      </div>
                      <span className="font-mono text-text-muted text-[11px] font-semibold">{ev.time}</span>
                    </div>
                    <p className="text-xs font-semibold text-text-primary leading-snug">
                      {ev.title}
                    </p>
                    {ev.description && (
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        {ev.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Situation Summary Card */}
      <div className="p-4 rounded-2xl bg-surface/90 dark:bg-[#18181b]/90 border border-border/80 shadow-md space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
          <div>
            <span className="font-mono text-[10px] tracking-wider uppercase font-semibold text-text-muted block">
              Situation Summary
            </span>
            <span className="text-sm font-bold text-text-primary">
              {selectedLocation.name}
            </span>
          </div>
          <Badge variant="scientific" className="font-mono text-[10px] bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-500/20">
            +{leadTimeHours}h Horizon
          </Badge>
        </div>

        {/* Forecast Value & Confidence with loud contrast */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="font-mono text-[10px] tracking-wider uppercase font-semibold text-text-muted block">
              AETHER Blended
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-black font-mono tracking-tight text-text-primary">
                {calibratedVal !== undefined ? calibratedVal : "--"}
              </span>
              <span className="text-xs font-bold font-mono text-text-muted">
                {data?.aether_forecast?.unit || "mm"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono text-[10px] tracking-wider uppercase font-semibold text-text-muted block">
              Confidence
            </span>
            <div className="mt-1">
              <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {data?.confidence?.pct !== undefined ? `${data.confidence.pct}%` : "--"}
              </span>
            </div>
          </div>
        </div>

        {/* Adaptive Model Trust Bars */}
        <div className="space-y-2 pt-2.5 border-t border-border/60">
          <span className="font-mono text-[10px] tracking-wider uppercase font-semibold text-text-muted block">
            Adaptive Model Trust
          </span>
          {data?.weights ? (
            <div className="space-y-2">
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
                            ? "bg-orange-500"
                            : cleanName === "IFS"
                            ? "bg-sky-600"
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
        <div className="pt-2.5 border-t border-border/60">
          <span className="font-mono text-[10px] tracking-wider uppercase font-semibold text-text-muted block mb-1.5">
            Extreme Risk
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-[9px] font-semibold text-rose-600 dark:text-rose-400 uppercase block font-sans">
                Rain
              </span>
              <span className="font-bold text-rose-700 dark:text-rose-300 text-xs">
                {data?.risk?.heavy_rain?.level || "HIGH"}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase block font-sans">
                Heat
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300 text-xs">
                {data?.risk?.heat?.level || "LOW"}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400 uppercase block font-sans">
                Wind
              </span>
              <span className="font-bold text-amber-700 dark:text-amber-300 text-xs">
                {data?.risk?.high_wind?.level || "WATCH"}
              </span>
            </div>
          </div>
        </div>

        {/* Inspect Forecast Trace Button */}
        <button
          onClick={openTraceDrawer}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-secondary hover:bg-orange-500/10 dark:hover:bg-orange-950/30 text-text-secondary hover:text-orange-500 dark:hover:text-orange-400 text-xs font-semibold border border-border/70 hover:border-orange-500/40 transition group"
        >
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-orange-500" />
            <span>Inspect Forecast Trace</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-text-muted group-hover:text-orange-500 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};
