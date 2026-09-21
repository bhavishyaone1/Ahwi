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
  RotateCcw,
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
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export function MapControls({
  activeLayer,
  onLayerChange,
  searchQuery = "",
  onSearchChange,
  onZoomIn,
  onZoomOut,
  onResetView,
}: MapControlsProps) {
  return (
    <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface/95 dark:bg-surface/95 p-1.5 shadow-xs backdrop-blur-md transition-colors">
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
              className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "text-sky-900 dark:text-sky-100 font-bold"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="layer-active-pill"
                  className="absolute inset-0 rounded-lg bg-sky-100 dark:bg-sky-950/80 border border-sky-300/80 dark:border-sky-800 shadow-xs"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <Icon className="relative z-10 h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              <span className="relative z-10">{layer.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Search & Zoom Controls */}
      <div className="flex items-center gap-1.5">
        {onSearchChange && (
          <div className="relative w-36 sm:w-44">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search station..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-7 w-full pl-8 pr-2 rounded-md text-xs bg-surface-secondary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        )}

        <div className="flex items-center rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={onZoomIn}
            className="flex h-7 w-7 items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-secondary border-r border-border transition"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onZoomOut}
            className="flex h-7 w-7 items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-secondary border-r border-border transition"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onResetView}
            className="flex h-7 w-7 items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition"
            title="Reset India View"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
