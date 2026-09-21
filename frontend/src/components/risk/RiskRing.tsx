"use client";

import React from "react";
import { motion } from "motion/react";
import { CloudRain, Flame, Wind, AlertTriangle } from "lucide-react";

interface RiskRingProps {
  type: "rain" | "heat" | "wind";
  label: string;
  probability: number; // 0 to 100
  tier: "LOW" | "WATCH" | "HIGH" | "EXTREME" | "MEDIUM" | "NORMAL";
  className?: string;
}

export function RiskRing({
  type,
  label,
  probability,
  tier,
  className = "",
}: RiskRingProps) {
  // Color styling based on tier
  const getTierColors = () => {
    switch (tier) {
      case "EXTREME":
        return { stroke: "#DC2626", text: "text-rose-500", bg: "bg-rose-500/10", badge: "bg-rose-500/10 text-rose-500 border-rose-500/20" };
      case "HIGH":
        return { stroke: "#EF4444", text: "text-rose-500", bg: "bg-rose-500/10", badge: "bg-rose-500/10 text-rose-500 border-rose-500/20" };
      case "WATCH":
      case "MEDIUM":
        return { stroke: "#F59E0B", text: "text-amber-500", bg: "bg-amber-500/10", badge: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
      case "LOW":
      case "NORMAL":
      default:
        return { stroke: "#10B981", text: "text-emerald-500", bg: "bg-emerald-500/10", badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
    }
  };

  const colors = getTierColors();
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (probability / 100) * circumference;

  const Icon = type === "rain" ? CloudRain : type === "heat" ? Flame : Wind;

  return (
    <div className={`flex flex-col items-center rounded-lg border border-border bg-surface p-4 shadow-xs text-center ${className}`}>
      <div className="flex items-center gap-1.5 mb-2 text-text-secondary font-medium text-xs">
        <Icon className="h-3.5 w-3.5 text-text-muted" />
        <span>{label}</span>
      </div>

      {/* Circular Progress Ring */}
      <div className="relative h-24 w-24 flex items-center justify-center my-1">
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 96 96">
          {/* Background track */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth="6"
            fill="none"
          />
          {/* Animated value arc */}
          <motion.circle
            cx="48"
            cy="48"
            r={radius}
            stroke={colors.stroke}
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold font-mono tracking-tight text-text-primary leading-none">
            {probability}%
          </span>
        </div>
      </div>

      {/* Tier Badge */}
      <span
        className={`mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${colors.badge}`}
      >
        {tier}
      </span>
    </div>
  );
}
