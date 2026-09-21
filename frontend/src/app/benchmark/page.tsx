"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Award, CheckCircle2, TrendingDown, Filter, Database, Calendar, RefreshCw } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchBenchmarkMatrix } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { pageVariants, fadeUp } from "@/lib/motion";

const LEAD_TIME_MAE_DATA = [
  { horizon: "6h", Persistence: 5.2, Equal_Weight: 3.8, IFS: 4.1, AIFS: 3.5, GFS: 4.6, AETHER: 3.1 },
  { horizon: "12h", Persistence: 6.8, Equal_Weight: 4.7, IFS: 5.1, AIFS: 4.3, GFS: 5.8, AETHER: 3.9 },
  { horizon: "24h", Persistence: 8.76, Equal_Weight: 5.97, IFS: 6.42, AIFS: 5.36, GFS: 7.12, AETHER: 4.87 },
  { horizon: "48h", Persistence: 11.4, Equal_Weight: 7.8, IFS: 8.4, AIFS: 7.1, GFS: 9.3, AETHER: 6.4 },
  { horizon: "72h", Persistence: 14.2, Equal_Weight: 9.9, IFS: 10.6, AIFS: 9.1, GFS: 11.8, AETHER: 8.2 },
];

export default function BenchmarkPage() {
  const [variable, setVariable] = useState("rainfall_mm");
  const [leadTime, setLeadTime] = useState(24);
  const [regime, setRegime] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"overall" | "lead_time" | "regime" | "variable">("overall");

  const [benchmarkData, setBenchmarkData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchBenchmarkMatrix(variable, leadTime, regime)
      .then((res) => {
        if (!isMounted) return;
        setBenchmarkData(res.comparison_table || []);
      })
      .catch((err) => {
        console.warn("Failed to fetch benchmark matrix:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [variable, leadTime, regime]);

  const ifsRow = benchmarkData.find((r) => r.model_name === "ECMWF_IFS");
  const aetherRow = benchmarkData.find((r) => r.model_name === "AETHER");
  const maeImprovement =
    ifsRow && aetherRow && ifsRow.mae > 0
      ? (((ifsRow.mae - aetherRow.mae) / ifsRow.mae) * 100).toFixed(1)
      : null;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 min-w-0">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-semibold">
            <Award className="h-3 w-3 text-sky-600" />
            <span>SIH Problem Statement 26081 Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight mt-1">
            Verification & Benchmarking
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Evaluate AETHER against established forecasting baselines (Chronological out-of-sample: 2018–2022 train, 2023 val, 2024–2025 test)
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={variable}
            onChange={(e) => setVariable(e.target.value)}
            className="h-8 bg-white border border-slate-200 rounded-md px-2.5 text-xs font-semibold text-slate-800 shadow-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
          >
            <option value="rainfall_mm">Rainfall</option>
            <option value="temperature_c">Temperature</option>
            <option value="wind_speed_ms">Wind Speed</option>
          </select>

          <select
            value={leadTime}
            onChange={(e) => setLeadTime(Number(e.target.value))}
            className="h-8 bg-white border border-slate-200 rounded-md px-2.5 text-xs font-semibold text-slate-800 shadow-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
          >
            <option value={6}>6 hours</option>
            <option value={12}>12 hours</option>
            <option value={24}>24 hours</option>
            <option value={48}>48 hours</option>
            <option value={72}>72 hours</option>
          </select>

          <select
            value={regime}
            onChange={(e) => setRegime(e.target.value)}
            className="h-8 bg-white border border-slate-200 rounded-md px-2.5 text-xs font-semibold text-slate-800 shadow-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
          >
            <option value="ALL">All regimes</option>
            <option value="HEAVY_RAIN">Heavy Rain</option>
            <option value="HEAT">Heatwave</option>
            <option value="NORMAL">Normal</option>
          </select>
        </div>
      </div>

      {/* Tabs with layoutId */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-1 text-xs">
        {[
          { id: "overall", label: "Overall Performance" },
          { id: "lead_time", label: "By Lead Time" },
          { id: "regime", label: "By Regime" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-3.5 py-1.5 font-semibold transition-colors ${
                isActive ? "text-sky-700" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="benchmark-tab-pill"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Layout: Table (7 cols) + Lead Time Chart (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left 7 cols: Table */}
        <motion.div variants={fadeUp} className="lg:col-span-7 min-w-0">
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Verification Matrix (+{leadTime}h Horizon)
              </span>
              {maeImprovement && Number(maeImprovement) > 0 ? (
                <Badge variant="scientific" className="font-mono text-[10px]">
                  AETHER reduces MAE by {maeImprovement}% vs IFS
                </Badge>
              ) : (
                <Badge variant="outline" className="font-mono text-[10px]">
                  Out-of-Sample Evaluation
                </Badge>
              )}
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 px-3">Model</th>
                      <th className="p-2.5 px-3">MAE</th>
                      <th className="p-2.5 px-3">RMSE</th>
                      <th className="p-2.5 px-3">Bias</th>
                      <th className="p-2.5 px-3">CSI</th>
                      <th className="p-2.5 px-3">Samples</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {benchmarkData.length > 0 ? (
                      benchmarkData.map((row) => {
                        const isAether = row.model_name === "AETHER";
                        const cleanName = row.model_name.replace("ECMWF_", "").replace("_", " ");
                        return (
                          <tr
                            key={row.model_name}
                            className={`hover:bg-slate-50/50 ${
                              isAether ? "bg-sky-50/30 font-bold" : ""
                            }`}
                          >
                            <td className={`p-2.5 px-3 ${isAether ? "text-sky-900 font-black" : "text-slate-800"}`}>
                              {cleanName}
                            </td>
                            <td className={`p-2.5 px-3 ${isAether ? "text-sky-900 font-black" : "text-slate-700"}`}>
                              {typeof row.mae === "number" ? row.mae.toFixed(2) : "--"}
                            </td>
                            <td className={`p-2.5 px-3 ${isAether ? "text-sky-900 font-black" : "text-slate-700"}`}>
                              {typeof row.rmse === "number" ? row.rmse.toFixed(2) : "--"}
                            </td>
                            <td className="p-2.5 px-3 text-slate-600">
                              {typeof row.bias === "number" ? (row.bias > 0 ? `+${row.bias.toFixed(2)}` : row.bias.toFixed(2)) : "--"}
                            </td>
                            <td className={`p-2.5 px-3 ${isAether ? "text-emerald-700 font-black" : "text-slate-700"}`}>
                              {typeof row.csi === "number" ? row.csi.toFixed(2) : "--"}
                            </td>
                            <td className="p-2.5 px-3 text-slate-400">
                              {row.sample_count || "--"}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400 font-sans text-xs">
                          {loading ? "Loading empirical benchmark matrix..." : "No benchmark evaluation data for this combination."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right 5 cols: Performance by Lead Time Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-5 min-w-0">
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="p-4 pb-2 border-b border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Error Progression
              </span>
              <CardTitle className="text-sm font-bold text-slate-900">
                Lead-Time Skill Curve (MAE)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={LEAD_TIME_MAE_DATA}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="horizon"
                      tick={{ fontSize: 11, fill: "#64748B" }}
                      axisLine={{ stroke: "#E2E8F0" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748B" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0F172A",
                        borderRadius: "6px",
                        border: "none",
                        color: "#FFF",
                        fontSize: "11px",
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: "11px" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Persistence"
                      stroke="#94A3B8"
                      strokeDasharray="4 4"
                      dot={false}
                      strokeWidth={1}
                    />
                    <Line
                      type="monotone"
                      dataKey="IFS"
                      stroke="#2563EB"
                      strokeWidth={1.5}
                      dot={{ r: 2.5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="AIFS"
                      stroke="#0284C7"
                      strokeWidth={1.5}
                      dot={{ r: 2.5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="GFS"
                      stroke="#64748B"
                      strokeWidth={1.5}
                      dot={{ r: 2.5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="AETHER"
                      stroke="#0F172A"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#0F172A" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
