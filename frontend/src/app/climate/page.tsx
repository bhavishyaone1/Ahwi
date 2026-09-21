"use client";

import React, { useEffect, useState } from "react";
import { INDIAN_STATIONS, StationLocation } from "../../components/WeatherMap";
import { ClimateContext } from "../../lib/types";
import { fetchClimateContext } from "../../lib/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Compass, TrendingUp, AlertCircle } from "lucide-react";

export default function ClimatePage() {
  const [station, setStation] = useState<StationLocation>(INDIAN_STATIONS[0]);
  const [variable, setVariable] = useState<string>("rainfall_mm");
  const [climate, setClimate] = useState<ClimateContext | null>(null);

  useEffect(() => {
    fetchClimateContext(station.lat, station.lon, variable, station.name)
      .then(setClimate)
      .catch((err) => console.error(err));
  }, [station, variable]);

  const getUnit = () =>
    variable === "rainfall_mm" ? "mm" : variable === "temperature_c" ? "°C" : "m/s";

  const chartData = (climate?.envelope || []).map((pt) => ({
    doy: `Day ${pt.day_of_year}`,
    Mean: pt.mean_value,
    Range: [pt.p10, pt.p90],
    p10: pt.p10,
    p90: pt.p90,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Compass className="w-6 h-6 text-sky-600" />
            <span>Climate Context & Anomaly Intelligence</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Comparing active blended forecast against 30-year climatological normal baselines
          </p>
        </div>

        {/* Station Select */}
        <select
          value={station.name}
          onChange={(e) => {
            const st = INDIAN_STATIONS.find((s) => s.name === e.target.value);
            if (st) setStation(st);
          }}
          className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
        >
          {INDIAN_STATIONS.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name} ({s.region})
            </option>
          ))}
        </select>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Forecast vs Climatological Mean */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">
            Current Blended Forecast
          </span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {climate?.current_forecast_value ?? "--"}
            </span>
            <span className="text-sm font-semibold text-slate-500">{getUnit()}</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            30-Year Normal Mean: {climate?.climatological_baseline_mean ?? "--"} {getUnit()}
          </span>
        </div>

        {/* Dynamic Anomaly */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">
            Climatological Anomaly
          </span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span
              className={`text-3xl font-extrabold font-mono ${
                (climate?.anomaly_percentage || 0) >= 0 ? "text-amber-600" : "text-sky-600"
              }`}
            >
              {(climate?.anomaly_percentage || 0) >= 0 ? "+" : ""}
              {climate?.anomaly_percentage ?? "--"}%
            </span>
            <span className="text-xs text-slate-500">({climate?.anomaly_absolute} {getUnit()})</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {(climate?.anomaly_percentage || 0) >= 0 ? "Above" : "Below"} normal seasonal baseline
          </span>
        </div>

        {/* Percentile Rank */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">
            Historical Percentile Rank
          </span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-extrabold text-indigo-700 font-mono">
              {climate?.percentile ?? "--"}th
            </span>
            <span className="text-xs text-slate-500">percentile</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Ranks in top {Math.max(1, Math.round(100 - (climate?.percentile || 50)))}% of historical records
          </span>
        </div>
      </div>

      {/* Climatological Envelope Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              30-Year Climatological Envelope (Annual Profile)
            </h3>
            <p className="text-xs text-slate-500">
              Shaded band: 10th – 90th percentile envelope &bull; Center line: Climatological Normal
            </p>
          </div>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="doy" tick={{ fill: "#64748B", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} unit={` ${getUnit()}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#E2E8F0",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="p90" stroke="#93C5FD" fill="#E0F2FE" fillOpacity={0.6} />
              <Area type="monotone" dataKey="p10" stroke="#93C5FD" fill="#FFFFFF" fillOpacity={1.0} />
              <Area type="monotone" dataKey="Mean" stroke="#0284C7" strokeWidth={2.5} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scientifically Defensible Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start space-x-2.5">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-800">Scientific Context:</strong> {climate?.historical_trend_summary ||
            "Current forecast is evaluated in context with the 30-year climatological baseline. AETHER identifies anomalous atmospheric signals without claiming single-event causal attribution."}
        </p>
      </div>
    </div>
  );
}
