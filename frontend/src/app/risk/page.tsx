"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { useAetherData } from "../../context/AetherDataContext";
import { ShieldAlert, AlertTriangle, CloudRain, Flame, Wind, CheckCircle2 } from "lucide-react";
import { WeatherMap } from "@/components/map/WeatherMap";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { RiskRing } from "@/components/risk/RiskRing";
import { pageVariants, fadeUp } from "@/lib/motion";

export default function ExtremeRiskPage() {
  const {
    data,
    selectedLocation,
    setSelectedLocation,
    variable,
    leadTimeHours,
    setLeadTimeHours,
    activeLayer,
    setActiveLayer,
  } = useAetherData();
  const [subTab, setSubTab] = useState<"overview" | "details" | "map">("overview");

  const rainRisk = data?.risk.heavy_rain.probability_pct ?? 78;
  const heatRisk = data?.risk.heat.probability_pct ?? 14;
  const windRisk = data?.risk.high_wind.probability_pct ?? 31;

  const keyDrivers = data?.risk.key_drivers || [
    "High moisture content (>68 mm TPW)",
    "Multi-model convergence on intense precipitation core",
    "Warm sea surface temperature anomaly in northern Bay of Bengal",
    "Historical extreme frequency elevated for synoptic regime",
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4"
    >
      {/* High-Stakes Operational Emergency Banner */}
      <div className="rounded-xl bg-danger/15 border border-danger/40 p-2.5 px-4 flex items-center justify-between text-xs font-mono text-danger">
        <div className="flex items-center gap-2 font-bold">
          <AlertTriangle className="h-4 w-4 text-danger animate-pulse shrink-0" />
          <span className="uppercase tracking-wider">
            SITUATION ROOM: HIGH-IMPACT RISK REGISTER ACTIVE &bull; THRESHOLD MONITORING
          </span>
        </div>
        <span className="text-[10px] hidden sm:inline text-text-muted">
          MoES / IMD Hazard Protocol (PS 26081)
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3 min-w-0">
        <div className="min-w-0 space-y-1">
          <div className="badge-scientific bg-danger/10 text-danger border border-danger/30">
            <ShieldAlert className="h-3 w-3 text-danger" />
            <span>High-Impact Hazard Guidance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight mt-1">
            Extreme Weather Risk Early Warning
          </h1>
          <p className="text-xs text-text-muted font-medium">
            Adaptive multi-model NWP & AI blending engine — probabilistic hazard evaluation for convective precipitation, extreme heat, and gale winds (MoES PS 26081).
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex bg-surface-secondary/70 p-0.5 rounded-lg border border-border text-xs font-semibold shrink-0">
          {(["overview", "details", "map"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSubTab(tab)}
              className={`px-3 py-1 rounded-md capitalize transition-all ${
                subTab === tab
                  ? "bg-surface text-text-primary shadow-sm font-bold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Map on Left (7 cols) + Risk Gauges on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Map */}
        <motion.div variants={fadeUp} className="lg:col-span-7 min-w-0">
          <WeatherMap
            selectedStation={selectedLocation}
            onSelectStation={setSelectedLocation}
            variable={variable}
            currentValue={data?.aether_forecast.calibrated_value}
            confidence={data?.confidence.pct}
            dominantModel={data?.explanations.model}
            regime={data?.weather_regime.detected}
            leadTimeHours={leadTimeHours}
            onLeadTimeChange={setLeadTimeHours}
            activeLayer={activeLayer}
            onLayerChange={setActiveLayer}
          />
        </motion.div>

        {/* Right: Risk Assessment Card */}
        <motion.div variants={fadeUp} className="lg:col-span-5 min-w-0 space-y-3">
          <Card className="shadow-xl border-2 border-danger/40 bg-surface dark:bg-[#12161f] rounded-2xl overflow-hidden elevated-glow">
            <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-bold text-text-primary">
                  {selectedLocation.name} — Risk Assessment
                </CardTitle>
                <span className="text-[11px] text-text-muted font-mono">
                  +{leadTimeHours}h Horizon
                </span>
              </div>
              <Badge variant="destructive" className="font-bold text-[10px] uppercase font-mono">
                {data?.risk?.overall_level || "ELEVATED"} RISK
              </Badge>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* 3 Circular Probability Rings */}
              <div className="grid grid-cols-3 gap-2">
                <RiskRing
                  type="rain"
                  label="Heavy Rain"
                  probability={data?.risk?.heavy_rain?.probability_pct ?? 0}
                  tier={data?.risk?.heavy_rain?.level || "NORMAL"}
                />
                <RiskRing
                  type="heat"
                  label="Heat"
                  probability={data?.risk?.heat?.probability_pct ?? 0}
                  tier={data?.risk?.heat?.level || "LOW"}
                />
                <RiskRing
                  type="wind"
                  label="High Wind"
                  probability={data?.risk?.high_wind?.probability_pct ?? 0}
                  tier={data?.risk?.high_wind?.level || "NORMAL"}
                />
              </div>

              {/* Key Risk Drivers */}
              <div className="space-y-2 pt-3 border-t border-border">
                <span className="font-mono text-[10px] uppercase font-semibold text-text-muted tracking-wider block">
                  Key Risk Drivers
                </span>
                <div className="space-y-1.5 text-xs text-text-secondary">
                  {keyDrivers.map((driver, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{driver}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mandatory Disclaimer */}
              <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300 space-y-1">
                <span className="font-bold block uppercase tracking-wider font-mono">
                  Operational Safety Disclaimer
                </span>
                <p>
                  {data?.risk?.disclaimer ||
                    "AETHER model risk guidance represents AI/NWP blended diagnostic output and does NOT substitute for statutory warnings issued by India Meteorological Department (IMD)."}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
