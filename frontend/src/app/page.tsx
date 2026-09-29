"use client";

import React from "react";
import { motion } from "motion/react";
import { useAetherData } from "@/context/AetherDataContext";
import { WeatherMap, INDIAN_STATIONS } from "@/components/map/WeatherMap";
import { EventStreamRail } from "@/components/layout/EventStreamRail";
import { ForecastStrip } from "@/components/common/ForecastStrip";
import { WeatherContourHeader } from "@/components/common/Backgrounds";
import { pageVariants, fadeUp } from "@/lib/motion";
import {
  Sparkles,
  Activity,
  Layers,
  CloudRain,
  Thermometer,
  Wind,
  Clock,
  MapPin,
  ChevronDown,
} from "lucide-react";

const HORIZONS = [6, 12, 24, 48, 72];

export default function OverviewPage() {
  const {
    data,
    selectedLocation,
    setSelectedLocation,
    variable,
    setVariable,
    leadTimeHours,
    setLeadTimeHours,
    activeLayer,
    setActiveLayer,
    openTraceDrawer,
  } = useAetherData();

  const handleVariableChange = (newVar: string) => {
    setVariable(newVar);
    if (newVar === "rainfall_mm") setActiveLayer("rainfall");
    else if (newVar === "temperature_c") setActiveLayer("temperature");
    else if (newVar === "wind_speed_ms") setActiveLayer("wind");
  };

  const handleLayerChange = (layer: string) => {
    setActiveLayer(layer);
    if (layer === "rainfall") setVariable("rainfall_mm");
    else if (layer === "temperature") setVariable("temperature_c");
    else if (layer === "wind") setVariable("wind_speed_ms");
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4"
    >
      {/* Overview Situation Room Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border min-w-0">
        <WeatherContourHeader />
        <div className="min-w-0 space-y-1.5 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <div className="badge-scientific text-overline text-text-muted bg-surface-2 border border-border">
              <Sparkles className="h-3 w-3 text-accent shrink-0" />
              <span>Operational Situation Room</span>
            </div>
            <div className="badge-scientific text-overline text-text-muted bg-surface-2 border border-border">
              <span className="radar-telemetry-dot shrink-0" />
              <span className="font-mono tabular-nums">
                {selectedLocation.latitude.toFixed(2)}°N, {selectedLocation.longitude.toFixed(2)}°E • {selectedLocation.region?.toUpperCase() || "INDIA"}
              </span>
            </div>
            {data?.weather_regime?.detected && (
              <div
                className={`badge-scientific text-overline border ${
                  data.weather_regime.detected.toUpperCase().includes("HEAVY") ||
                  data.weather_regime.detected.toUpperCase().includes("SEVERE")
                    ? "bg-danger/10 text-danger border-danger/30"
                    : "bg-warning/10 text-warning border-warning/30"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                    data.weather_regime.detected.toUpperCase().includes("HEAVY") ||
                    data.weather_regime.detected.toUpperCase().includes("SEVERE")
                      ? "bg-danger animate-pulse"
                      : "bg-warning"
                  }`}
                />
                <span className="font-mono">REGIME: {data.weather_regime.detected}</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary font-display">
            AETHER Meteorological Intelligence
          </h1>
          <p className="text-xs text-text-muted font-medium">
            Adaptive multi-model NWP &amp; AI blending engine for the Indian subcontinent — real-time continuous calibration.
          </p>
        </div>

        {/* Global Action & Trace Trigger */}
        <div className="flex items-center gap-2 shrink-0 relative z-10">
          <button
            onClick={openTraceDrawer}
            className="card-interactive flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border/90 text-text-primary text-xs font-semibold hover:bg-surface-2 shadow-sm hover:shadow-md transition"
          >
            <Activity className="h-3.5 w-3.5 text-accent" />
            <span className="font-mono text-overline text-text-primary">Trace Execution DAG</span>
          </button>
        </div>
      </div>

      {/* Quick Interactive Operational Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-2 px-3 rounded-2xl bg-surface/90 dark:bg-[#0e1118]/90 border border-border shadow-xs backdrop-blur-md">
        {/* Variable Switcher Pills */}
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-border/70 text-xs font-semibold">
          {[
            { id: "rainfall_mm", label: "Precipitation", icon: CloudRain },
            { id: "temperature_c", label: "Temperature", icon: Thermometer },
            { id: "wind_speed_ms", label: "Wind Speed", icon: Wind },
          ].map((v) => {
            const Icon = v.icon;
            const isActive = variable === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => handleVariableChange(v.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                  isActive
                    ? "bg-surface text-accent font-bold shadow-xs border border-accent/30"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-accent" : "text-text-muted"}`} />
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>

        {/* Horizon Quick Pills */}
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-border/70 text-xs font-mono">
          <Clock className="h-3 w-3 text-text-muted ml-1.5 mr-0.5 shrink-0 hidden sm:inline" />
          {HORIZONS.map((h) => {
            const isActive = leadTimeHours === h;
            return (
              <button
                key={h}
                type="button"
                onClick={() => setLeadTimeHours(h)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  isActive
                    ? "bg-accent text-slate-950 shadow-xs"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface/50"
                }`}
              >
                +{h}h
              </button>
            );
          })}
        </div>

        {/* Station Jump Selector */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-2 border border-border text-xs">
            <MapPin className="h-3 w-3 text-accent shrink-0" />
            <select
              value={selectedLocation.name}
              onChange={(e) => {
                const found = INDIAN_STATIONS.find((s) => s.name === e.target.value);
                if (found) {
                  setSelectedLocation({
                    name: found.name,
                    latitude: found.lat,
                    longitude: found.lon,
                    region: found.region,
                  });
                }
              }}
              className="bg-transparent border-none text-xs font-bold text-text-primary focus:outline-none cursor-pointer"
            >
              {INDIAN_STATIONS.map((st) => (
                <option key={st.name} value={st.name} className="bg-surface text-text-primary">
                  {st.name} ({st.region})
                </option>
              ))}
            </select>
          </div>
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
            weights={data?.weights}
            forecasts={data?.forecasts}
            regime={data?.weather_regime?.detected}
            leadTimeHours={leadTimeHours}
            onLeadTimeChange={setLeadTimeHours}
            activeLayer={activeLayer}
            onLayerChange={handleLayerChange}
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
