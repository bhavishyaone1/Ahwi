"use client";

import React from "react";
import { motion } from "motion/react";

/**
 * Atmospheric background graphic:
 * Faint isobar-like contour curves + latitude/longitude coordinate grid + tiny observation pulses.
 * Opacity remains around 0.03–0.06 to guarantee zero interference with data.
 */
export function AnimatedAtmosphereHeader({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.05]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="meteo-grid"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="#0284C7"
              strokeWidth="0.75"
              strokeDasharray="2,6"
            />
            <circle cx="80" cy="0" r="1.5" fill="#0284C7" opacity="0.4" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#meteo-grid)" />

        {/* Faint synoptic isobar contour curves */}
        <motion.path
          d="M -100 220 C 300 120, 600 320, 950 180 C 1200 90, 1400 240, 1600 200"
          fill="none"
          stroke="#0F172A"
          strokeWidth="1.2"
          initial={{ pathLength: 0.9, opacity: 0.3 }}
          animate={{ pathLength: [0.9, 1, 0.9], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M -100 340 C 250 260, 650 420, 1050 290 C 1300 210, 1500 310, 1600 300"
          fill="none"
          stroke="#0284C7"
          strokeWidth="1.2"
          initial={{ pathLength: 0.85, opacity: 0.2 }}
          animate={{ pathLength: [0.85, 1, 0.85], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.path
          d="M -100 460 C 400 380, 800 500, 1150 410 C 1350 350, 1500 420, 1600 400"
          fill="none"
          stroke="#0F172A"
          strokeWidth="1"
          strokeDasharray="4,4"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />

        {/* Tiny synoptic observation station pulses */}
        <g>
          <circle cx="280" cy="180" r="2.5" fill="#0284C7" />
          <circle cx="280" cy="180" r="7" fill="none" stroke="#0284C7" strokeWidth="0.75" opacity="0.4" />
          <circle cx="520" cy="270" r="2.5" fill="#0284C7" />
          <circle cx="820" cy="190" r="2.5" fill="#0284C7" />
          <circle cx="1120" cy="240" r="2.5" fill="#0284C7" />
          <circle cx="1120" cy="240" r="8" fill="none" stroke="#0284C7" strokeWidth="0.75" opacity="0.4" />
        </g>
      </svg>
    </div>
  );
}
