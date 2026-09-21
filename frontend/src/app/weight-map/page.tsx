"use client";

import React, { useState } from "react";
import { useAetherData } from "../../context/AetherDataContext";
import { Layers, MapPin, ZoomIn, ZoomOut, Info } from "lucide-react";
import { INDIAN_STATIONS } from "../../components/WeatherMap";

export default function WeightMapPage() {
  const { variable, setVariable, leadTimeHours, setLeadTimeHours, setSelectedLocation } = useAetherData();
  const [selectedModel, setSelectedModel] = useState<string>("AIFS Weight");
  const [activeSublayer, setActiveSublayer] = useState<"weights" | "agreement" | "risk">("weights");
  const [selectedRegion, setSelectedRegion] = useState<{
    name: string;
    aifs: number;
    ecmwf: number;
    gfs: number;
  }>({
    name: "North India (Delhi NCR)",
    aifs: 46,
    ecmwf: 32,
    gfs: 22,
  });

  const project = (lat: number, lon: number) => {
    const minLat = 7.0;
    const maxLat = 37.5;
    const minLon = 68.0;
    const maxLon = 97.5;
    const x = ((lon - minLon) / (maxLon - minLon)) * 520 + 40;
    const y = 620 - ((lat - minLat) / (maxLat - minLat)) * 580;
    return { x, y };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-2">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-bold">
            <Layers className="w-3 h-3 text-sky-600" />
            <span>Spatial Model Contribution</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Model Weight Map
          </h1>
          <p className="text-xs text-slate-500">
            See which model AETHER trusts across different regions and lead times
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Variable */}
          <select
            value={variable}
            onChange={(e) => setVariable(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 shadow-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
          >
            <option value="rainfall_mm">Rainfall</option>
            <option value="temperature_c">Temperature</option>
            <option value="wind_speed_ms">Wind Speed</option>
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

          {/* Model Filter */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 shadow-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
          >
            <option value="AIFS Weight">AIFS Weight</option>
            <option value="ECMWF Weight">ECMWF Weight</option>
            <option value="GFS Weight">GFS Weight</option>
          </select>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full h-[540px] bg-slate-50/70 rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
        {/* SVG Subcontinental Dominance Canvas */}
        <div className="relative flex-1 flex items-center justify-center select-none p-2">
          <svg viewBox="0 0 600 650" className="w-full h-full max-h-[500px]">
            <defs>
              <pattern id="weight-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2 2" />
              </pattern>

              {/* Spatial Weight Gradient Fields matching reference image */}
              <radialGradient id="aifsHighNorth" cx="42%" cy="28%" r="28%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
                <stop offset="35%" stopColor="#F97316" stopOpacity="0.75" />
                <stop offset="65%" stopColor="#FBBF24" stopOpacity="0.6" />
                <stop offset="90%" stopColor="#34D399" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#F8FAFC" stopOpacity="0.05" />
              </radialGradient>

              <radialGradient id="aifsCentral" cx="50%" cy="52%" r="30%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.75" />
                <stop offset="60%" stopColor="#0284C7" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#F8FAFC" stopOpacity="0.05" />
              </radialGradient>
            </defs>

            <rect width="600" height="650" fill="url(#weight-grid)" />

            {/* India Boundary Outline */}
            <path
              d="M 180 80 Q 230 40 270 90 Q 320 140 370 120 Q 420 100 470 130 Q 520 150 540 220 Q 500 280 430 290 Q 400 350 360 410 Q 320 520 280 590 Q 250 550 220 460 Q 180 410 160 340 Q 120 300 130 250 Q 110 200 150 160 Z"
              fill="#F8FAFC"
              stroke="#94A3B8"
              strokeWidth="1.5"
            />

            {/* Simulated Geographic Weight Distribution Heatmap */}
            <circle cx="230" cy="190" r="110" fill="url(#aifsHighNorth)" />
            <circle cx="280" cy="380" r="120" fill="url(#aifsCentral)" />

            {/* Water label */}
            <text x="80" y="440" fill="#94A3B8" fontSize="10" fontStyle="italic" fontWeight="600">
              Arabian Sea
            </text>
            <text x="430" y="440" fill="#94A3B8" fontSize="10" fontStyle="italic" fontWeight="600">
              Bay of Bengal
            </text>

            {/* Stations */}
            {INDIAN_STATIONS.map((st) => {
              const { x, y } = project(st.lat, st.lon);
              const isDelhi = st.name === "Delhi NCR";

              return (
                <g
                  key={st.name}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedRegion({
                      name: st.name,
                      aifs: isDelhi ? 46 : 38,
                      ecmwf: isDelhi ? 32 : 36,
                      gfs: isDelhi ? 22 : 26,
                    });
                    setSelectedLocation({
                      name: st.name,
                      latitude: st.lat,
                      longitude: st.lon,
                      region: st.region,
                    });
                  }}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill="#0F172A"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                  <text
                    x={x + 7}
                    y={y + 3}
                    fill="#1E293B"
                    fontSize="9.5"
                    fontWeight="700"
                  >
                    {st.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Left Legend: Model Contribution Brackets matching mockup */}
          <div className="absolute bottom-16 left-4 z-10 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-200 shadow-sm text-[10px]">
            <span className="font-bold text-slate-800 block mb-1.5">
              {selectedModel} Contribution
            </span>
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-2.5 rounded-xs bg-[#EF4444]" />
                <span className="text-slate-600 font-mono">&gt; 80%</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-2.5 rounded-xs bg-[#F97316]" />
                <span className="text-slate-600 font-mono">60 - 80%</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-2.5 rounded-xs bg-[#FBBF24]" />
                <span className="text-slate-600 font-mono">40 - 60%</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-2.5 rounded-xs bg-[#34D399]" />
                <span className="text-slate-600 font-mono">20 - 40%</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-2.5 rounded-xs bg-[#38BDF8]" />
                <span className="text-slate-600 font-mono">5 - 20%</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-2.5 rounded-xs bg-[#0284C7]" />
                <span className="text-slate-600 font-mono">&lt; 5%</span>
              </div>
            </div>
          </div>

          {/* Inspection Tooltip matching reference mockup */}
          <div className="absolute top-6 right-6 z-10 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-lg w-56">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <span className="font-bold text-xs text-slate-900">{selectedRegion.name}</span>
              <span className="text-[10px] font-mono text-slate-400">+{leadTimeHours}h</span>
            </div>
            <div className="space-y-1.5 text-xs font-semibold">
              <div className="flex justify-between items-center text-sky-700">
                <span>AIFS</span>
                <span className="font-mono font-bold">{selectedRegion.aifs}%</span>
              </div>
              <div className="flex justify-between items-center text-indigo-700">
                <span>ECMWF</span>
                <span className="font-mono font-bold">{selectedRegion.ecmwf}%</span>
              </div>
              <div className="flex justify-between items-center text-teal-700">
                <span>GFS</span>
                <span className="font-mono font-bold">{selectedRegion.gfs}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sub-layer buttons */}
        <div className="p-3 bg-white/90 backdrop-blur-md border-t border-slate-200 flex items-center space-x-2">
          <button
            onClick={() => setActiveSublayer("weights")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeSublayer === "weights" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Model Weights
          </button>
          <button
            onClick={() => setActiveSublayer("agreement")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeSublayer === "agreement" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Model Agreement
          </button>
          <button
            onClick={() => setActiveSublayer("risk")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeSublayer === "risk" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Risk Layer
          </button>
        </div>
      </div>
    </div>
  );
}
