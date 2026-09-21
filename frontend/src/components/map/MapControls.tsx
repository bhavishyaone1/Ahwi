"use client";

import React from "react";
import {
  Droplets,
  Thermometer,
  Wind,
  Satellite,
  ShieldAlert,
  Cpu,
  Search,
  ZoomIn,
  ZoomOut,
  Layers,
} from "lucide-react";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";

export const MAP_LAYERS = [
  { id: "rainfall", label: "Rainfall", icon: Droplets },
  { id: "temperature", label: "Temp", icon: Thermometer },
  { id: "wind", label: "Wind", icon: Wind },
  { id: "satellite", label: "Satellite", icon: Satellite },
  { id: "risk", label: "Risk", icon: ShieldAlert },
  { id: "trust", label: "Model Trust", icon: Cpu },
];

interface MapControlsProps {
  activeLayer: string;
  onLayerChange: (layer: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export function MapControls({
  activeLayer,
  onLayerChange,
  searchQuery,
  onSearchChange,
  onZoomIn,
  onZoomOut,
  onResetView,
}: MapControlsProps) {
  return (
    <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white/95 p-2 shadow-xs backdrop-blur-xs">
      {/* Layer Switcher with Motion Pill */}
      <div className="flex flex-wrap items-center gap-1">
        {MAP_LAYERS.map((layer) => {
          const Icon = layer.icon;
          const isActive = activeLayer === layer.id;
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => onLayerChange(layer.id)}
              className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? "text-sky-900 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="layer-active-pill"
                  className="absolute inset-0 rounded-md bg-sky-100/90 border border-sky-300/80 shadow-xs"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="relative z-10 h-3.5 w-3.5" />
              <span className="relative z-10">{layer.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Search & Zoom Controls */}
      <div className="flex items-center gap-2">
        <div className="relative w-40 sm:w-48">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search station..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-7 pl-8 text-xs bg-slate-50 border-slate-200"
          />
        </div>

        <div className="flex items-center rounded-md border border-slate-200 bg-white shadow-xs">
          <button
            type="button"
            onClick={onZoomIn}
            className="flex h-7 w-7 items-center justify-center text-slate-600 hover:bg-slate-50 border-r border-slate-200"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onZoomOut}
            className="flex h-7 w-7 items-center justify-center text-slate-600 hover:bg-slate-50"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
