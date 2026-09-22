"use client";

import React, { useState } from "react";
import {
  Droplets,
  Thermometer,
  Wind,
  Cloud,
  ArrowUpDown,
  ShieldAlert,
  Cpu,
  Search,
  Plus,
  Minus,
  Maximize2,
  Eye,
  EyeOff,
  RotateCcw,
} from "lucide-react";
import { motion } from "motion/react";

export const MAP_LAYERS = [
  { id: "temperature", label: "Temperature", icon: Thermometer },
  { id: "rainfall", label: "Precipitation", icon: Droplets },
  { id: "pressure", label: "Pressure", icon: ArrowUpDown },
  { id: "wind", label: "Wind speed", icon: Wind },
  { id: "satellite", label: "Clouds", icon: Cloud },
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
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  layersVisible?: boolean;
  onToggleLayersVisible?: () => void;
}

export function MapControls({
  activeLayer,
  onLayerChange,
  searchQuery = "",
  onSearchChange,
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleFullscreen,
  isFullscreen = false,
  layersVisible = true,
  onToggleLayersVisible,
}: MapControlsProps) {
  return (
    <>
      {/* Top Floating Layer Selector Capsule (OpenWeather reference style) */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-20 flex items-center gap-1 rounded-full border border-border/80 bg-surface/90 dark:bg-[#18181b]/90 p-1 shadow-lg backdrop-blur-md transition-colors overflow-x-auto max-w-full">
        <div className="flex items-center gap-1 shrink-0">
          {MAP_LAYERS.map((layer) => {
            const Icon = layer.icon;
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => onLayerChange(layer.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "text-[#e87a53] dark:text-[#f89b78] font-bold"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/80"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="layer-active-capsule"
                    className="absolute inset-0 rounded-full bg-amber-500/15 dark:bg-[#38231c] border border-amber-500/40 dark:border-[#e87a53]/50 shadow-md shadow-amber-500/20 dark:shadow-[#e87a53]/25"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  />
                )}
                <Icon className={`relative z-10 h-3.5 w-3.5 ${isActive ? "text-[#e87a53] dark:text-[#f89b78]" : "text-text-muted"}`} />
                <span className="relative z-10">{layer.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action icons on right of capsule */}
        <div className="flex items-center gap-0.5 pl-1.5 border-l border-border/60 shrink-0">
          {onToggleLayersVisible && (
            <button
              type="button"
              onClick={onToggleLayersVisible}
              className={`p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-secondary transition ${
                !layersVisible ? "text-amber-500" : ""
              }`}
              title={layersVisible ? "Hide overlay layer" : "Show overlay layer"}
            >
              {layersVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
          )}
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-secondary transition"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen map"}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Top Left Floating Search Pill + Zoom Buttons (OpenWeather reference style) */}
      <div className="absolute top-16 left-3 z-20 flex flex-col gap-2 pointer-events-auto">
        {onSearchChange && (
          <div className="relative w-44 sm:w-56">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Name or zip code..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 w-full pl-9 pr-3 rounded-full text-xs bg-surface/90 dark:bg-[#18181b]/90 border border-border/80 text-text-primary placeholder:text-text-muted/70 backdrop-blur-md shadow-md focus:outline-none focus:ring-1 focus:ring-[#e87a53]"
            />
          </div>
        )}

        {/* Vertical Zoom Capsule */}
        <div className="flex flex-col w-8 rounded-xl border border-border/80 bg-surface/90 dark:bg-[#18181b]/90 shadow-md backdrop-blur-md overflow-hidden">
          <button
            type="button"
            onClick={onZoomIn}
            className="flex h-8 w-8 items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-secondary border-b border-border/60 transition"
            title="Zoom In"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onZoomOut}
            className="flex h-8 w-8 items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition"
            title="Zoom Out"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onResetView}
            className="flex h-8 w-8 items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-secondary border-t border-border/60 transition"
            title="Reset India View"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>
    </>
  );
}
