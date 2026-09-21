"use client";

import React from "react";
import { Cpu, CheckCircle } from "lucide-react";

interface ModelWeightBarsProps {
  weights: Record<string, number>;
  dominantModel: string;
  regime?: string;
}

const MODEL_METADATA: Record<string, { label: string; desc: string; color: string }> = {
  ECMWF_IFS: {
    label: "ECMWF / IFS",
    desc: "Physics NWP (9km)",
    color: "bg-sky-500",
  },
  ECMWF_AIFS: {
    label: "ECMWF / AIFS",
    desc: "AI Foundation Model",
    color: "bg-indigo-500",
  },
  GFS: {
    label: "NOAA GFS",
    desc: "Global NWP (0.25°)",
    color: "bg-teal-500",
  },
};

export const ModelWeightBars: React.FC<ModelWeightBarsProps> = ({
  weights,
  dominantModel,
  regime = "HEAVY_RAIN",
}) => {
  const models = ["ECMWF_IFS", "ECMWF_AIFS", "GFS"];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-bold text-slate-900">
            Dynamic Model Trust
          </h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          Normalized Softmax
        </span>
      </div>

      {/* Model Weight Bars */}
      <div className="space-y-4">
        {models.map((modelKey) => {
          const rawWeight = weights[modelKey] || 0.33;
          const pct = Math.round(rawWeight * 100);
          const meta = MODEL_METADATA[modelKey] || {
            label: modelKey,
            desc: "NWP Model",
            color: "bg-slate-500",
          };
          const isDominant = modelKey === dominantModel;

          return (
            <div key={modelKey} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-800">{meta.label}</span>
                  <span className="text-[11px] text-slate-400">({meta.desc})</span>
                  {isDominant && (
                    <span className="flex items-center space-x-1 text-[10px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.2 rounded">
                      <CheckCircle className="w-2.5 h-2.5" />
                      <span>Dominant</span>
                    </span>
                  )}
                </div>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {pct}%
                </span>
              </div>

              {/* Bar Track */}
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${meta.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Operational Explanation */}
      <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
        <span className="font-semibold text-slate-800 block mb-0.5">
          Why AETHER trusts {dominantModel}:
        </span>
        Under the detected <span className="font-medium text-slate-900">{regime}</span> regime,{" "}
        {dominantModel} demonstrated the lowest recent forecast errors and strongest regional skill,
        earning the highest dynamic weight contribution.
      </div>
    </div>
  );
};
