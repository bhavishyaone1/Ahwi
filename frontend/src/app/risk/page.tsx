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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-semibold">
            <ShieldAlert className="h-3 w-3 text-rose-600" />
            <span>High-Impact Hazard Guidance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight mt-1">
            Extreme Weather Risk
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Probabilistic guidance for high-impact weather conditions.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs font-semibold">
          {(["overview", "details", "map"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSubTab(tab)}
              className={`px-3 py-1 rounded-sm capitalize transition-all ${
                subTab === tab ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
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
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  {selectedLocation.name} — Risk Assessment
                </CardTitle>
                <span className="text-[11px] text-slate-400 font-mono">
                  +{leadTimeHours}h Horizon
                </span>
              </div>
              <Badge variant="destructive" className="font-bold text-[10px]">
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
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Key Risk Drivers
                </span>
                <div className="space-y-1.5 text-xs text-slate-700">
                  {keyDrivers.map((driver, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{driver}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mandatory IMD Disclaimer */}
          <Alert variant="warning" className="border-amber-200 bg-amber-50/80">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-xs font-bold text-amber-900">
              AETHER MODEL RISK — NOT AN OFFICIAL METEOROLOGICAL WARNING
            </AlertTitle>
            <AlertDescription className="text-[11px] text-amber-800">
              This probabilistic hazard assessment is synthesized algorithmically via multi-model ensemble consensus. For statutory warnings, please refer directly to the India Meteorological Department (IMD).
            </AlertDescription>
          </Alert>
        </motion.div>
      </div>
    </motion.div>
  );
}
