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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-border min-w-0">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-[11px] font-semibold">
            <Sparkles className="h-3 w-3 text-sky-600 dark:text-sky-400" />
            <span>Operational Situation Room</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary mt-1">
            AETHER Weather Intelligence
          </h1>
          <p className="text-xs text-text-muted font-medium">
            Adaptive multi-model forecasting for a changing atmosphere.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={openTraceDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-text-primary text-xs font-semibold hover:bg-surface-secondary shadow-xs transition"
          >
            <Activity className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span>Trace Execution DAG</span>
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
