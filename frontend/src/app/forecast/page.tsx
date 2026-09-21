"use client";

import React, { useState } from "react";
import { useAetherData } from "../../context/AetherDataContext";
import { INDIAN_STATIONS } from "../../components/WeatherMap";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from "recharts";
import { Activity, ChevronRight } from "lucide-react";

export default function ForecastPage() {
  const {
    data,
    selectedLocation,
    setSelectedLocation,
    variable,
    setVariable,
    leadTimeHours,
    setLeadTimeHours,
    openTraceDrawer
  } = useAetherData();

  const [activeTab, setActiveTab] = useState<"forecast" | "table" | "uncertainty">("forecast");

  const getUnit = () =>
    variable === "rainfall_mm" ? "mm" : variable === "temperature_c" ? "°C" : "m/s";

  const chartData = data?.multi_horizon || [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-bold">
            <Activity className="w-3 h-3 text-sky-600" />
            <span>Multi-Model Synthesis</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Forecast Exploration
          </h1>
          <p className="text-xs text-slate-500">
            Compare model forecasts and AETHER blended prediction
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Variable */}
          <select
            value={variable}
            onChange={(e) => setVariable(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 shadow-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
          >
            <option value="rainfall_mm">Rainfall (mm)</option>
            <option value="temperature_c">Temperature (°C)</option>
            <option value="wind_speed_ms">Wind Speed (m/s)</option>
          </select>

          {/* Location */}
          <select
            value={selectedLocation.name}
            onChange={(e) => {
              const st = INDIAN_STATIONS.find((s) => s.name === e.target.value);
              if (st) {
                setSelectedLocation({
                  name: st.name,
                  latitude: st.lat,
                  longitude: st.lon,
                  region: st.region,
                });
              }
            }}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 shadow-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
          >
            {INDIAN_STATIONS.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name} ({s.region})
              </option>
            ))}
          </select>

          {/* Lead Time */}
          <select
            value={leadTimeHours}
            onChange={(e) => setLeadTimeHours(Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 shadow-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
          >
            <option value={6}>6 hours</option>
            <option value={12}>12 hours</option>
            <option value={24}>24 hours</option>
            <option value={48}>48 hours</option>
            <option value={72}>72 hours</option>
          </select>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("forecast")}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === "forecast"
              ? "border-sky-600 text-sky-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Forecast
        </button>
        <button
          onClick={() => setActiveTab("table")}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === "table"
              ? "border-sky-600 text-sky-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Table
        </button>
        <button
          onClick={() => setActiveTab("uncertainty")}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === "uncertainty"
              ? "border-sky-600 text-sky-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Uncertainty
        </button>
      </div>

      {/* Main Content Layout: Chart + Right Summary Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 Cols: Chart / Table View */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                {variable === "rainfall_mm" ? "Rainfall" : variable === "temperature_c" ? "Temperature" : "Wind"}{" "}
                Forecast ({selectedLocation.name})
              </h2>
              <p className="text-[11px] text-slate-400">
                Comparison of NWP & AI models with AETHER dynamic softmax blend
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
              +{leadTimeHours}h Horizon
            </span>
          </div>

          {activeTab === "forecast" && (
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="lead_time" tick={{ fill: "#64748B", fontSize: 11, fontWeight: 600 }} />
                  <YAxis tick={{ fill: "#64748B", fontSize: 11 }} unit={` ${getUnit()}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#CBD5E1",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", fontWeight: 600 }} />
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="none"
                    fill="#38BDF8"
                    fillOpacity={0.15}
                    name="Uncertainty Range"
                  />
                  <Line type="monotone" dataKey="ECMWF" stroke="#0284C7" strokeWidth={1.8} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="AIFS" stroke="#6366F1" strokeWidth={1.8} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="GFS" stroke="#14B8A6" strokeWidth={1.8} dot={{ r: 3 }} />
                  <Line
                    type="monotone"
                    dataKey="AETHER"
                    stroke="#0F172A"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#0F172A" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === "table" && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Horizon</th>
                    <th className="p-2.5">ECMWF IFS</th>
                    <th className="p-2.5">ECMWF AIFS</th>
                    <th className="p-2.5">NOAA GFS</th>
                    <th className="p-2.5 font-extrabold text-slate-900">AETHER Blend</th>
                    <th className="p-2.5">Range (Lower - Upper)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {chartData.map((pt, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-700">{pt.lead_time}</td>
                      <td className="p-2.5 text-sky-700">{pt.ECMWF} {getUnit()}</td>
                      <td className="p-2.5 text-indigo-700">{pt.AIFS} {getUnit()}</td>
                      <td className="p-2.5 text-teal-700">{pt.GFS} {getUnit()}</td>
                      <td className="p-2.5 font-extrabold text-slate-900 bg-sky-50/50">
                        {pt.AETHER} {getUnit()}
                      </td>
                      <td className="p-2.5 text-slate-500">
                        {pt.lower} - {pt.upper} {getUnit()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "uncertainty" && (
            <div className="space-y-3 py-4 text-xs">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-1">
                  Empirical Uncertainty & Model Spread
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  AETHER quantifies uncertainty directly from physical ensemble divergence,
                  rolling multi-window error memory, and regime stability.
                </p>
                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-200 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Model Spread (sigma)</span>
                    <span className="text-base font-bold text-slate-900">{data?.uncertainty.spread} {getUnit()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Confidence Tier</span>
                    <span className="text-base font-bold text-emerald-600">{data?.confidence.tier}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Lead Time Decay</span>
                    <span className="text-base font-bold text-slate-700">+{leadTimeHours}h</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 4 Cols: Key Forecast Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Key Forecast ({leadTimeHours}h)
              </span>
              <span className="text-xs text-slate-500 font-medium">{selectedLocation.name}</span>
            </div>

            {/* AETHER Prominent Value */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                AETHER
              </span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">
                  {data?.aether_forecast.calibrated_value ?? "--"}
                </span>
                <span className="text-base font-bold text-slate-500 font-mono">
                  {data?.aether_forecast.unit || getUnit()}
                </span>
              </div>
            </div>

            {/* Individual Models exact comparison */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-600 font-semibold">ECMWF</span>
                <span className="font-mono font-bold text-slate-900">
                  {data?.forecasts["ECMWF_IFS"] ?? "--"} {getUnit()}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-600 font-semibold">AIFS</span>
                <span className="font-mono font-bold text-slate-900">
                  {data?.forecasts["ECMWF_AIFS"] ?? "--"} {getUnit()}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-600 font-semibold">GFS</span>
                <span className="font-mono font-bold text-slate-900">
                  {data?.forecasts["GFS"] ?? "--"} {getUnit()}
                </span>
              </div>
            </div>

            {/* Confidence Progress Bar */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
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

            {/* View Details / Forecast Trace Button */}
            <button
              onClick={openTraceDrawer}
              className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center space-x-1.5 shadow-xs"
            >
              <span>View Details & Trace</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
