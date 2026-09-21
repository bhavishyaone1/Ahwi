"use client";

import React from "react";
import { ModelExplanation } from "../lib/types";
import { ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";

interface ShapWaterfallProps {
  explanation: ModelExplanation | null;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export const ShapWaterfall: React.FC<ShapWaterfallProps> = ({
  explanation,
  selectedModel,
  onSelectModel,
}) => {
  const models = ["ECMWF_AIFS", "ECMWF_IFS", "GFS"];
  const drivers = explanation?.top_drivers || [
    {
      feature_name: "recent_mae_72h",
      feature_value: 2.4,
      shap_value: 0.14,
      effect: "INCREASES_WEIGHT" as const,
      plain_text_explanation: "High recent accuracy under active convective regime",
    },
    {
      feature_name: "regime_match",
      feature_value: 0.82,
      shap_value: 0.08,
      effect: "INCREASES_WEIGHT" as const,
      plain_text_explanation: "Atmospheric weather-regime compatibility",
    },
    {
      feature_name: "lead_time_skill",
      feature_value: 24.0,
      shap_value: 0.05,
      effect: "INCREASES_WEIGHT" as const,
      plain_text_explanation: "Optimal skill at 24h forecast horizon",
    },
    {
      feature_name: "model_spread",
      feature_value: 4.8,
      shap_value: -0.03,
      effect: "DECREASES_WEIGHT" as const,
      plain_text_explanation: "Model spread and spatial divergence factor",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">
              SHAP Attribution Engine (Why This Weight?)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            TreeExplainer feature attributions for {selectedModel}
          </p>
        </div>

        {/* Model Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start">
          {models.map((m) => (
            <button
              key={m}
              onClick={() => onSelectModel(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedModel === m
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {m.replace("ECMWF_", "")}
            </button>
          ))}
        </div>
      </div>

      {/* Narrative Header */}
      <div className="mb-6 p-4 rounded-xl bg-sky-50/60 border border-sky-100 text-xs text-sky-900 leading-relaxed font-medium">
        {explanation?.summary_narrative ||
          `AETHER dynamically assigns weight based on which atmospheric signals and historical error profiles align best with current observations.`}
      </div>

      {/* SHAP Factors List */}
      <div className="space-y-3">
        {drivers.map((d, i) => {
          const isPositive = d.effect === "INCREASES_WEIGHT";
          const barWidth = Math.min(100, Math.max(15, Math.abs(d.shap_value) * 500));

          return (
            <div
              key={i}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  {isPositive ? (
                    <div className="p-1 rounded bg-emerald-100 text-emerald-700">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="p-1 rounded bg-rose-100 text-rose-700">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <span className="font-bold text-slate-800">
                    {d.plain_text_explanation}
                  </span>
                </div>
                <span
                  className={`font-mono font-bold text-xs ${
                    isPositive ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {d.shap_value.toFixed(3)}
                </span>
              </div>

              {/* Attribution Bar */}
              <div className="w-full h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isPositive ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                <span>Feature: {d.feature_name}</span>
                <span>Value: {d.feature_value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
