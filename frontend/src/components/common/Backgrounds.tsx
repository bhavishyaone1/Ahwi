"use client";

import React from "react";
import { motion } from "motion/react";

/**
 * AtmosphericBackground:
 * Very subtle meteorological background consisting of:
 * - Fine coordinate grid (lat/lon)
 * - Slow-moving synoptic isobar contour curves
 * - Soft radial ambient blue glow
 * - Tiny observation station pulses
 * Opacity remains strictly 0.02–0.06 to ensure zero interference with data.
 */
export function AtmosphericBackground({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 overflow-hidden select-none -z-10 ${className}`}
      aria-hidden="true"
    >
      {/* Soft radial blue atmosphere glow */}
      <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-sky-100/40 via-sky-50/20 to-transparent blur-3xl rounded-full" />

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.045]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="global-meteo-grid"
            width="90"
            height="90"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 90 0 L 0 0 0 90"
              fill="none"
              stroke="#0284C7"
              strokeWidth="0.8"
              strokeDasharray="2,6"
            />
            <circle cx="90" cy="0" r="1.5" fill="#0284C7" opacity="0.5" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#global-meteo-grid)" />

        {/* Slow-moving Synoptic Pressure Isobar Waves */}
        <motion.path
          d="M -150 280 C 250 160, 580 380, 920 220 C 1180 120, 1380 270, 1650 220"
          fill="none"
          stroke="#0369A1"
          strokeWidth="1.5"
          initial={{ pathLength: 0.9, opacity: 0.3 }}
          animate={{ pathLength: [0.9, 1, 0.9], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M -150 420 C 200 320, 620 500, 1020 360 C 1280 260, 1460 380, 1650 340"
          fill="none"
          stroke="#0284C7"
          strokeWidth="1.3"
          initial={{ pathLength: 0.85, opacity: 0.25 }}
          animate={{ pathLength: [0.85, 1, 0.85], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.path
          d="M -150 560 C 350 460, 780 620, 1140 480 C 1340 400, 1480 490, 1650 460"
          fill="none"
          stroke="#0F172A"
          strokeWidth="1.2"
          strokeDasharray="4,4"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />

        {/* Observation Station Coordinates */}
        <g>
          <circle cx="280" cy="220" r="2.5" fill="#0284C7" />
          <circle cx="280" cy="220" r="8" fill="none" stroke="#0284C7" strokeWidth="0.75" opacity="0.4" />
          <circle cx="560" cy="310" r="2.5" fill="#0284C7" />
          <circle cx="880" cy="240" r="2.5" fill="#0284C7" />
          <circle cx="1180" cy="290" r="2.5" fill="#0284C7" />
          <circle cx="1180" cy="290" r="9" fill="none" stroke="#0284C7" strokeWidth="0.75" opacity="0.4" />
        </g>
      </svg>
    </div>
  );
}

/**
 * WeatherContourHeader:
 * Isobar contour lines that appear directly behind page title headers.
 */
export function WeatherContourHeader({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute -top-4 right-0 overflow-hidden select-none opacity-[0.05] ${className}`}>
      <svg width="360" height="120" viewBox="0 0 360 120" fill="none">
        <path d="M 0 60 Q 90 20 180 60 T 360 60" stroke="#0284C7" strokeWidth="1.5" />
        <path d="M 0 85 Q 90 45 180 85 T 360 85" stroke="#0369A1" strokeWidth="1.5" />
        <path d="M 0 110 Q 90 70 180 110 T 360 110" stroke="#0F172A" strokeWidth="1.2" strokeDasharray="3 3" />
      </svg>
    </div>
  );
}

/**
 * DataPulse:
 * Controlled pulsing indicator for active ingestion and pipeline feeds.
 */
export function DataPulse({ status = "live" }: { status?: "live" | "demo" | "updating" }) {
  const color =
    status === "live"
      ? "bg-emerald-500 ring-emerald-200"
      : status === "demo"
      ? "bg-amber-500 ring-amber-200"
      : "bg-sky-500 ring-sky-200";

  return (
    <span className="relative flex h-2 w-2">
      <span
        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color}`}
      />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
    </span>
  );
}
