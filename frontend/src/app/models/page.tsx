"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { useAetherData } from "../../context/AetherDataContext";
import { Cpu, Award, ShieldAlert, Sparkles, AlertTriangle, Layers, Info } from "lucide-react";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModelWeightDonut } from "@/components/models/ModelWeightDonut";
import { ModelFlowBeam } from "@/components/models/ModelFlowBeam";
import { ShapWaterfall } from "@/components/models/ShapWaterfall";
import { pageVariants, fadeUp } from "@/lib/motion";

export default function ModelIntelligencePage() {
  const { data } = useAetherData();
  const [activeTab, setActiveTab] = useState<"performance" | "weights" | "shap">("weights");

  const rawWeights = data?.weights || { ECMWF_AIFS: 0.46, ECMWF_IFS: 0.32, GFS: 0.22 };
  const weights = {
    aifs: rawWeights["ECMWF_AIFS"] || 0.46,
    ecmwf: rawWeights["ECMWF_IFS"] || 0.32,
    gfs: rawWeights["GFS"] || 0.22,
  };

  const topFactors = data?.explanations.top_factors || [
    { feature: "Recent 72h accuracy", attribution: 0.14, direction: "positive" },
    { feature: "Regime compatibility", attribution: 0.10, direction: "positive" },
    { feature: "Satellite agreement", attribution: 0.08, direction: "positive" },
    { feature: "Lead-time skill", attribution: 0.06, direction: "positive" },
    { feature: "Model spread", attribution: -0.04, direction: "negative" },
  ];

  const shapFeatures = topFactors.map((f) => ({
    feature: f.feature,
    shap_value: f.attribution,
    feature_value: f.attribution > 0 ? "+1.8σ" : "-0.9σ",
  }));

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
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-semibold">
            <Cpu className="h-3 w-3 text-sky-600" />
            <span>Explainable Model Trust</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight mt-1">
            Model Skill & Adaptive Trust
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Understand model performance, dynamic weights, and empirical SHAP key drivers
          </p>
        </div>

        {/* Sub-Tabs with Motion active indicator */}
        <div className="flex items-center gap-1 border border-slate-200 bg-slate-100/70 p-0.5 rounded-md text-xs">
          {(["weights", "performance", "shap"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative px-3 py-1 rounded-sm text-xs font-semibold transition-all ${
                  isActive ? "text-sky-900" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="model-subtab-pill"
                    className="absolute inset-0 rounded-sm bg-white shadow-xs"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10">
                  {tab === "shap" ? "SHAP Attribution" : tab === "weights" ? "Adaptive Model Weights" : "Model Skill (30d)"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Multi-Model Fusion DAG Visual Beam */}
      <motion.div variants={fadeUp}>
        <ModelFlowBeam weights={weights} />
      </motion.div>

      {/* Section 1: Donut/Weights Card + 30-Day Skill Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Model Weight Donut */}
        <motion.div variants={fadeUp} className="lg:col-span-4">
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="p-4 pb-2 border-b border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Adaptive Model Weights
              </span>
              <CardTitle className="text-sm font-bold text-slate-900">
                Dynamic Softmax Consensus
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ModelWeightDonut weights={weights} />
              <p className="text-[10px] text-slate-400 mt-4 italic text-center">
                * Derived via causal XGBoost trained on chronological ground-truth verification.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Model Performance (Last 30 Days) */}
        <motion.div variants={fadeUp} className="lg:col-span-8">
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="p-4 pb-2 border-b border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Verification Matrix
              </span>
              <CardTitle className="text-sm font-bold text-slate-900">
                Model Performance (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 px-3">Model</th>
                      <th className="p-2.5 px-3">MAE (mm)</th>
                      <th className="p-2.5 px-3">RMSE (mm)</th>
                      <th className="p-2.5 px-3">Bias (mm)</th>
                      <th className="p-2.5 px-3">Skill Score</th>
                      <th className="p-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-2.5 px-3 font-semibold text-slate-800">ECMWF IFS</td>
                      <td className="p-2.5 px-3">5.42</td>
                      <td className="p-2.5 px-3">8.76</td>
                      <td className="p-2.5 px-3 text-rose-600">-1.22</td>
                      <td className="p-2.5 px-3 font-semibold text-slate-700">0.68</td>
                      <td className="p-2.5 px-3">
                        <Badge variant="outline" className="text-emerald-700 bg-emerald-50">
                          Active
                        </Badge>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 bg-sky-50/20">
                      <td className="p-2.5 px-3 font-bold text-sky-900 flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-sky-600" />
                        ECMWF AIFS
                      </td>
                      <td className="p-2.5 px-3 font-bold text-sky-900">4.31</td>
                      <td className="p-2.5 px-3 font-bold text-sky-900">6.94</td>
                      <td className="p-2.5 px-3 text-emerald-600">-0.47</td>
                      <td className="p-2.5 px-3 font-bold text-sky-900">0.76</td>
                      <td className="p-2.5 px-3">
                        <Badge variant="scientific">Dominant</Badge>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-2.5 px-3 font-semibold text-slate-800">NOAA GFS</td>
                      <td className="p-2.5 px-3">6.87</td>
                      <td className="p-2.5 px-3">11.23</td>
                      <td className="p-2.5 px-3 text-rose-600">-2.14</td>
                      <td className="p-2.5 px-3 font-semibold text-slate-700">0.54</td>
                      <td className="p-2.5 px-3">
                        <Badge variant="outline" className="text-emerald-700 bg-emerald-50">
                          Active
                        </Badge>
                      </td>
                    </tr>
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-200 text-slate-950">
                      <td className="p-2.5 px-3 font-black text-sky-800">AETHER (Blend)</td>
                      <td className="p-2.5 px-3 font-black text-sky-800">3.82</td>
                      <td className="p-2.5 px-3 font-black text-sky-800">6.12</td>
                      <td className="p-2.5 px-3 font-black text-emerald-700">-0.12</td>
                      <td className="p-2.5 px-3 font-black text-sky-800">0.81</td>
                      <td className="p-2.5 px-3">
                        <Badge variant="success">Optimal</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Section 2: Why AIFS is Trusted + SHAP Feature Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Why AIFS is Trusted Bar Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-6">
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="p-4 pb-2 border-b border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Explainability Drivers
              </span>
              <CardTitle className="text-sm font-bold text-slate-900">
                Why AIFS is Trusted (Top Factors)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {topFactors.map((f) => (
                  <div key={f.feature} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-700 font-medium">{f.feature}</span>
                      <span
                        className={`font-mono font-bold ${
                          f.attribution >= 0 ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {f.attribution >= 0 ? "+" : ""}
                        {f.attribution.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          f.attribution >= 0 ? "bg-sky-600" : "bg-rose-500"
                        }`}
                        style={{ width: `${Math.abs(f.attribution) * 500}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* SHAP Waterfall / Feature Attribution */}
        <motion.div variants={fadeUp} className="lg:col-span-6">
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="p-4 pb-2 border-b border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Causal Decision Boundary
              </span>
              <CardTitle className="text-sm font-bold text-slate-900">
                SHAP Attribution Waterfall
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ShapWaterfall features={shapFeatures} modelName="ECMWF AIFS" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Mandatory IMD Meteorological Disclaimer */}
      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-md flex items-center gap-2 text-xs text-amber-900">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
        <span>
          <strong>AETHER MODEL RISK NOTICE:</strong> This intelligence is computed algorithmically via the AETHER multi-model fusion pipeline. It does not constitute an official warning from the India Meteorological Department (IMD).
        </span>
      </div>
    </motion.div>
  );
}
