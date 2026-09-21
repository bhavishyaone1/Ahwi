"use client";

import React, { useEffect, useState } from "react";
import { INDIAN_STATIONS, StationLocation } from "../../components/WeatherMap";
import { BlendedForecast } from "../../lib/types";
import { fetchForecast } from "../../lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Activity, CloudRain, Thermometer, Wind } from "lucide-react";

export default function ForecastPage() {
  const [station, setStation] = useState<StationLocation>(INDIAN_STATIONS[0]);
  const [variable, setVariable] = useState<string>("rainfall_mm");
  const [chartData, setChartData] = useState<any[]>([]);
  const [currentForecast, setCurrentForecast] = useState<BlendedForecast | null>(null);

  useEffect(() => {
    const horizons = [6, 12, 24, 48, 72];
    Promise.all(
      horizons.map((h) => fetchForecast(station.lat, station.lon, variable, h, station.name))
    )
      .then((results) => {
        setCurrentForecast(results[2]); // 24h default
        const points = results.map((r) => ({
          horizon: `${r.lead_time_hours}h`,
          AETHER: r.calibrated_forecast,
          ECMWF: r.raw_model_forecasts?.["ECMWF_IFS"],
          AIFS: r.raw_model_forecasts?.["ECMWF_AIFS"],
          GFS: r.raw_model_forecasts?.["GFS"],
          spread: r.spread,
        }));
        setChartData(points);
      })
      .catch((err) => console.error(err));
  }, [station, variable]);

  const getUnit = () =>
    variable === "rainfall_mm" ? "mm" : variable === "temperature_c" ? "°C" : "m/s";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Activity className="w-6 h-6 text-sky-600" />
            <span>Multi-Model Forecast Synthesis</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Compare individual NWP/AI forecasts with AETHER's dynamically blended prediction
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

      {/* Controls */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start w-fit text-xs font-semibold">
        <button
          onClick={() => setVariable("rainfall_mm")}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
            variable === "rainfall_mm" ? "bg-white text-sky-700 shadow-xs" : "text-slate-600"
          }`}
        >
          <CloudRain className="w-3.5 h-3.5" />
          <span>Precipitation (mm)</span>
        </button>
        <button
          onClick={() => setVariable("temperature_c")}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
            variable === "temperature_c" ? "bg-white text-amber-700 shadow-xs" : "text-slate-600"
          }`}
        >
          <Thermometer className="w-3.5 h-3.5" />
          <span>Temperature (°C)</span>
        </button>
        <button
          onClick={() => setVariable("wind_speed_ms")}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
            variable === "wind_speed_ms" ? "bg-white text-teal-700 shadow-xs" : "text-slate-600"
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>Wind Speed (m/s)</span>
        </button>
      </div>

      {/* Primary Forecast Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Forecast Trajectory across Horizons (6h – 72h)
            </h3>
            <p className="text-xs text-slate-500">
              {station.name} &bull; Blended AETHER vs ECMWF vs AIFS vs GFS
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-lg">
            24h Calibrated: {currentForecast?.calibrated_forecast} {getUnit()}
          </span>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="horizon" tick={{ fill: "#64748B", fontSize: 12 }} />
              <YAxis tick={{ fill: "#64748B", fontSize: 12 }} unit={` ${getUnit()}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#E2E8F0",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              {/* Individual NWP & AI models */}
              <Line type="monotone" dataKey="ECMWF" stroke="#0284C7" strokeWidth={1.5} strokeDasharray="4 4" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="AIFS" stroke="#6366F1" strokeWidth={1.5} strokeDasharray="4 4" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="GFS" stroke="#14B8A6" strokeWidth={1.5} strokeDasharray="4 4" dot={{ r: 3 }} />
              {/* Bold AETHER Blended Forecast */}
              <Line type="monotone" dataKey="AETHER" stroke="#0F172A" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">AETHER Dynamic Blend</span>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
            {currentForecast?.calibrated_forecast ?? "--"} {getUnit()}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            Confidence: {currentForecast?.confidence_pct}%
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">ECMWF / IFS (Physics)</span>
          <span className="text-2xl font-bold font-mono text-sky-700 mt-1 block">
            {currentForecast?.raw_model_forecasts?.["ECMWF_IFS"] ?? "--"} {getUnit()}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Weight: {Math.round((currentForecast?.model_weights?.["ECMWF_IFS"] || 0.33) * 100)}%
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">ECMWF / AIFS (AI Model)</span>
          <span className="text-2xl font-bold font-mono text-indigo-700 mt-1 block">
            {currentForecast?.raw_model_forecasts?.["ECMWF_AIFS"] ?? "--"} {getUnit()}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Weight: {Math.round((currentForecast?.model_weights?.["ECMWF_AIFS"] || 0.33) * 100)}%
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">NOAA GFS (NWP)</span>
          <span className="text-2xl font-bold font-mono text-teal-700 mt-1 block">
            {currentForecast?.raw_model_forecasts?.["GFS"] ?? "--"} {getUnit()}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Weight: {Math.round((currentForecast?.model_weights?.["GFS"] || 0.33) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
