"use client";

import React from "react";
import { useAetherData } from "../context/AetherDataContext";
import { WeatherMap } from "../components/WeatherMap";
import {
  Sparkles,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  HelpCircle,
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Activity
} from "lucide-react";

export default function OverviewPage() {
  const {
    data,
    loading,
    selectedLocation,
    setSelectedLocation,
    variable,
    leadTimeHours,
    setLeadTimeHours,
    activeLayer,
    setActiveLayer,
    openTraceDrawer,
    refresh
  } = useAetherData();

  const getUnit = () => (variable === "rainfall_mm" ? "mm" : variable === "temperature_c" ? "°C" : "m/s");

  return (
    <div className="space-y-4">
      {/* Overview Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-bold">
            <Sparkles className="w-3 h-3 text-sky-600" />
            <span>Operational Situation Room</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            AETHER Weather Intelligence
          </h1>
          <p className="text-xs text-slate-500">
            Real-time synoptic analysis · Dynamic multi-model confidence and risk fusion
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={openTraceDrawer}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 text-xs font-bold transition shadow-xs"
          >
            <Activity className="w-3.5 h-3.5 text-sky-600" />
            <span>Forecast Trace</span>
          </button>

          <button
            onClick={refresh}
            title="Refresh pipeline computation"
            className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-sky-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: ~60% Map + ~40% Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left ~60%: Interactive Map */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
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

        {/* Right ~40%: Meteorological Intelligence Panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* Station Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  <h2 className="text-base font-extrabold text-slate-900">
                    {data?.location.name || selectedLocation.name}
                  </h2>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {selectedLocation.latitude.toFixed(1)}°N, {selectedLocation.longitude.toFixed(1)}°E
                </span>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                +{leadTimeHours}h Horizon
              </span>
            </div>

            {/* AETHER Forecast Value */}
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  AETHER FORECAST
                </span>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">
                    {data?.aether_forecast.calibrated_value ?? "--"}
                  </span>
                  <span className="text-lg font-bold text-slate-500 font-mono">
                    {data?.aether_forecast.unit || getUnit()}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Weather Regime
                </span>
                <span className="inline-block mt-1 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                  {data?.weather_regime.detected || "NORMAL"}
                </span>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Confidence:</span>
                <span className="font-extrabold text-emerald-600 font-mono">
                  {data?.confidence.pct ?? 78}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${data?.confidence.pct ?? 78}%` }}
                />
              </div>
            </div>

            {/* Top Model Trust Breakdown */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Top Model Trust
              </span>
              <div className="space-y-2 text-xs font-semibold">
                {Object.entries(data?.weights || { ECMWF_AIFS: 0.46, ECMWF_IFS: 0.32, GFS: 0.22 })
                  .sort((a, b) => b[1] - a[1])
                  .map(([mName, w]) => {
                    const pct = Math.round(w * 100);
                    const cleanName = mName.replace("ECMWF_", "");
                    return (
                      <div key={mName} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-700">{cleanName}</span>
                          <span className="font-mono text-slate-900 font-bold">{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              cleanName === "AIFS"
                                ? "bg-sky-600"
                                : cleanName === "IFS"
                                ? "bg-indigo-600"
                                : "bg-teal-600"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Extreme Risk Summary */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Extreme Risk (AETHER Model Risk)
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="text-[10px] text-rose-600 font-medium block">Heavy Rain</span>
                  <span className="font-extrabold text-rose-700 text-xs">
                    {data?.risk.heavy_rain.level || "HIGH"}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-600 font-medium block">Heat</span>
                  <span className="font-extrabold text-emerald-700 text-xs">
                    {data?.risk.heat.level || "LOW"}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-600 font-medium block">High Wind</span>
                  <span className="font-extrabold text-slate-700 text-xs">
                    {data?.risk.high_wind.level || "LOW"}
                  </span>
                </div>
              </div>
            </div>

            {/* Open Trace Link */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[10px]">
                {data?.data_freshness.AIFS || "Updated 18 min ago"}
              </span>
              <button
                onClick={openTraceDrawer}
                className="inline-flex items-center space-x-1 text-sky-700 font-bold hover:text-sky-900 transition"
              >
                <span>Inspect Trace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
