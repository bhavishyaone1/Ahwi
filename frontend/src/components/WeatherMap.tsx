"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Wind,
  Droplets,
  Thermometer,
  Satellite,
  ShieldAlert,
  Cpu,
  Search,
  Play,
  Pause,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { LocationInfo } from "../lib/types";

export interface StationLocation {
  name: string;
  lat: number;
  lon: number;
  region: string;
}

export const INDIAN_STATIONS: StationLocation[] = [
  { name: "Delhi NCR", lat: 28.6139, lon: 77.2090, region: "North India" },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777, region: "West Coast" },
  { name: "Chennai", lat: 13.0827, lon: 80.2707, region: "South East" },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639, region: "East India" },
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946, region: "South Interior" },
  { name: "Hyderabad", lat: 17.3850, lon: 78.4867, region: "Deccan" },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714, region: "West" },
  { name: "Guwahati", lat: 26.1445, lon: 91.7362, region: "Northeast" },
  { name: "Bhubaneswar", lat: 20.2961, lon: 85.8245, region: "East Coast" },
  { name: "Shimla", lat: 31.1048, lon: 77.1734, region: "Western Himalayas" },
];

const TIME_STEPS = [
  { label: "Now", hours: 0 },
  { label: "+6h", hours: 6 },
  { label: "+12h", hours: 12 },
  { label: "+24h", hours: 24 },
  { label: "+48h", hours: 48 },
  { label: "+72h", hours: 72 },
];

const MAP_LAYERS = [
  { id: "rainfall", label: "Rainfall", icon: Droplets },
  { id: "temperature", label: "Temperature", icon: Thermometer },
  { id: "wind", label: "Wind", icon: Wind },
  { id: "satellite", label: "Satellite", icon: Satellite },
  { id: "risk", label: "Risk", icon: ShieldAlert },
  { id: "trust", label: "Model Trust", icon: Cpu },
];

interface WeatherMapProps {
  selectedStation: LocationInfo;
  onSelectStation: (st: LocationInfo) => void;
  variable: string;
  currentValue?: number;
  confidence?: number;
  dominantModel?: string;
  regime?: string;
  leadTimeHours: number;
  onLeadTimeChange: (h: number) => void;
  activeLayer: string;
  onLayerChange: (layer: string) => void;
}

export const WeatherMap: React.FC<WeatherMapProps> = ({
  selectedStation,
  onSelectStation,
  variable,
  currentValue = 42.3,
  confidence = 78,
  dominantModel = "ECMWF_AIFS",
  regime = "HEAVY_RAIN",
  leadTimeHours,
  onLeadTimeChange,
  activeLayer,
  onLayerChange,
}) => {
  const [hoveredStation, setHoveredStation] = useState<LocationInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  // Time slider playback
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      const idx = TIME_STEPS.findIndex((t) => t.hours === leadTimeHours);
      const nextIdx = (idx + 1) % TIME_STEPS.length;
      onLeadTimeChange(TIME_STEPS[nextIdx].hours);
    }, 2000);
    return () => clearInterval(timer);
  }, [isPlaying, leadTimeHours, onLeadTimeChange]);

  // Project coordinates to SVG coordinate system
  const project = (lat: number, lon: number) => {
    const minLat = 7.0;
    const maxLat = 37.5;
    const minLon = 68.0;
    const maxLon = 97.5;
    const x = ((lon - minLon) / (maxLon - minLon)) * 520 + 40;
    const y = 620 - ((lat - minLat) / (maxLat - minLat)) * 580;
    return { x, y };
  };

  const getUnit = () => (variable === "rainfall_mm" ? "mm" : variable === "temperature_c" ? "°C" : "m/s");

  const filteredStations = INDIAN_STATIONS.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full h-[580px] bg-slate-900/5 rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
      {/* Top Map Controls Toolbar */}
      <div className="p-3 bg-white/90 backdrop-blur-md border-b border-slate-200 z-10 flex flex-wrap items-center justify-between gap-2">
        {/* Layer Selectors */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-0.5">
          {MAP_LAYERS.map((layer) => {
            const Icon = layer.icon;
            const isSelected = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => onLayerChange(layer.id)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  isSelected
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>

        {/* Location Search Input */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1 bg-slate-100 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition w-36 sm:w-44"
          />
          {searchQuery && (
            <div className="absolute top-full mt-1 right-0 w-48 bg-white rounded-xl shadow-lg border border-slate-200 p-1 z-30 space-y-0.5">
              {filteredStations.map((st) => (
                <button
                  key={st.name}
                  onClick={() => {
                    onSelectStation({ name: st.name, latitude: st.lat, longitude: st.lon, region: st.region });
                    setSearchQuery("");
                  }}
                  className="w-full text-left px-2 py-1 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-lg font-medium"
                >
                  {st.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SVG Interactive Map Canvas */}
      <div className="relative flex-1 flex items-center justify-center p-2 select-none overflow-hidden">
        <svg viewBox="0 0 600 650" className="w-full h-full max-h-[500px]">
          <defs>
            {/* Grid Pattern */}
            <pattern id="synoptic-grid" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2 2" />
            </pattern>

            {/* Precipitation field gradients matching reference image */}
            <radialGradient id="heavyPrecipGradient" cx="35%" cy="32%" r="28%">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#38BDF8" stopOpacity="0.75" />
              <stop offset="70%" stopColor="#2DD4BF" stopOpacity="0.65" />
              <stop offset="90%" stopColor="#FDE047" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#F8FAFC" stopOpacity="0.1" />
            </radialGradient>

            <radialGradient id="monsoonCoastGradient" cx="24%" cy="65%" r="25%">
              <stop offset="0%" stopColor="#0369A1" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#F8FAFC" stopOpacity="0.05" />
            </radialGradient>

            <radialGradient id="eastPrecipGradient" cx="68%" cy="48%" r="22%">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.75" />
              <stop offset="60%" stopColor="#4ADE80" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#F8FAFC" stopOpacity="0.05" />
            </radialGradient>
          </defs>

          {/* Background Synoptic Grid */}
          <rect width="600" height="650" fill="url(#synoptic-grid)" />

          {/* Stylized Indian Subcontinent Landmass */}
          <path
            d="M 180 80 Q 230 40 270 90 Q 320 140 370 120 Q 420 100 470 130 Q 520 150 540 220 Q 500 280 430 290 Q 400 350 360 410 Q 320 520 280 590 Q 250 550 220 460 Q 180 410 160 340 Q 120 300 130 250 Q 110 200 150 160 Z"
            fill="#F1F5F9"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Meteorological Heat/Rainfall Field Contours (active when rainfall or risk is selected) */}
          {(activeLayer === "rainfall" || activeLayer === "risk" || activeLayer === "satellite") && (
            <g className="transition-opacity duration-500">
              {/* North India Convective Core */}
              <circle cx="210" cy="205" r="115" fill="url(#heavyPrecipGradient)" />
              {/* West Coast / Arabian Sea Plume */}
              <circle cx="160" cy="420" r="100" fill="url(#monsoonCoastGradient)" />
              {/* Bay of Bengal / East Band */}
              <circle cx="390" cy="310" r="95" fill="url(#eastPrecipGradient)" />
            </g>
          )}

          {/* Water Bodies Labels */}
          <text x="75" y="440" fill="#94A3B8" fontSize="10" fontStyle="italic" fontWeight="600">
            Arabian Sea
          </text>
          <text x="435" y="440" fill="#94A3B8" fontSize="10" fontStyle="italic" fontWeight="600">
            Bay of Bengal
          </text>
          <text x="245" y="630" fill="#94A3B8" fontSize="10" fontStyle="italic" fontWeight="600">
            Indian Ocean
          </text>

          {/* Station Markers */}
          {INDIAN_STATIONS.map((st) => {
            const { x, y } = project(st.lat, st.lon);
            const isSelected = selectedStation.name === st.name;
            const isHovered = hoveredStation?.name === st.name;

            return (
              <g
                key={st.name}
                className="cursor-pointer"
                onClick={() =>
                  onSelectStation({
                    name: st.name,
                    latitude: st.lat,
                    longitude: st.lon,
                    region: st.region,
                  })
                }
                onMouseEnter={() =>
                  setHoveredStation({
                    name: st.name,
                    latitude: st.lat,
                    longitude: st.lon,
                    region: st.region,
                  })
                }
                onMouseLeave={() => setHoveredStation(null)}
              >
                {/* Active Outer Pulsing Target Ring */}
                {isSelected && (
                  <>
                    <circle cx={x} cy={y} r="16" fill="#0284C7" opacity="0.25" className="animate-ping" />
                    <circle cx={x} cy={y} r="10" fill="none" stroke="#0284C7" strokeWidth="2" strokeDasharray="3 3" />
                  </>
                )}

                {/* Station Pin Center */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? "6.5" : isHovered ? "5.5" : "4"}
                  fill={isSelected ? "#0F172A" : isHovered ? "#0284C7" : "#475569"}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="shadow-sm"
                />

                {/* Station Label Badge */}
                <g transform={`translate(${x + 8}, ${y - 8})`}>
                  <rect
                    x="0"
                    y="0"
                    width={st.name.length * 6.5 + 10}
                    height="18"
                    rx="4"
                    fill={isSelected ? "#0F172A" : "rgba(255,255,255,0.9)"}
                    stroke={isSelected ? "#0F172A" : "#CBD5E1"}
                    strokeWidth="0.8"
                  />
                  <text
                    x="5"
                    y="13"
                    fill={isSelected ? "#FFFFFF" : "#1E293B"}
                    fontSize="9.5"
                    fontWeight={isSelected ? "700" : "600"}
                  >
                    {st.name}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Rainfall Legend (Bottom Left matching reference mockup) */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md rounded-xl p-2.5 border border-slate-200 shadow-sm text-[10px]">
          <span className="font-bold text-slate-800 block mb-1">
            Rainfall (mm)
          </span>
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-2.5 rounded-xs bg-[#0369A1]" />
              <span className="text-slate-600 font-mono">&gt; 100</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-2.5 rounded-xs bg-[#0284C7]" />
              <span className="text-slate-600 font-mono">50 - 100</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-2.5 rounded-xs bg-[#38BDF8]" />
              <span className="text-slate-600 font-mono">25 - 50</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-2.5 rounded-xs bg-[#2DD4BF]" />
              <span className="text-slate-600 font-mono">10 - 25</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-2.5 rounded-xs bg-[#FDE047]" />
              <span className="text-slate-600 font-mono">5 - 10</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-2.5 rounded-xs bg-[#F87171]" />
              <span className="text-slate-600 font-mono">1 - 5</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-2.5 rounded-xs bg-slate-200" />
              <span className="text-slate-600 font-mono">0 - 1</span>
            </div>
          </div>
        </div>

        {/* Zoom In / Out floating buttons */}
        <div className="absolute right-4 top-14 z-10 flex flex-col space-y-1 bg-white/90 backdrop-blur-md rounded-xl p-1 border border-slate-200 shadow-sm">
          <button className="p-1 rounded-lg text-slate-600 hover:bg-slate-100" title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button className="p-1 rounded-lg text-slate-600 hover:bg-slate-100" title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Time Horizon Slider Bar */}
      <div className="p-2.5 bg-white/95 backdrop-blur-md border-t border-slate-200 z-10 flex items-center justify-between">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            isPlaying ? "bg-amber-500 text-white" : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPlaying ? "Pause" : "Play"}</span>
        </button>

        {/* Slider steps */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {TIME_STEPS.map((step) => {
            const isSelected = leadTimeHours === step.hours;
            return (
              <button
                key={step.hours}
                onClick={() => onLeadTimeChange(step.hours)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  isSelected
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {step.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
