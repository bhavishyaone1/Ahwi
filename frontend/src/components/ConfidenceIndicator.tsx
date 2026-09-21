"use client";

import React from "react";
import { ShieldCheck, Check, AlertCircle } from "lucide-react";

interface ConfidenceIndicatorProps {
  confidencePct: number;
  confidenceTier: "High" | "Moderate" | "Low";
  drivers: string[];
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidencePct,
  confidenceTier,
  drivers,
}) => {
  const isHigh = confidenceTier === "High";
  const isMod = confidenceTier === "Moderate";

  const colorClass = isHigh
    ? "bg-emerald-500"
    : isMod
    ? "bg-amber-500"
    : "bg-rose-500";

  const textClass = isHigh
    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : isMod
    ? "text-amber-800 bg-amber-50 border-amber-200"
    : "text-rose-800 bg-rose-50 border-rose-200";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-bold text-slate-900">
            Forecast Confidence
          </h3>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${textClass}`}
        >
          {confidenceTier} Certainty
        </span>
      </div>

      {/* Progress Track */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
        <span className="text-lg font-bold text-slate-900 font-mono">
          {confidencePct}%
        </span>
      </div>

      {/* Grounded Factor Drivers */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
          Confidence Factors:
        </span>
        {drivers.map((d, i) => (
          <div key={i} className="flex items-start space-x-2 text-xs text-slate-600">
            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
            <span>{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
