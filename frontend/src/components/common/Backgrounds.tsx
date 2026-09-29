"use client";

import React from "react";
import { motion } from "motion/react";

/** Fine dot-matrix grid — NWP observational sampling nodes */
export function WeatherGrid({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="weather-dot-grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#weather-dot-grid)" />
    </svg>
  );
}

/** Latitude/longitude coordinate ticks */
export function CoordinateGrid({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="coord-grid-pattern" width="96" height="96" patternUnits="userSpaceOnUse">
          <path d="M 96 0 L 0 0 0 96" fill="none" stroke="currentColor" strokeWidth="0.6" />
          <text x="3" y="12" fill="currentColor" fontSize="7" fontFamily="monospace" opacity="0.5">
            +0.25°
          </text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#coord-grid-pattern)" />
    </svg>
  );
}

/** Stylized atmospheric pressure isobars */
export function ContourLines({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox="0 0 1440 600"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <path d="M -100 200 C 300 120, 650 320, 1000 180 C 1250 80, 1400 220, 1600 170" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
      <path d="M -100 340 C 250 260, 680 440, 1080 300 C 1320 200, 1450 320, 1600 290" stroke="currentColor" strokeWidth="1.1" opacity="0.5" />
      <path d="M -100 480 C 380 400, 800 550, 1180 420 C 1360 340, 1480 430, 1600 400" stroke="currentColor" strokeWidth="0.9" strokeDasharray="4 4" opacity="0.4" />
      <path d="M -100 120 C 200 60, 600 200, 950 100 C 1200 20, 1380 140, 1600 100" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
    </svg>
  );
}

/** Full-page atmospheric background: glows + grid + isobars */
export function AtmosphericBackground({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 overflow-hidden select-none -z-10 ${className}`}
      aria-hidden="true"
    >
      {/* Layered ambient glows */}
      <div className="absolute -top-[15%] left-[40%] -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-sky-300/30 via-sky-200/12 to-transparent dark:from-sky-500/14 dark:via-sky-600/4 blur-[80px] rounded-full" />
      <div className="absolute top-[25%] -right-[8%] w-[800px] h-[600px] bg-gradient-to-bl from-amber-200/20 via-orange-100/8 to-transparent dark:from-amber-500/8 dark:via-transparent blur-[80px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-gradient-to-tr from-sky-100/15 via-transparent to-transparent dark:from-blue-900/8 blur-[60px] rounded-full" />

      {/* Coordinate grid */}
      <CoordinateGrid className="opacity-[0.035] dark:opacity-[0.055] text-sky-600 dark:text-sky-400" />
      {/* Isobar contours */}
      <ContourLines className="opacity-[0.055] dark:opacity-[0.09] text-sky-600 dark:text-sky-300" />

      {/* Station observation pulses */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.04] dark:opacity-[0.07]" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {[
          [280, 220], [560, 310], [880, 240], [1180, 290], [420, 460], [740, 520], [1050, 390]
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="2" fill="#0284c7" />
            <circle cx={cx} cy={cy} r="7" fill="none" stroke="#0284c7" strokeWidth="0.6" opacity="0.5" />
          </g>
        ))}
      </svg>
    </div>
  );
}

/** Page header isobar decoration */
export function WeatherContourHeader({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute -top-6 right-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      <svg width="420" height="140" viewBox="0 0 420 140" fill="none">
        <path d="M 0 70 Q 105 25 210 70 T 420 70" stroke="#0284C7" strokeWidth="1.4" opacity="0.06" />
        <path d="M 0 95 Q 105 50 210 95 T 420 95" stroke="#0369A1" strokeWidth="1.2" opacity="0.05" />
        <path d="M 0 120 Q 105 75 210 120 T 420 120" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 4" opacity="0.05" />
        <path d="M 0 45 Q 105 5 210 45 T 420 45" stroke="#f97316" strokeWidth="0.8" opacity="0.04" />
      </svg>
    </div>
  );
}

/** Active data ingestion pulse indicator */
export function DataPulse({ status = "live" }: { status?: "live" | "demo" | "updating" }) {
  const color =
    status === "live"
      ? "bg-success ring-success/30"
      : status === "demo"
      ? "bg-warning ring-warning/30"
      : "bg-info ring-info/30";

  return (
    <span className="relative flex h-2 w-2">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color}`} />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
    </span>
  );
}
