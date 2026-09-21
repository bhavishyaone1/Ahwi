"use client";

import React from "react";
import { motion } from "motion/react";
import { useAetherData } from "../../context/AetherDataContext";
import { Compass, TrendingUp, AlertCircle, Sparkles, Thermometer, CloudRain } from "lucide-react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NumberTicker } from "@/components/common/NumberTicker";
import { pageVariants, fadeUp } from "@/lib/motion";

export default function ClimatePage() {
  const { data, selectedLocation, variable } = useAetherData();
  const climate = data?.climate_context;
  const currentVal = data?.aether_forecast?.calibrated_value;
  const getUnit = () =>
    variable === "rainfall_mm" ? "mm" : variable === "temperature_c" ? "°C" : "m/s";

  const monthlyRange = climate?.historical_range || [];

  const chartData = monthlyRange.map((m) => ({
    month: m.month,
    normal: m.normal,
    min: m.min_range,
    max: m.max_range,
    current: m.month === "Oct" ? currentVal : null,
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
      <div className="border-b border-slate-200 pb-3 min-w-0">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-semibold">
          <Compass className="h-3 w-3 text-sky-600" />
          <span>Long-Term Climatological Benchmarking</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight mt-1">
          Climate Context
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Measure how unusual the current forecast is against historical climate (ERA5 1991–2020 baseline)
        </p>
      </div>

      {climate ? (
        <>
          {/* Top 4 Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Current Forecast */}
            <motion.div variants={fadeUp} className="min-w-0">
              <Card className="shadow-xs border-slate-200">
                <CardHeader className="p-3.5 pb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Current Forecast (24h)
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5 font-mono">
                    <span className="text-2xl font-black text-slate-950">
                      {currentVal !== undefined ? (
                        <NumberTicker value={currentVal} decimals={1} />
                      ) : (
                        "--"
                      )}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{getUnit()}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-3.5 pt-0">
                  <span className="text-[11px] text-slate-400 block truncate">{selectedLocation.name}</span>
                </CardContent>
              </Card>
            </motion.div>

            {/* Climate Normal */}
            <motion.div variants={fadeUp} className="min-w-0">
              <Card className="shadow-xs border-slate-200">
                <CardHeader className="p-3.5 pb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Climate Normal
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5 font-mono">
                    <span className="text-2xl font-black text-slate-800">
                      <NumberTicker value={climate.climate_normal} decimals={1} />
                    </span>
                    <span className="text-xs font-bold text-slate-500">{getUnit()}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-3.5 pt-0">
                  <span className="text-[11px] text-slate-400 block">30-Year Seasonal Baseline</span>
                </CardContent>
              </Card>
            </motion.div>

            {/* Anomaly */}
            <motion.div variants={fadeUp} className="min-w-0">
              <Card className="shadow-xs border-slate-200">
                <CardHeader className="p-3.5 pb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Anomaly
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5 font-mono">
                    <span className={`text-2xl font-black ${climate.anomaly >= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                      {climate.anomaly >= 0 ? "+" : ""}
                      <NumberTicker value={climate.anomaly} decimals={1} /> {getUnit()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-3.5 pt-0">
                  <span className={`text-[11px] font-bold block ${climate.anomaly >= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                    {climate.anomaly_pct >= 0 ? "+" : ""}{climate.anomaly_pct}% vs Normal
                  </span>
                </CardContent>
              </Card>
            </motion.div>

            {/* Historical Percentile */}
            <motion.div variants={fadeUp} className="min-w-0">
              <Card className="shadow-xs border-slate-200">
                <CardHeader className="p-3.5 pb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Historical Percentile
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5 font-mono">
                    <span className="text-2xl font-black text-indigo-700">
                      <NumberTicker value={climate.percentile} decimals={0} suffix="th" />
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-3.5 pt-0">
                  <span className="text-[11px] text-slate-400 block">
                    {climate.percentile >= 90 ? "Rare synoptic extreme" : "Within normal envelope"}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content: Chart (8 cols) + Diagnostic Indicators (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* 30-Year Climatology Chart */}
            <motion.div variants={fadeUp} className="lg:col-span-8 min-w-0">
              <Card className="shadow-xs border-slate-200">
                <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-900">
                      30-Year Climatological Baseline (1991–2020 ERA5)
                    </CardTitle>
                    <p className="text-[11px] text-slate-400">
                      Normal cycle with min/max envelope and current forecast benchmark
                    </p>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    ERA5 Reanalysis
                  </Badge>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={chartData}
                        margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11, fill: "#64748B" }}
                          axisLine={{ stroke: "#E2E8F0" }}
                          tickLine={false}
                        />
                        <YAxis
                          unit={` ${getUnit()}`}
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
                            padding: "8px 12px",
                          }}
                        />
                        <Legend
                          verticalAlign="top"
                          height={36}
                          iconType="circle"
                          wrapperStyle={{ fontSize: "11px" }}
                        />

                        {/* Historical Range Envelope */}
                        <Area
                          type="monotone"
                          dataKey="max"
                          stroke="none"
                          fill="#E2E8F0"
                          fillOpacity={0.6}
                          name="Historical Range"
                        />

                        {/* Climate Normal Line */}
                        <Line
                          type="monotone"
                          dataKey="normal"
                          stroke="#0284C7"
                          strokeWidth={2}
                          dot={{ r: 3, fill: "#0284C7" }}
                          name="Climate Normal"
                        />

                        {/* Current Forecast Marker */}
                        <Line
                          type="monotone"
                          dataKey="current"
                          stroke="#DC2626"
                          strokeWidth={0}
                          dot={{ r: 6, fill: "#DC2626", stroke: "#FFFFFF", strokeWidth: 2 }}
                          name="Current Forecast"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Additional Climate Indicators */}
            <motion.div variants={fadeUp} className="lg:col-span-4 min-w-0 space-y-3">
              <Card className="shadow-xs border-slate-200">
                <CardHeader className="p-4 pb-2 border-b border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Synoptic Diagnosis
                  </span>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Additional Climate Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-rose-500" />
                      <span className="font-medium text-slate-700">Temperature Anomaly:</span>
                    </div>
                    <span className="font-mono font-bold text-rose-600">
                      +{climate.temp_anomaly_c}°C
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <CloudRain className="h-4 w-4 text-sky-600" />
                      <span className="font-medium text-slate-700">Seasonal Anomaly:</span>
                    </div>
                    <span className="font-mono font-bold text-sky-700">
                      +{climate.seasonal_anomaly_pct}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="font-medium text-slate-700">Extreme Frequency:</span>
                    </div>
                    <span className="font-mono font-bold text-amber-700">
                      {climate.extreme_multiplier}× Baseline
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-slate-500" />
                      <span className="font-medium text-slate-700">Decadal Trend:</span>
                    </div>
                    <span className="font-mono font-bold text-slate-800">
                      +{climate.trend_c_per_decade}°C / decade
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      ) : (
        <Card className="p-8 text-center text-slate-400 border-dashed">
          <p className="text-sm">Climate baseline data unavailable for the current selection.</p>
          <p className="text-xs text-slate-500 mt-1">
            Reconnecting to ERA5 30-year climatology baseline service...
          </p>
        </Card>
      )}
    </motion.div>
  );
}
