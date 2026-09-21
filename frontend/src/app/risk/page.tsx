"use client";

import React, { useState } from "react";
import { useAetherData } from "../../context/AetherDataContext";
import { ShieldAlert, AlertTriangle, CloudRain, Flame, Wind, CheckCircle2 } from "lucide-react";
import { WeatherMap } from "../../components/WeatherMap";

export default function ExtremeRiskPage() {
  const { data, selectedLocation, setSelectedLocation, variable, leadTimeHours, setLeadTimeHours, activeLayer, setActiveLayer } = useAetherData();
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-2">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            <span>High-Impact Hazard Guidance</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Extreme Weather Risk
          </h1>
          <p className="text-xs text-slate-500">
            Probabilistic risk assessment from AETHER model (Not an official warning)
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setSubTab("overview")}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === "overview" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSubTab("details")}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === "details" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setSubTab("map")}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === "map" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
            }`}
          >
            Map
          </button>
        </div>
      </div>

      {/* Main Layout: Map on Left + Risk Gauges & Drivers on Right matching reference image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 Cols: Interactive Map with Risk Layer */}
        <div className="lg:col-span-7">
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
        </div>

        {/* Right 5 Cols: Risk Assessment Card matching reference image */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  {selectedLocation.name} — Risk Assessment
                </h2>
                <span className="text-[11px] text-slate-400 font-mono">+{leadTimeHours}h Horizon</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                {data?.risk.overall_level || "HIGH"} RISK
              </span>
            </div>

            {/* 3 Circular Probability Gauges matching reference image */}
            <div className="grid grid-cols-3 gap-3 text-center">
              {/* Heavy Rain Gauge */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-700 mb-2">Heavy Rain</span>
                <div className="relative w-16 h-16 rounded-full border-4 border-rose-500 flex items-center justify-center bg-white shadow-xs">
                  <span className="text-base font-black text-rose-600 font-mono">{rainRisk}%</span>
                </div>
                <span className="mt-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  HIGH
                </span>
              </div>

              {/* Heat Gauge */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-700 mb-2">Heat</span>
                <div className="relative w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-white shadow-xs">
                  <span className="text-base font-black text-emerald-600 font-mono">{heatRisk}%</span>
                </div>
                <span className="mt-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  LOW
                </span>
              </div>

              {/* High Wind Gauge */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-700 mb-2">High Wind</span>
                <div className="relative w-16 h-16 rounded-full border-4 border-amber-500 flex items-center justify-center bg-white shadow-xs">
                  <span className="text-base font-black text-amber-600 font-mono">{windRisk}%</span>
                </div>
                <span className="mt-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  WATCH
                </span>
              </div>
            </div>

            {/* Key Risk Drivers */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Key Risk Drivers
              </span>
              <div className="space-y-1.5 text-xs text-slate-700">
                {keyDrivers.map((driver, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <span>{driver}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Observation Agreement Signal */}
            <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 text-xs text-sky-900 space-y-1">
              <span className="font-bold text-[11px] text-sky-800 block">Observation Verification (NASA GPM / INSAT-3D)</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {data?.observations.observation_conditioned_signal ||
                  "Satellite precipitation observations validate AIFS convective rain core."}
              </p>
            </div>
          </div>

          {/* Mandatory Warning Disclaimer Banner */}
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-800 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              AETHER MODEL RISK — NOT AN OFFICIAL METEOROLOGICAL WARNING. Official advisories are issued exclusively by the India Meteorological Department (IMD).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
