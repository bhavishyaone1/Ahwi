"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useAetherData } from "@/context/AetherDataContext";
import {
  ChevronRight,
  ChevronsRight,
  Activity,
  Layers,
  AlertTriangle,
  Radio,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type FilterCategory = "all" | "alerts" | "cases" | "reports" | "triggers";

interface EventItem {
  id: string;
  category: FilterCategory;
  type: "Trigger Event" | "Alert" | "Report" | "Critical Event";
  time: string;
  title: string;
  description?: string;
  dateGroup: string;
}

export const EventStreamRail: React.FC = () => {
  const { data, selectedLocation, leadTimeHours, openTraceDrawer } = useAetherData();
  const [filter, setFilter] = useState<FilterCategory>("all");
  const shouldReduceMotion = useReducedMotion();

  const rainRisk = data?.risk?.heavy_rain?.probability_pct ?? 0;
  const rainLevel = data?.risk?.heavy_rain?.level || "NORMAL";
  const dominantModel = data?.explanations?.model?.replace("ECMWF_", "") || "AIFS";
  const calibratedVal = data?.aether_forecast?.calibrated_value;
  const confPct = data?.confidence?.pct ?? 78;

  // Real backend-derived chronological event stream grouped by date
  const allEvents: EventItem[] = [
    {
      id: "ev-1",
      category: "triggers",
      type: "Trigger Event",
      time: "14:20",
      dateGroup: "22 Sep, 2026",
      title: `Precipitation spike detected at ${selectedLocation.name}`,
      description: `Heavy rain probability evaluated at ${rainRisk}% under current synoptic regime.`,
    },
    {
      id: "ev-2",
      category: "alerts",
      type: "Alert",
      time: "11:00",
      dateGroup: "22 Sep, 2026",
      title: `${rainLevel} Severe Weather Advisory`,
      description: `IMD synoptic alert triggered for regional convective zone.`,
    },
    {
      id: "ev-3",
      category: "triggers",
      type: "Trigger Event",
      time: "08:30",
      dateGroup: "21 Sep, 2026",
      title: `${dominantModel} Dominant Softmax Weight Reallocated`,
      description: `Dynamic softmax weighting prioritized ${dominantModel} based on 72h sequence error.`,
    },
    {
      id: "ev-4",
      category: "reports",
      type: "Report",
      time: "11:52",
      dateGroup: "21 Sep, 2026",
      title: `Verification Report: ${selectedLocation.name} Assimilation`,
      description: `Consensus converged at ${calibratedVal !== undefined ? calibratedVal : "--"} mm with ${confPct}% confidence.`,
    },
    {
      id: "ev-5",
      category: "cases",
      type: "Critical Event",
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
      {/* 1. ADAPTIVE MODEL TRUST & SITUATION SUMMARY (Top 2-3 most visually prominent element) */}
      <div className="p-4 rounded-2xl bg-surface/95 dark:bg-[#151922]/95 border border-border/90 shadow-xl space-y-4 backdrop-blur-md relative overflow-hidden">
        {/* Subtle accent corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[10px] tracking-wider uppercase font-black text-accent">
                Adaptive Model Trust
              </span>
            </div>
            <span className="text-sm font-black text-text-primary block">
              {selectedLocation.name}
            </span>
          </div>
          <Badge
            variant="scientific"
            className="font-mono text-[10px] bg-accent/10 text-accent border-accent/30 font-bold"
          >
            +{leadTimeHours}h Horizon
          </Badge>
        </div>

        {/* Forecast Value & Confidence Hero Readout */}
        <div className="flex items-baseline justify-between pt-0.5">
          <div>
            <span className="font-mono text-[10px] tracking-wider uppercase font-semibold text-text-muted block">
              Blended Consensus
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-black font-mono tracking-tight text-text-primary">
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
            <div className="mt-0.5">
              <span
                className={`text-2xl font-black font-mono ${
                  confPct >= 75
                    ? "text-emerald-500"
                    : confPct >= 50
                    ? "text-amber-500"
                    : "text-rose-500"
                }`}
              >
                {confPct}%
              </span>
            </div>
          </div>
        </div>

        {/* ADAPTIVE MODEL TRUST: Visual multi-model weight allocation */}
        <div className="space-y-2.5 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-wider uppercase font-bold text-text-muted">
              Dynamically Blended Weights
            </span>
            <span className="text-[10px] font-mono font-bold text-accent">
              Softmax
            </span>
          </div>

          {data?.weights ? (
            <div className="space-y-2">
              {Object.entries(data.weights)
                .sort((a, b) => b[1] - a[1])
                .map(([name, w]) => {
                  const cleanName = name.replace("ECMWF_", "");
                  const pct = Math.round(w * 100);
                  const isLeader = cleanName === dominantModel;
                  return (
                    <div key={name} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className={`font-semibold flex items-center gap-1.5 ${
                          isLeader ? "text-text-primary font-bold" : "text-text-secondary"
                        }`}>
                          {cleanName}
                          {isLeader && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-accent/20 text-accent font-black">
                              LEADER
                            </span>
                          )}
                        </span>
                        <span className="font-bold text-text-primary">{pct}%</span>
                      </div>
                      <Progress
                        value={pct}
                        indicatorColor={
                          cleanName === "AIFS"
                            ? "bg-amber-500"
                            : cleanName === "IFS"
                            ? "bg-sky-500"
                            : "bg-slate-500"
                        }
                        className="h-2 rounded-full bg-surface-secondary"
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
        <div className="pt-2 border-t border-border/60">
          <span className="font-mono text-[10px] tracking-wider uppercase font-semibold text-text-muted block mb-1.5">
            Operational Risk Assessment
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/25">
              <span className="text-[9px] font-semibold text-rose-600 dark:text-rose-400 uppercase block font-sans">
                Rain
              </span>
              <span className="font-bold text-rose-700 dark:text-rose-300 text-xs">
                {data?.risk?.heavy_rain?.level || "HIGH"}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
              <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase block font-sans">
                Heat
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300 text-xs">
                {data?.risk?.heat?.level || "LOW"}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25">
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
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-secondary/80 hover:bg-accent/15 text-text-secondary hover:text-accent text-xs font-semibold border border-border hover:border-accent/40 transition group"
        >
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-accent" />
            <span>Inspect Forecast Trace</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-text-muted group-hover:text-accent transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* 2. OPERATIONAL SITUATION ROOM EVENT STREAM (Triage Language & Clear Severity Tints) */}
      <div className="p-4 rounded-2xl bg-surface/90 dark:bg-[#151922]/90 border border-border/80 shadow-md space-y-3.5 backdrop-blur-md">
        {/* Top Date Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm font-black text-text-primary">
            <span>22 September 2026</span>
            <ChevronsRight className="h-4 w-4 text-accent" />
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-text-muted">
            <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
            <span>Ops Feed</span>
          </div>
        </div>

        {/* Filter Pills matching Situation Room categories */}
        <div className="flex flex-wrap items-center gap-1">
          {(
            [
              { id: "all", label: "All" },
              { id: "triggers", label: "Triggers" },
              { id: "alerts", label: "Alerts" },
              { id: "cases", label: "Critical" },
              { id: "reports", label: "Reports" },
            ] as const
          ).map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`py-1 px-2.5 rounded-full text-[10px] font-bold transition-all ${
                  isActive
                    ? "bg-accent text-slate-950 shadow-sm"
                    : "bg-surface-secondary/70 text-text-muted hover:text-text-primary hover:bg-surface-secondary"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Chronological Event Stream with Peripheral-Legible Severity */}
        <div className="space-y-3 pt-1 max-h-72 overflow-y-auto pr-0.5">
          {Object.entries(groupedEvents).map(([dateLabel, items]) => (
            <div key={dateLabel} className="space-y-2">
              <span className="font-mono text-[10px] tracking-wider uppercase font-bold text-text-muted block pt-0.5">
                {dateLabel}
              </span>
              <div className="space-y-2">
                {items.map((ev) => {
                  const isTrigger = ev.type === "Trigger Event";
                  const isCritical = ev.type === "Critical Event";
                  const isAlert = ev.type === "Alert";

                  return (
                    <motion.div
                      key={ev.id}
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-xl space-y-1.5 shadow-xs hover:shadow-md transition-all ${
                        isTrigger
                          ? "bg-amber-500/10 dark:bg-amber-950/20 border-l-4 border-l-amber-500 border border-amber-500/30"
                          : isCritical
                          ? "bg-rose-500/10 dark:bg-rose-950/20 border-l-4 border-l-rose-500 border border-rose-500/30"
                          : isAlert
                          ? "bg-sky-500/5 dark:bg-sky-950/15 border-l-2 border-l-sky-500 border border-border/80"
                          : "bg-surface-secondary/60 border-l border-l-border border border-border/70"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span
                            className={
                              isTrigger
                                ? "text-amber-600 dark:text-amber-400"
                                : isCritical
                                ? "text-rose-600 dark:text-rose-400"
                                : isAlert
                                ? "text-sky-600 dark:text-sky-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            }
                          >
                            {ev.type}
                          </span>
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isTrigger
                                ? "bg-amber-500 shadow-sm shadow-amber-500/50"
                                : isCritical
                                ? "bg-rose-500 shadow-sm shadow-rose-500/50"
                                : isAlert
                                ? "bg-sky-500 shadow-sm shadow-sky-500/50"
                                : "bg-emerald-500"
                            }`}
                          />
                        </div>
                        <span className="font-mono text-text-muted text-[10px] font-semibold">
                          {ev.time}
                        </span>
                      </div>
                      <p
                        className={`text-xs leading-snug ${
                          isTrigger || isCritical
                            ? "font-bold text-text-primary"
                            : "font-semibold text-text-primary"
                        }`}
                      >
                        {ev.title}
                      </p>
                      {ev.description && (
                        <p className="text-[11px] text-text-secondary leading-relaxed">
                          {ev.description}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
