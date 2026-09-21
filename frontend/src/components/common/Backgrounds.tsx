"use client";

import React from "react";
import { motion } from "motion/react";

/**
 * CoordinateGrid:
 * Subtle latitude/longitude coordinate ticks and intersecting lines.
 */
export function CoordinateGrid({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full opacity-[0.035] ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="coord-grid-pattern" width="120" height="120" patternUnits="userSpaceOnUse">
          <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#0284C7" strokeWidth="0.75" />
          <text x="4" y="14" fill="#0284C7" fontSize="8" fontFamily="monospace" opacity="0.6">
            +0.25°
          </text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#coord-grid-pattern)" />
    </svg>
  );
}

/**
 * ContourLines:
 * Stylized atmospheric pressure isobars.
 */
export function ContourLines({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full opacity-[0.04] ${className}`}
      viewBox="0 0 1440 600"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      <path
        d="M -100 200 C 300 120, 650 320, 1000 180 C 1250 80, 1400 220, 1600 170"
        stroke="#0284C7"
        strokeWidth="1.5"
      />
      <path
        d="M -100 340 C 250 260, 680 440, 1080 300 C 1320 200, 1450 320, 1600 290"
        stroke="#0369A1"
        strokeWidth="1.2"
      />
      <path
        d="M -100 480 C 380 400, 800 550, 1180 420 C 1360 340, 1480 430, 1600 400"
        className="stroke-slate-900 dark:stroke-slate-300"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
    </svg>
  );
}

/**
 * WeatherGrid:
 * Fine dot matrix representing observational sampling nodes.
 */
export function WeatherGrid({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full opacity-[0.03] ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="weather-dot-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#0284C7" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#weather-dot-grid)" />
    </svg>
  );
}

/**
 * AtmosphericBackground:
 * Global meteorological background combining:
 * - Subtle ambient blue atmospheric glow
 * - Coordinate grid
 * - Isobar contour lines
 * - Observation station pulses
 * Opacity remains strictly 0.02–0.06 behind all content.
 */
export function AtmosphericBackground({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 overflow-hidden select-none -z-10 ${className}`}
      aria-hidden="true"
    >
      {/* Soft ambient atmospheric glow */}
      <div className="absolute -top-[12%] left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-sky-100/40 via-sky-50/15 to-transparent blur-3xl rounded-full" />

      {/* Coordinate & dot grid */}
      <CoordinateGrid />
      <ContourLines />

      {/* Observation nodes with subtle pulses */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.045]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
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
 * Isobar contour lines placed behind page headers.
 */
export function WeatherContourHeader({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute -top-4 right-0 overflow-hidden select-none opacity-[0.05] ${className}`}>
      <svg width="360" height="120" viewBox="0 0 360 120" fill="none">
        <path d="M 0 60 Q 90 20 180 60 T 360 60" stroke="#0284C7" strokeWidth="1.5" />
        <path d="M 0 85 Q 90 45 180 85 T 360 85" stroke="#0369A1" strokeWidth="1.5" />
        <path d="M 0 110 Q 90 70 180 110 T 360 110" className="stroke-slate-900 dark:stroke-slate-300" strokeWidth="1.2" strokeDasharray="3 3" />
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
