"use client";

import React from "react";
import { useAetherData } from "../../context/AetherDataContext";
import { Compass, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function ClimatePage() {
  const { data, selectedLocation, variable } = useAetherData();
  const climate = data?.climate_context;
  const currentVal = data?.aether_forecast.calibrated_value ?? 42.3;
  const getUnit = () => (variable === "rainfall_mm" ? "mm" : variable === "temperature_c" ? "°C" : "m/s");

  const monthlyRange = climate?.historical_range || [
    { month: "Jan", normal: 14.2, min_range: 2.0, max_range: 35.0 },
    { month: "Feb", normal: 18.0, min_range: 4.0, max_range: 42.0 },
    { month: "Mar", normal: 15.9, min_range: 1.0, max_range: 38.0 },
    { month: "Apr", normal: 12.1, min_range: 0.5, max_range: 28.0 },
    { month: "May", normal: 22.5, min_range: 5.0, max_range: 65.0 },
    { month: "Jun", normal: 74.3, min_range: 25.0, max_range: 160.0 },
    { month: "Jul", normal: 210.6, min_range: 95.0, max_range: 380.0 },
    { month: "Aug", normal: 233.1, min_range: 110.0, max_range: 420.0 },
    { month: "Sep", normal: 120.4, min_range: 40.0, max_range: 260.0 },
    { month: "Oct", normal: 21.4, min_range: 0.0, max_range: 60.0 },
    { month: "Nov", normal: 5.2, min_range: 0.0, max_range: 20.0 },
    { month: "Dec", normal: 8.6, min_range: 0.0, max_range: 25.0 },
  ];

  // Overlay current forecast onto October/current month
  const chartData = monthlyRange.map((m) => ({
    month: m.month,
    normal: m.normal,
    min: m.min_range,
    max: m.max_range,
    current: m.month === "Oct" ? currentVal : null,
  }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="border-b border-slate-100 pb-3">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-bold">
          <Compass className="w-3 h-3 text-sky-600" />
          <span>Long-Term Climatological Benchmarking</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Climate Context
        </h1>
        <p className="text-xs text-slate-500">
          How unusual is the current forecast compared to historical climate?
        </p>
      </div>

      {/* Top 4 Metric Cards matching reference image */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Forecast */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Current Rainfall (24h)
          </span>
          <div className="flex items-baseline space-x-1 mt-1 font-mono">
            <span className="text-3xl font-black text-slate-900">{currentVal}</span>
            <span className="text-sm font-bold text-slate-500">{getUnit()}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">{selectedLocation.name}</span>
        </div>

        {/* Climate Normal */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Climate Normal
          </span>
          <div className="flex items-baseline space-x-1 mt-1 font-mono">
            <span className="text-3xl font-black text-slate-800">
              {climate?.climate_normal ?? 21.4}
            </span>
            <span className="text-sm font-bold text-slate-500">{getUnit()}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">30-Year Seasonal Baseline</span>
        </div>

        {/* Anomaly */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Anomaly
          </span>
          <div className="flex items-baseline space-x-1 mt-1 font-mono">
            <span className="text-3xl font-black text-emerald-600">
              +{(climate?.anomaly ?? 20.9).toFixed(1)} {getUnit()}
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 mt-1 block">
            +{climate?.anomaly_pct ?? 96}% Above Normal
          </span>
        </div>

        {/* Historical Percentile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Historical Percentile
          </span>
          <div className="flex items-baseline space-x-1 mt-1 font-mono">
            <span className="text-3xl font-black text-indigo-700">
              {climate?.percentile ?? 92}nd
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Ranks in top 8% of history</span>
        </div>
      </div>

      {/* Main Section: 30-Year Climatology Chart + Additional Climate Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 Cols: Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                30-Year Climatology (Rainfall Profile)
              </h2>
              <p className="text-[11px] text-slate-400">
                Monthly normal envelope with current forecast marker
              </p>
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="flex items-center space-x-1 text-slate-500">
                <span className="w-3 h-2 bg-slate-200 rounded-xs" />
                <span>Historical Range</span>
              </span>
              <span className="flex items-center space-x-1 text-sky-700 font-semibold">
                <span className="w-3 h-0.5 bg-sky-600" />
                <span>Normal</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-900 font-bold">
                <span className="w-2 h-2 bg-slate-900 rounded-full" />
                <span>Current Forecast</span>
              </span>
            </div>
          </div>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11, fontWeight: 600 }} />
                <YAxis tick={{ fill: "#64748B", fontSize: 11 }} unit={` ${getUnit()}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#CBD5E1",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="max" stroke="none" fill="#E2E8F0" fillOpacity={0.6} name="Max Range" />
                <Line type="monotone" dataKey="normal" stroke="#0284C7" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} name="Normal" />
                <Line type="monotone" dataKey="current" stroke="#0F172A" strokeWidth={0} dot={{ r: 7, fill: "#0F172A" }} name="Current Forecast" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Based on ERA5 reanalysis and 30-year climatology (1995–2024).
          </div>
        </div>

        {/* Right 4 Cols: Additional Climate Indicators matching reference image */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Additional Climate Indicators
            </span>

            <div className="space-y-3 text-xs">
              {/* Temp Anomaly */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px]">Temperature Anomaly</span>
                  <span className="text-base font-bold text-amber-600 font-mono">
                    +{(climate?.temp_anomaly_c ?? 1.6).toFixed(1)}°C
                  </span>
                </div>
                <span className="text-lg font-bold text-amber-500">🌡️</span>
              </div>

              {/* Seasonal Anomaly */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px]">Seasonal Anomaly</span>
                  <span className="text-base font-bold text-emerald-600 font-mono">
                    +{(climate?.seasonal_anomaly_pct ?? 38).toFixed(0)}%
                  </span>
                </div>
                <span className="text-lg font-bold text-emerald-500">🌧️</span>
              </div>

              {/* Extreme Rainfall */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px]">Extreme Rainfall (Historical)</span>
                  <span className="text-base font-bold text-indigo-700 font-mono">
                    {(climate?.extreme_multiplier ?? 2.3).toFixed(1)}x
                  </span>
                </div>
                <span className="text-lg font-bold text-indigo-500">⚡</span>
              </div>

              {/* Trend */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px]">Trend (Last 30 Years)</span>
                  <span className="text-base font-bold text-slate-800 font-mono">
                    +{(climate?.trend_c_per_decade ?? 0.4).toFixed(1)}°C / decade
                  </span>
                </div>
                <TrendingUp className="w-5 h-5 text-slate-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
