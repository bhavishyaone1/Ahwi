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
        return { stroke: "#dc2626", text: "text-danger", bg: "bg-danger/10", badge: "bg-danger/10 text-danger border-danger/30" };
      case "HIGH":
        return { stroke: "#dc2626", text: "text-danger", bg: "bg-danger/10", badge: "bg-danger/10 text-danger border-danger/30" };
      case "WATCH":
      case "MEDIUM":
        return { stroke: "#f59e0b", text: "text-warning", bg: "bg-warning/10", badge: "bg-warning/10 text-warning border-warning/30" };
      case "LOW":
      case "NORMAL":
      default:
        return { stroke: "#10b981", text: "text-success", bg: "bg-success/10", badge: "bg-success/10 text-success border-success/30" };
    }
  };

  const colors = getTierColors();
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (probability / 100) * circumference;

  const Icon = type === "rain" ? CloudRain : type === "heat" ? Flame : Wind;

  return (
    <div className={`flex flex-col items-center rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow-md card-interactive text-center ${className}`}>
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
            className="stroke-border"
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
