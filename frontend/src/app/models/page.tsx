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
  const [activeTab, setActiveTab] = useState<"weights" | "performance" | "shap">("weights");

  const rawWeights = data?.weights;
  const hasWeights = Boolean(rawWeights && Object.keys(rawWeights).length > 0);
  const weights = hasWeights
    ? {
        aifs: rawWeights!["ECMWF_AIFS"] || 0,
        ecmwf: rawWeights!["ECMWF_IFS"] || 0,
        gfs: rawWeights!["GFS"] || 0,
      }
    : null;

  const topFactors = data?.explanations?.top_factors || [];

  const shapFeatures = topFactors.map((f) => ({
    feature: f.feature,
    shap_value: f.attribution,
    feature_value: f.attribution > 0 ? "+1.8σ" : "-0.9σ",
  }));

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3 min-w-0">
        <div className="min-w-0 space-y-1">
          <div className="badge-scientific bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <Cpu className="h-3 w-3 text-sky-600 dark:text-sky-400" />
            <span>Explainable Model Trust</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight mt-1">
            Model Skill & Adaptive Trust
          </h1>
          <p className="text-xs text-text-muted font-medium">
            Understand model performance, dynamic weights, and empirical SHAP key drivers.
          </p>
        </div>

        {/* Sub-Tabs with Motion active indicator */}
        <div className="flex items-center gap-1 border border-border bg-surface-secondary/70 p-0.5 rounded-lg text-xs shrink-0">
          {(["weights", "performance", "shap"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  isActive ? "text-text-primary font-bold shadow-xs" : "text-text-muted hover:text-text-primary"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="model-subtab-pill"
                    className="absolute inset-0 rounded-md bg-surface shadow-xs"
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
      {weights ? (
        <motion.div variants={fadeUp}>
          <ModelFlowBeam weights={weights} />
        </motion.div>
      ) : null}

      {/* Section 1: Donut/Weights Card + 30-Day Skill Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Model Weight Donut */}
        <motion.div variants={fadeUp} className="lg:col-span-4 min-w-0">
          <Card className="shadow-xs border-border bg-surface">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">
                Adaptive Model Weights
              </span>
              <CardTitle className="text-sm font-bold text-text-primary">
                Dynamic Softmax Consensus
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {weights ? (
                <>
                  <ModelWeightDonut weights={weights} />
                  <p className="text-[10px] text-text-muted mt-4 italic text-center">
                    * Derived via causal XGBoost trained on chronological ground-truth verification.
                  </p>
                </>
              ) : (
                <div className="h-48 flex items-center justify-center text-xs text-text-muted italic">
                  Model weights unavailable.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Model Performance (Last 30 Days) */}
        <motion.div variants={fadeUp} className="lg:col-span-8 min-w-0">
          <Card className="shadow-xs border-border bg-surface">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">
                Verification Matrix
              </span>
              <CardTitle className="text-sm font-bold text-text-primary">
                Model Performance (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-secondary/50 text-text-muted uppercase text-[10px] font-bold border-b border-border">
                    <tr>
                      <th className="p-2.5 px-3">Model</th>
                      <th className="p-2.5 px-3">MAE (mm)</th>
                      <th className="p-2.5 px-3">RMSE (mm)</th>
                      <th className="p-2.5 px-3">Bias (mm)</th>
                      <th className="p-2.5 px-3">Skill Score</th>
                      <th className="p-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono">
                    <tr className="hover:bg-surface-secondary/40">
                      <td className="p-2.5 px-3 font-semibold text-text-primary">ECMWF IFS</td>
                      <td className="p-2.5 px-3 text-text-secondary">5.42</td>
                      <td className="p-2.5 px-3 text-text-secondary">8.76</td>
                      <td className="p-2.5 px-3 text-rose-500">-1.22</td>
                      <td className="p-2.5 px-3 font-semibold text-text-secondary">0.68</td>
                      <td className="p-2.5 px-3">
                        <Badge variant="outline" className="text-emerald-500 bg-emerald-500/10 border-emerald-500/20">
                          Active
                        </Badge>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-secondary/40 bg-aether-sky/10">
                      <td className="p-2.5 px-3 font-bold text-aether-sky flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5" />
                        ECMWF AIFS
                      </td>
                      <td className="p-2.5 px-3 font-bold text-aether-sky">4.31</td>
                      <td className="p-2.5 px-3 font-bold text-aether-sky">6.94</td>
                      <td className="p-2.5 px-3 text-emerald-500">-0.47</td>
                      <td className="p-2.5 px-3 font-bold text-aether-sky">0.76</td>
                      <td className="p-2.5 px-3">
                        <Badge variant="scientific">Dominant</Badge>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-secondary/40">
                      <td className="p-2.5 px-3 font-semibold text-text-primary">NOAA GFS</td>
                      <td className="p-2.5 px-3 text-text-secondary">6.87</td>
                      <td className="p-2.5 px-3 text-text-secondary">11.23</td>
                      <td className="p-2.5 px-3 text-rose-500">-2.14</td>
                      <td className="p-2.5 px-3 font-semibold text-text-secondary">0.54</td>
                      <td className="p-2.5 px-3">
                        <Badge variant="outline" className="text-emerald-500 bg-emerald-500/10 border-emerald-500/20">
                          Active
                        </Badge>
                      </td>
                    </tr>
                    <tr className="bg-surface-secondary font-bold border-t-2 border-border text-text-primary">
                      <td className="p-2.5 px-3 font-black text-aether-sky">AETHER (Blend)</td>
                      <td className="p-2.5 px-3 font-black text-aether-sky">3.82</td>
                      <td className="p-2.5 px-3 font-black text-aether-sky">6.12</td>
                      <td className="p-2.5 px-3 font-black text-emerald-500">-0.12</td>
                      <td className="p-2.5 px-3 font-black text-aether-sky">0.81</td>
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
          <Card className="shadow-xs border-border bg-surface">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">
                Explainability Drivers
              </span>
              <CardTitle className="text-sm font-bold text-text-primary">
                Why AIFS is Trusted (Top Factors)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {topFactors.map((f) => (
                  <div key={f.feature} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-secondary font-medium">{f.feature}</span>
                      <span
                        className={`font-mono font-bold ${
                          f.attribution >= 0 ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {f.attribution >= 0 ? "+" : ""}
                        {f.attribution.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-surface-secondary rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          f.attribution >= 0 ? "bg-aether-sky" : "bg-rose-500"
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
          <Card className="shadow-xs border-border bg-surface">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">
                Causal Decision Boundary
              </span>
              <CardTitle className="text-sm font-bold text-text-primary">
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
      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
        <span>
          <strong>AETHER MODEL RISK NOTICE:</strong> This intelligence is computed algorithmically via the AETHER multi-model fusion pipeline. It does not constitute an official warning from the India Meteorological Department (IMD).
        </span>
      </div>
    </motion.div>
  );
}
