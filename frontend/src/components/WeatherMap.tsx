"use client";

import React, { useState } from "react";
import { MapPin, Wind, Droplets, Thermometer, ShieldCheck } from "lucide-react";

export interface StationLocation {
  name: string;
  lat: number;
  lon: number;
  region: string;
}

export const INDIAN_STATIONS: StationLocation[] = [
  { name: "Delhi NCR", lat: 28.6139, lon: 77.2090, region: "North" },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777, region: "West Coast" },
  { name: "Chennai", lat: 13.0827, lon: 80.2707, region: "South East" },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639, region: "East" },
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946, region: "South Interior" },
  { name: "Hyderabad", lat: 17.3850, lon: 78.4867, region: "Deccan" },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714, region: "West" },
  { name: "Guwahati", lat: 26.1445, lon: 91.7362, region: "Northeast" },
  { name: "Bhubaneswar", lat: 20.2961, lon: 85.8245, region: "East Coast" },
  { name: "Shimla", lat: 31.1048, lon: 77.1734, region: "Western Himalayas" },
];

interface WeatherMapProps {
  selectedStation: StationLocation;
  onSelectStation: (st: StationLocation) => void;
  variable: string;
  currentValue?: number;
  confidence?: number;
  dominantModel?: string;
  regime?: string;
}

export const WeatherMap: React.FC<WeatherMapProps> = ({
  selectedStation,
  onSelectStation,
  variable,
  currentValue = 42.3,
  confidence = 84,
  dominantModel = "ECMWF_AIFS",
  regime = "HEAVY_RAIN",
}) => {
  const [hoveredStation, setHoveredStation] = useState<StationLocation | null>(null);

  // Map lat/lon onto viewBox 0 0 600 650 (India bounding box ~ lat 8-36, lon 68-98)
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

  return (
    <div className="relative w-full h-[520px] bg-slate-50/70 rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex items-center justify-center p-4">
      {/* Map Header Status Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md rounded-xl p-3 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
          <span className="text-xs font-semibold text-slate-800">
            India Synoptic Grid 0.25°
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Select station to inspect adaptive blend & weights
        </p>
      </div>

      {/* SVG Map Canvas */}
      <svg
        viewBox="0 0 600 650"
        className="w-full h-full max-h-[500px] select-none"
      >
        <defs>
          {/* Subtle grid pattern */}
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2 2" />
          </pattern>
          <linearGradient id="indiaGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#EEF2F6" />
          </linearGradient>
        </defs>

        <rect width="600" height="650" fill="url(#grid)" />

        {/* Stylized India Subcontinental Outline */}
        <path
          d="M 180 80 Q 230 40 270 90 Q 320 140 370 120 Q 420 100 470 130 Q 520 150 540 220 Q 500 280 430 290 Q 400 350 360 410 Q 320 520 280 590 Q 250 550 220 460 Q 180 410 160 340 Q 120 300 130 250 Q 110 200 150 160 Z"
          fill="url(#indiaGrad)"
          stroke="#CBD5E1"
          strokeWidth="1.5"
          strokeLinejoin="round"
          className="transition-all"
        />

        {/* Arabian Sea, Bay of Bengal, Indian Ocean subtle labels */}
        <text x="80" y="440" fill="#94A3B8" fontSize="11" fontStyle="italic" fontWeight="500">
          Arabian Sea
        </text>
        <text x="430" y="440" fill="#94A3B8" fontSize="11" fontStyle="italic" fontWeight="500">
          Bay of Bengal
        </text>

        {/* Station Pins */}
        {INDIAN_STATIONS.map((st) => {
          const { x, y } = project(st.lat, st.lon);
          const isSelected = selectedStation.name === st.name;
          const isHovered = hoveredStation?.name === st.name;

          return (
            <g
              key={st.name}
              className="cursor-pointer transition-transform duration-200"
              onClick={() => onSelectStation(st)}
              onMouseEnter={() => setHoveredStation(st)}
              onMouseLeave={() => setHoveredStation(null)}
            >
              {/* Outer Pulse Ring for Selected */}
              {isSelected && (
                <circle
                  cx={x}
                  cy={y}
                  r="14"
                  fill="#0284C7"
                  opacity="0.2"
                  className="animate-ping"
                />
              )}

              {/* Station Circle */}
              <circle
                cx={x}
                cy={y}
                r={isSelected ? "7" : isHovered ? "6" : "4.5"}
                fill={isSelected ? "#0284C7" : isHovered ? "#0369A1" : "#475569"}
                stroke="#FFFFFF"
                strokeWidth="2"
                className="transition-all"
              />

              {/* Station Label */}
              <text
                x={x + 9}
                y={y + 4}
                fill={isSelected ? "#0F172A" : "#64748B"}
                fontSize={isSelected ? "11" : "10"}
                fontWeight={isSelected ? "600" : "500"}
                className="select-none pointer-events-none drop-shadow-xs"
              >
                {st.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Inspection Tooltip for Selected Station */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-lg max-w-xs w-full">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-sky-600" />
            <span className="text-sm font-bold text-slate-900">
              {selectedStation.name}
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            {regime}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-slate-500 block text-[10px] uppercase tracking-wider">
              AETHER Blend
            </span>
            <span className="text-base font-bold text-slate-900">
              {currentValue} {getUnit()}
            </span>
          </div>

          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-slate-500 block text-[10px] uppercase tracking-wider">
              Confidence
            </span>
            <span className="text-base font-bold text-emerald-600">
              {confidence}%
            </span>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
          <span>Leading Model:</span>
          <span className="font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
            {dominantModel}
          </span>
        </div>
      </div>
    </div>
  );
};
