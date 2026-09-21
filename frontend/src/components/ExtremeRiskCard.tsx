"use client";

import React from "react";
import { ShieldAlert, CloudRain, Flame, Wind, AlertCircle } from "lucide-react";
import { ExtremeRiskAssessment } from "../lib/types";

interface ExtremeRiskCardProps {
  assessment: ExtremeRiskAssessment | null;
}

const TIER_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  LOW: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", dot: "bg-emerald-500" },
  WATCH: { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", dot: "bg-amber-500" },
  HIGH: { bg: "bg-rose-50 border-rose-200", text: "text-rose-800", dot: "bg-rose-500" },
  EXTREME: { bg: "bg-red-100 border-red-300", text: "text-red-900 font-bold", dot: "bg-red-600" },
};

export const ExtremeRiskCard: React.FC<ExtremeRiskCardProps> = ({ assessment }) => {
  const risks = assessment?.risks || {
    HEAVY_RAIN: {
      event_type: "HEAVY_RAIN",
      probability_pct: 78.4,
      risk_level: "HIGH",
      threshold_description: "Rainfall > 64.5 mm / 24h",
      contributing_signals: ["Monsoon depression band actively converging"],
    },
    HEATWAVE: {
      event_type: "HEATWAVE",
      probability_pct: 12.0,
      risk_level: "LOW",
      threshold_description: "Max Temp >= 40°C",
      contributing_signals: ["Thermal conditions in normal range"],
    },
    HIGH_WIND: {
      event_type: "HIGH_WIND",
      probability_pct: 32.5,
      risk_level: "WATCH",
      threshold_description: "Wind >= 15 m/s",
      contributing_signals: ["Moderate gradient flow across coast"],
    },
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <h3 className="text-base font-bold text-slate-900">
            Extreme Weather Risk
          </h3>
        </div>
        <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded bg-slate-100 text-slate-700">
          AETHER Model Guidance
        </span>
      </div>

      {/* 3 Risk Tiers */}
      <div className="space-y-3">
        {/* Heavy Rain */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
              <CloudRain className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Heavy Rain</span>
              <span className="text-[10px] text-slate-500">{risks.HEAVY_RAIN.threshold_description}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2.5">
            <span className="text-sm font-bold font-mono text-slate-800">
              {risks.HEAVY_RAIN.probability_pct}%
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold border flex items-center space-x-1.5 ${
                TIER_STYLES[risks.HEAVY_RAIN.risk_level]?.bg
              } ${TIER_STYLES[risks.HEAVY_RAIN.risk_level]?.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${TIER_STYLES[risks.HEAVY_RAIN.risk_level]?.dot}`} />
              <span>{risks.HEAVY_RAIN.risk_level}</span>
            </span>
          </div>
        </div>

        {/* Heatwave */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Heat Risk</span>
              <span className="text-[10px] text-slate-500">{risks.HEATWAVE.threshold_description}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2.5">
            <span className="text-sm font-bold font-mono text-slate-800">
              {risks.HEATWAVE.probability_pct}%
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold border flex items-center space-x-1.5 ${
                TIER_STYLES[risks.HEATWAVE.risk_level]?.bg
              } ${TIER_STYLES[risks.HEATWAVE.risk_level]?.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${TIER_STYLES[risks.HEATWAVE.risk_level]?.dot}`} />
              <span>{risks.HEATWAVE.risk_level}</span>
            </span>
          </div>
        </div>

        {/* High Wind */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">High Wind</span>
              <span className="text-[10px] text-slate-500">{risks.HIGH_WIND.threshold_description}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2.5">
            <span className="text-sm font-bold font-mono text-slate-800">
              {risks.HIGH_WIND.probability_pct}%
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold border flex items-center space-x-1.5 ${
                TIER_STYLES[risks.HIGH_WIND.risk_level]?.bg
              } ${TIER_STYLES[risks.HIGH_WIND.risk_level]?.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${TIER_STYLES[risks.HIGH_WIND.risk_level]?.dot}`} />
              <span>{risks.HIGH_WIND.risk_level}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Official Disclaimer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-start space-x-2 text-[11px] text-slate-500">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-tight">
          <strong className="text-slate-700">AETHER Statistical Model Risk:</strong> Not an official meteorological warning. Consult IMD/NCMRWF for official advisories.
        </p>
      </div>
    </div>
  );
};
