"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Award, CheckCircle2, TrendingDown, Filter, Database, Calendar } from "lucide-react";
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

const BENCHMARK_TABLE = [
  { model: "Persistence", mae: 8.76, rmse: 13.21, bias: -2.34, csi: 0.41, brier: 0.212 },
  { model: "IFS", mae: 6.42, rmse: 10.67, bias: -1.76, csi: 0.58, brier: 0.162 },
  { model: "AIFS", mae: 5.36, rmse: 8.91, bias: -1.21, csi: 0.66, brier: 0.141 },
  { model: "GFS", mae: 7.12, rmse: 11.56, bias: -1.93, csi: 0.52, brier: 0.181 },
  { model: "Equal Weight", mae: 5.97, rmse: 9.77, bias: -1.48, csi: 0.61, brier: 0.158 },
  { model: "Static Blend", mae: 5.42, rmse: 8.96, bias: -1.32, csi: 0.65, brier: 0.139 },
  { model: "AETHER", mae: 4.87, rmse: 7.94, bias: -1.08, csi: 0.72, brier: 0.086 },
];

export default function BenchmarkPage() {
  const [variable, setVariable] = useState("Rainfall");
  const [leadTime, setLeadTime] = useState("24 hours");
  const [region, setRegion] = useState("All India");
  const [regime, setRegime] = useState("All regimes");
  const [activeTab, setActiveTab] = useState<"overall" | "lead_time" | "regime" | "variable">("overall");

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
            <Award className="h-3 w-3 text-sky-600" />
            <span>SIH Problem Statement 26081 Verification</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight mt-1">
            Benchmark & Evaluation
          </h1>
          <p className="text-xs text-slate-500">
            Chronological out-of-sample verification (2018–2022 train, 2023 val, 2024–2025 test)
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={variable}
            onChange={(e) => setVariable(e.target.value)}
            className="h-8 bg-white border border-slate-200 rounded-md px-2.5 text-xs font-semibold text-slate-800 shadow-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
          >
            <option value="Rainfall">Rainfall</option>
            <option value="Temperature">Temperature</option>
            <option value="Wind Speed">Wind Speed</option>
          </select>

          <select
            value={leadTime}
            onChange={(e) => setLeadTime(e.target.value)}
            className="h-8 bg-white border border-slate-200 rounded-md px-2.5 text-xs font-semibold text-slate-800 shadow-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
          >
            <option value="6 hours">6 hours</option>
            <option value="12 hours">12 hours</option>
            <option value="24 hours">24 hours</option>
            <option value="48 hours">48 hours</option>
            <option value="72 hours">72 hours</option>
          </select>

          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="h-8 bg-white border border-slate-200 rounded-md px-2.5 text-xs font-semibold text-slate-800 shadow-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
          >
            <option value="All India">All India</option>
            <option value="North India">North India</option>
            <option value="Monsoon Core">Monsoon Core</option>
            <option value="Coastal Zones">Coastal Zones</option>
          </select>

          <select
            value={regime}
            onChange={(e) => setRegime(e.target.value)}
            className="h-8 bg-white border border-slate-200 rounded-md px-2.5 text-xs font-semibold text-slate-800 shadow-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
          >
            <option value="All regimes">All regimes</option>
            <option value="Heavy Rain">Heavy Rain</option>
            <option value="Heatwave">Heatwave</option>
            <option value="Normal">Normal</option>
          </select>
        </div>
      </div>

      {/* Tabs with layoutId */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-1 text-xs">
        {[
          { id: "overall", label: "Overall Performance" },
          { id: "lead_time", label: "By Lead Time" },
          { id: "regime", label: "By Regime" },
          { id: "variable", label: "By Variable" },
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
        <motion.div variants={fadeUp} className="lg:col-span-7">
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Verification Matrix ({leadTime})
              </span>
              <Badge variant="scientific" className="font-mono text-[10px]">
                AETHER improves MAE by 18.2% vs IFS
              </Badge>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 px-3">Model</th>
                      <th className="p-2.5 px-3">MAE (mm)</th>
                      <th className="p-2.5 px-3">RMSE (mm)</th>
                      <th className="p-2.5 px-3">Bias (mm)</th>
                      <th className="p-2.5 px-3">CSI</th>
                      <th className="p-2.5 px-3">Brier Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {BENCHMARK_TABLE.map((row) => {
                      const isAether = row.model === "AETHER";
                      return (
                        <tr
                          key={row.model}
                          className={`hover:bg-slate-50/50 ${
                            isAether ? "bg-sky-50/30 font-bold" : ""
                          }`}
                        >
                          <td className={`p-2.5 px-3 ${isAether ? "text-sky-900 font-black" : "text-slate-800"}`}>
                            {row.model}
                          </td>
                          <td className={`p-2.5 px-3 ${isAether ? "text-sky-900 font-black" : "text-slate-700"}`}>
                            {row.mae.toFixed(2)}
                          </td>
                          <td className={`p-2.5 px-3 ${isAether ? "text-sky-900 font-black" : "text-slate-700"}`}>
                            {row.rmse.toFixed(2)}
                          </td>
                          <td className="p-2.5 px-3 text-slate-600">
                            {row.bias > 0 ? `+${row.bias.toFixed(2)}` : row.bias.toFixed(2)}
                          </td>
                          <td className={`p-2.5 px-3 ${isAether ? "text-emerald-700 font-black" : "text-slate-700"}`}>
                            {row.csi.toFixed(2)}
                          </td>
                          <td className={`p-2.5 px-3 ${isAether ? "text-emerald-700 font-black" : "text-slate-500"}`}>
                            {row.brier.toFixed(3)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right 5 cols: Performance by Lead Time Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-5">
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="p-4 pb-2 border-b border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Error Progression
              </span>
              <CardTitle className="text-sm font-bold text-slate-900">
                Performance by Lead Time (MAE)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={LEAD_TIME_MAE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Line
                      type="monotone"
                      dataKey="Persistence"
                      stroke="#CBD5E1"
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="IFS"
                      stroke="#2563EB"
                      strokeWidth={1.5}
                      dot={{ r: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="AIFS"
                      stroke="#0284C7"
                      strokeWidth={1.5}
                      dot={{ r: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="AETHER"
                      stroke="#0F172A"
                      strokeWidth={2.5}
                      dot={{ r: 3.5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Dataset Verification Card matching mockup */}
      <motion.div variants={fadeUp}>
        <Card className="shadow-xs border-slate-200 bg-slate-50/60">
          <CardContent className="p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-sky-600" />
              <span className="text-slate-600">
                Test Set Period: <strong className="text-slate-900">2024–2025 (Chronological)</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-sky-600" />
              <span className="text-slate-600">
                Total Verification Samples: <strong className="text-slate-900">12,480</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
              <span>Grid: 0.25° (~27 km)</span>
              <span>&bull;</span>
              <span>Truth: IMD Automatic Weather Stations + GPM</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
