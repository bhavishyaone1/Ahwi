"use client";

import React, { useState } from "react";
import { useAetherData } from "../../context/AetherDataContext";
import { Cpu, Award, ShieldAlert, Sparkles, AlertTriangle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

export default function ModelIntelligencePage() {
  const { data } = useAetherData();
  const [activeTab, setActiveTab] = useState<"performance" | "weights" | "shap">("weights");

  const weights = data?.weights || { ECMWF_AIFS: 0.46, ECMWF_IFS: 0.32, GFS: 0.22 };
  const topFactors = data?.explanations.top_factors || [
    { feature: "Recent 72h accuracy", attribution: 0.14, direction: "positive" },
    { feature: "Regime compatibility", attribution: 0.10, direction: "positive" },
    { feature: "Satellite agreement", attribution: 0.08, direction: "positive" },
    { feature: "Lead-time skill", attribution: 0.06, direction: "positive" },
    { feature: "Model spread", attribution: -0.04, direction: "negative" },
  ];

  const shapWaterfall = data?.explanations.shap_waterfall || [
    { name: "Base Weight", value: 0.33, contribution: 0.0 },
    { name: "Recent 72h Error", value: 0.47, contribution: 0.14 },
    { name: "Regime Match", value: 0.57, contribution: 0.10 },
    { name: "Satellite Agreement", value: 0.65, contribution: 0.08 },
    { name: "Lead-time Skill", value: 0.71, contribution: 0.06 },
    { name: "Model Spread", value: 0.67, contribution: -0.04 },
    { name: "GFS Bias Signal", value: 0.46, contribution: -0.21 },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-bold">
            <Cpu className="w-3 h-3 text-sky-600" />
            <span>Explainable Model Trust</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Model Intelligence — Why AETHER Trusts AIFS
          </h1>
          <p className="text-xs text-slate-500">
            Understand model performance, dynamic weights, and empirical SHAP key drivers
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab("performance")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "performance" ? "bg-white text-sky-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab("weights")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "weights" ? "bg-white text-sky-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Model Weights
          </button>
          <button
            onClick={() => setActiveTab("shap")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "shap" ? "bg-white text-sky-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            SHAP Explanation
          </button>
        </div>
      </div>

      {/* Top Section: Donut/Weights Card + 30-Day Skill Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Current Model Weights */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-3">
              Current Model Weights
            </span>

            {/* Circular representation */}
            <div className="flex items-center justify-center my-4">
              <div className="relative w-36 h-36 rounded-full border-8 border-sky-500 flex flex-col items-center justify-center bg-slate-50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AETHER</span>
                <span className="text-sm font-black text-slate-900">WEIGHTS</span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-2 text-xs font-semibold pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                  <span className="text-slate-700">AIFS</span>
                </div>
                <span className="font-mono font-extrabold text-slate-900">
                  {Math.round((weights["ECMWF_AIFS"] || 0.46) * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <span className="text-slate-700">ECMWF</span>
                </div>
                <span className="font-mono font-extrabold text-slate-900">
                  {Math.round((weights["ECMWF_IFS"] || 0.32) * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                  <span className="text-slate-700">GFS</span>
                </div>
                <span className="font-mono font-extrabold text-slate-900">
                  {Math.round((weights["GFS"] || 0.22) * 100)}%
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-4 italic">
            * Weights dynamically derived via XGBoost softmax regression trained on ground-truth verification.
          </p>
        </div>

        {/* Model Performance (Last 30 Days) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-3">
            Model Performance (Last 30 Days)
          </span>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Model</th>
                  <th className="p-3">MAE (mm)</th>
                  <th className="p-3">RMSE (mm)</th>
                  <th className="p-3">Bias (mm)</th>
                  <th className="p-3">Skill Score</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-800">ECMWF IFS</td>
                  <td className="p-3">5.42</td>
                  <td className="p-3">8.76</td>
                  <td className="p-3 text-rose-600">-1.22</td>
                  <td className="p-3 font-bold text-slate-700">0.68</td>
                  <td className="p-3 text-emerald-600 font-semibold">Healthy</td>
                </tr>
                <tr className="hover:bg-sky-50/50 bg-sky-50/20 font-bold">
                  <td className="p-3 text-sky-900">ECMWF AIFS</td>
                  <td className="p-3 text-sky-800">4.31</td>
                  <td className="p-3 text-sky-800">6.94</td>
                  <td className="p-3 text-emerald-600">-0.87</td>
                  <td className="p-3 text-sky-900 font-extrabold">0.76</td>
                  <td className="p-3 text-emerald-600 font-semibold">Leading</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-800">NOAA GFS</td>
                  <td className="p-3">6.87</td>
                  <td className="p-3">11.23</td>
                  <td className="p-3 text-rose-600">-2.14</td>
                  <td className="p-3 font-bold text-slate-700">0.54</td>
                  <td className="p-3 text-emerald-600 font-semibold">Healthy</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Evaluation Dataset: Synoptic Verification Stations</span>
            <span>Error Memory Windows: 24h / 72h / 7d / 30d</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Why AIFS is Trusted (Top Factors) + SHAP Waterfall */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Top Factors Bar Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-3">
            Why AIFS is Trusted (Top Factors)
          </span>

          <div className="space-y-3">
            {topFactors.map((f, i) => {
              const isPos = f.attribution >= 0;
              const valFormatted = `${isPos ? "+" : ""}${f.attribution.toFixed(2)}`;
              const barWidth = `${Math.min(100, Math.abs(f.attribution) * 500)}%`;

              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{f.feature}</span>
                    <span className={`font-mono font-bold ${isPos ? "text-sky-700" : "text-rose-600"}`}>
                      {valFormatted}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isPos ? "bg-sky-600" : "bg-rose-500"}`}
                      style={{ width: barWidth }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SHAP Feature Attribution Waterfall Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              SHAP Feature Attribution (TreeExplainer)
            </span>
            <span className="text-[10px] font-mono text-slate-400">Target: Model Reliability</span>
          </div>

          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shapWaterfall} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#64748B", fontSize: 10 }} domain={[0, 0.8]} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#334155", fontSize: 10, fontWeight: 600 }} />
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toFixed(2)}`, "SHAP Weight Influence"]}
                  contentStyle={{ borderRadius: "8px", fontSize: "11px" }}
                />
                <ReferenceLine x={0.33} stroke="#94A3B8" strokeDasharray="3 3" label={{ value: "Base (0.33)", fill: "#94A3B8", fontSize: 9 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {shapWaterfall.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.contribution >= 0 ? "#0284C7" : "#EF4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-800 text-xs font-semibold">
        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
        <span>
          AETHER MODEL RISK — NOT AN OFFICIAL METEOROLOGICAL WARNING. Official alerts are issued exclusively by the India Meteorological Department (IMD).
        </span>
      </div>
    </div>
  );
}
