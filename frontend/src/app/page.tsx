"use client";

import React from "react";
import { motion } from "motion/react";
import { useAetherData } from "@/context/AetherDataContext";
import { WeatherMap } from "@/components/map/WeatherMap";
import { EventStreamRail } from "@/components/layout/EventStreamRail";
import { ForecastStrip } from "@/components/common/ForecastStrip";
import { pageVariants, fadeUp } from "@/lib/motion";
import { Sparkles, Activity, Layers } from "lucide-react";

export default function OverviewPage() {
  const {
    data,
    selectedLocation,
    setSelectedLocation,
    variable,
    leadTimeHours,
    setLeadTimeHours,
    activeLayer,
    setActiveLayer,
    openTraceDrawer,
  } = useAetherData();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4"
    >
      {/* Overview Situation Room Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border min-w-0">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="badge-scientific text-[10px] tracking-wider uppercase font-semibold text-text-muted bg-surface-secondary/70 border border-border">
              <Sparkles className="h-3 w-3 text-sky-500 shrink-0" />
              <span>Operational Situation Room</span>
            </div>
            <div className="badge-scientific text-[10px] tracking-wider uppercase font-semibold text-text-muted bg-surface-secondary/70 border border-border">
              <span className="radar-telemetry-dot shrink-0" />
              <span className="font-mono">
                {selectedLocation.latitude.toFixed(2)}°N, {selectedLocation.longitude.toFixed(2)}°E • {selectedLocation.region.toUpperCase()}
              </span>
            </div>
            {data?.weather_regime?.detected && (
              <div className={`badge-scientific text-[10px] tracking-wider uppercase font-semibold border ${
                data.weather_regime.detected.toUpperCase().includes("HEAVY") || data.weather_regime.detected.toUpperCase().includes("SEVERE")
                  ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                  data.weather_regime.detected.toUpperCase().includes("HEAVY") || data.weather_regime.detected.toUpperCase().includes("SEVERE")
                    ? "bg-rose-500"
                    : "bg-amber-500"
                }`} />
                <span className="font-mono">REGIME: {data.weather_regime.detected}</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary">
            AETHER Meteorological Intelligence
          </h1>
          <p className="text-xs text-text-muted font-medium">
            Adaptive multi-model NWP & AI blending engine for the Indian subcontinent (MoES / NCMRWF PS 26081).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openTraceDrawer}
            className="card-interactive flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border/90 text-text-primary text-xs font-semibold hover:bg-surface-secondary shadow-sm hover:shadow-md transition"
          >
            <Activity className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span className="font-mono">Trace Execution DAG</span>
          </button>
        </div>
      </div>

      {/* Main Workstation Layout: Map & Forecast Strip (68%) + Event Stream Rail (32%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left ~68%: Commanding Weather Map & Forecast Strip */}
        <motion.div variants={fadeUp} className="lg:col-span-8 min-w-0 flex flex-col space-y-3">
          <WeatherMap
            selectedStation={selectedLocation}
            onSelectStation={setSelectedLocation}
            variable={variable}
            currentValue={data?.aether_forecast?.calibrated_value}
            confidence={data?.confidence?.pct}
            dominantModel={data?.explanations?.model}
            regime={data?.weather_regime?.detected}
            leadTimeHours={leadTimeHours}
            onLeadTimeChange={setLeadTimeHours}
            activeLayer={activeLayer}
            onLayerChange={setActiveLayer}
          />

          {/* Multi-Horizon Synthesis Strip below map */}
          <ForecastStrip />
        </motion.div>

        {/* Right ~32%: Chronological Event Stream & Situation Panel */}
        <motion.div variants={fadeUp} className="lg:col-span-4 min-w-0">
          <EventStreamRail />
        </motion.div>
      </div>
    </motion.div>
  );
}
