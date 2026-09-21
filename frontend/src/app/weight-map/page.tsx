"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { useAetherData } from "../../context/AetherDataContext";
import { Layers, MapPin, ZoomIn, ZoomOut, Info } from "lucide-react";
import { INDIAN_STATIONS } from "../../components/WeatherMap";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { pageVariants, fadeUp } from "@/lib/motion";

export default function WeightMapPage() {
  const { variable, setVariable, leadTimeHours, setLeadTimeHours, setSelectedLocation } =
    useAetherData();
  const [selectedModel, setSelectedModel] = useState<string>("AIFS Weight");
  const [activeSublayer, setActiveSublayer] = useState<"weights" | "agreement" | "risk">(
    "weights"
  );
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
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-semibold">
            <Layers className="h-3 w-3 text-sky-600" />
            <span>0.25° Regional Dominance</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight mt-1">
            Spatial Model Contribution
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            See which model AETHER trusts across different regions and lead times (0.25° grid)
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Variable */}
          <select
            value={variable}
            onChange={(e) => setVariable(e.target.value)}
            className="h-8 bg-white border border-slate-200 rounded-md px-2.5 text-xs font-semibold text-slate-800 shadow-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
          >
            <option value="rainfall_mm">Rainfall</option>
            <option value="temperature_c">Temperature</option>
            <option value="wind_speed_ms">Wind Speed</option>
          </select>

          {/* Lead Time */}
          <select
            value={leadTimeHours}
            onChange={(e) => setLeadTimeHours(Number(e.target.value))}
            className="h-8 bg-white border border-slate-200 rounded-md px-2.5 text-xs font-semibold text-slate-800 shadow-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
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
            className="h-8 bg-white border border-slate-200 rounded-md px-2.5 text-xs font-semibold text-slate-800 shadow-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
          >
            <option value="AIFS Weight">AIFS Weight</option>
            <option value="ECMWF Weight">ECMWF IFS Weight</option>
            <option value="GFS Weight">GFS Weight</option>
            <option value="Dominant Model">Dominant Model</option>
            <option value="Model Agreement">Model Agreement</option>
          </select>
        </div>
      </div>

      {/* Main Map Container */}
      <motion.div
        variants={fadeUp}
        className="relative w-full h-[540px] bg-slate-50/70 rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
      >
        {/* SVG Subcontinental Dominance Canvas */}
        <div className="relative flex-1 flex items-center justify-center select-none p-2">
          <svg viewBox="0 0 600 650" className="w-full h-full max-h-[500px]">
            <defs>
              <pattern id="weight-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                <path
                  d="M 28 0 L 0 0 0 28"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="0.5"
                  strokeDasharray="2 2"
                />
              </pattern>

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

            <text x="80" y="440" fill="#94A3B8" fontSize="10" fontStyle="italic" fontWeight="600">
              Arabian Sea
            </text>
            <text x="430" y="440" fill="#94A3B8" fontSize="10" fontStyle="italic" fontWeight="600">
              Bay of Bengal
            </text>

            {/* Stations */}
            {INDIAN_STATIONS.map((st) => {
              const { x, y } = project(st.lat, st.lon);
              const isSelected = selectedRegion.name.includes(st.name);

              return (
                <g
                  key={st.name}
                  onClick={() => {
                    setSelectedLocation({
                      name: st.name,
                      latitude: st.lat,
                      longitude: st.lon,
                      region: st.region,
                    });
                    setSelectedRegion({
                      name: `${st.region} (${st.name})`,
                      aifs: st.name === "Delhi NCR" ? 46 : st.name === "Mumbai" ? 38 : 42,
                      ecmwf: st.name === "Delhi NCR" ? 32 : st.name === "Mumbai" ? 44 : 35,
                      gfs: st.name === "Delhi NCR" ? 22 : st.name === "Mumbai" ? 18 : 23,
                    });
                  }}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 6 : 4}
                    fill={isSelected ? "#0284C7" : "#0F172A"}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    className="transition-transform group-hover:scale-125"
                  />
                  <text
                    x={x + 8}
                    y={y + 4}
                    fontSize="10"
                    fontWeight={isSelected ? "bold" : "500"}
                    fill={isSelected ? "#0284C7" : "#334155"}
                  >
                    {st.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Bracket Legend matching reference image */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs p-3 rounded-lg border border-slate-200 shadow-xs text-xs space-y-1.5 z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              AIFS Contribution
            </span>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-4 rounded-xs bg-rose-500" />
              <span className="font-mono text-[11px]">&gt; 60%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-4 rounded-xs bg-orange-500" />
              <span className="font-mono text-[11px]">40–60%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-4 rounded-xs bg-amber-400" />
              <span className="font-mono text-[11px]">25–40%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-4 rounded-xs bg-emerald-400" />
              <span className="font-mono text-[11px]">15–25%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-4 rounded-xs bg-sky-400" />
              <span className="font-mono text-[11px]">5–15%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-4 rounded-xs bg-blue-600" />
              <span className="font-mono text-[11px]">&lt; 5%</span>
            </div>
          </div>

          {/* Regional Inspection Card matching reference */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs p-3.5 rounded-lg border border-slate-200 shadow-xs text-xs w-56 z-10">
            <span className="font-bold text-slate-900 block mb-2">{selectedRegion.name}</span>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-600" /> AIFS:
                </span>
                <span className="font-bold text-sky-700">{selectedRegion.aifs}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-600" /> ECMWF IFS:
                </span>
                <span className="font-bold text-slate-800">{selectedRegion.ecmwf}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-500" /> GFS:
                </span>
                <span className="font-bold text-slate-600">{selectedRegion.gfs}%</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
              AIFS achieves superior skill in monsoonal convection across northern terrain.
            </p>
          </div>
        </div>

        {/* Bottom Sublayer Filter Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs z-10">
          <div className="flex items-center gap-1">
            <Button
              variant={activeSublayer === "weights" ? "scientific" : "outline"}
              size="sm"
              onClick={() => setActiveSublayer("weights")}
            >
              Model Weights
            </Button>
            <Button
              variant={activeSublayer === "agreement" ? "scientific" : "outline"}
              size="sm"
              onClick={() => setActiveSublayer("agreement")}
            >
              Model Agreement
            </Button>
            <Button
              variant={activeSublayer === "risk" ? "scientific" : "outline"}
              size="sm"
              onClick={() => setActiveSublayer("risk")}
            >
              Risk Layer
            </Button>
          </div>

          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            AETHER 0.25° High-Resolution Analysis Mesh
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
