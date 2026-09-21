"use client";

import React, { useEffect, useState } from "react";
import { fetchBenchmarkMatrix } from "../../lib/api";
import { BenchmarkMatrix, BenchmarkMetric } from "../../lib/types";
import { Award, CheckCircle2, ShieldCheck, Filter, ArrowUpDown } from "lucide-react";

export default function BenchmarkPage() {
  const [variable, setVariable] = useState<string>("rainfall_mm");
  const [horizon, setHorizon] = useState<number>(24);
  const [regime, setRegime] = useState<string>("ALL");
  const [matrix, setMatrix] = useState<BenchmarkMatrix | null>(null);

  useEffect(() => {
    fetchBenchmarkMatrix(variable, horizon, regime)
      .then(setMatrix)
      .catch((err) => console.error(err));
  }, [variable, horizon, regime]);

  const getUnit = () =>
    variable === "rainfall_mm" ? "mm" : variable === "temperature_c" ? "°C" : "m/s";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold mb-1">
            <Award className="w-3.5 h-3.5 text-sky-600" />
            <span>Chronological Out-of-Sample Verification</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Benchmark & Model Performance Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Test Period: {matrix?.test_period || "2024–2025 Held-Out Verification Split"}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          {/* Variable Switcher */}
          <select
            value={variable}
            onChange={(e) => setVariable(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 shadow-xs focus:outline-none"
          >
            <option value="rainfall_mm">Rainfall (mm)</option>
            <option value="temperature_c">Temperature (°C)</option>
            <option value="wind_speed_ms">Wind Speed (m/s)</option>
          </select>

          {/* Horizon Switcher */}
          <select
            value={horizon}
            onChange={(e) => setHorizon(Number(e.target.value))}
            className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 shadow-xs focus:outline-none"
          >
            {[6, 12, 24, 48, 72].map((h) => (
              <option key={h} value={h}>
                {h}h Horizon
              </option>
            ))}
          </select>

          {/* Regime Switcher */}
          <select
            value={regime}
            onChange={(e) => setRegime(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 shadow-xs focus:outline-none"
          >
            <option value="ALL">All Regimes</option>
            <option value="NORMAL">Normal</option>
            <option value="HEAVY_RAIN">Heavy Rain</option>
            <option value="HEAT">Heat</option>
            <option value="HIGH_WIND">High Wind</option>
          </select>
        </div>
      </div>

      {/* Comparison Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Out-of-Sample Performance Comparison
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Zero future-data leakage enforced
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold text-slate-600">
              <tr>
                <th className="py-3 px-4">Forecasting Model / System</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 font-mono">MAE ({getUnit()})</th>
                <th className="py-3 px-4 font-mono">RMSE ({getUnit()})</th>
                <th className="py-3 px-4 font-mono">Bias ({getUnit()})</th>
                <th className="py-3 px-4 font-mono">CSI (Threat Score)</th>
                <th className="py-3 px-4">Evaluation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {(matrix?.comparison_table || []).map((m: BenchmarkMetric) => {
                const isAether = m.model_name === "AETHER";
                const isStatic = m.model_name === "Static_Blend";
                const isEqual = m.model_name === "Equal_Weight";

                return (
                  <tr
                    key={m.model_name}
                    className={`hover:bg-slate-50/80 transition ${
                      isAether ? "bg-sky-50/50 font-bold" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 font-sans font-semibold text-slate-900 flex items-center space-x-2">
                      {isAether && <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />}
                      <span>{m.model_name.replace("ECMWF_", "")}</span>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-500">
                      {isAether
                        ? "Adaptive Meta-Model"
                        : isEqual
                        ? "Simple Average"
                        : isStatic
                        ? "Fixed Linear Blend"
                        : "Raw Individual NWP/AI"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800">{m.mae}</td>
                    <td className="py-3.5 px-4 text-slate-800">{m.rmse}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {m.bias > 0 ? `+${m.bias}` : m.bias}
                    </td>
                    <td className="py-3.5 px-4 text-slate-900 font-semibold">
                      {m.csi !== undefined && m.csi !== null ? m.csi : "--"}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Verified
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology Explanatory Card */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2 leading-relaxed">
        <h4 className="font-bold text-slate-900">
          Empirical Validation Methodology
        </h4>
        <p>
          In accordance with scientific benchmarking standards for SIH PS 26081, models are evaluated strictly in chronological succession:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px] pt-1">
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="font-bold text-slate-700 block font-sans">2018–2022: Training</span>
            <span>Historical model error profiles & regime calibration</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="font-bold text-slate-700 block font-sans">2023: Validation</span>
            <span>Hyperparameter tuning & confidence calibration curves</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="font-bold text-slate-700 block font-sans">2024–2025: Test Split</span>
            <span>Held-out verification without lookahead leakage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
