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
  const currentVal = data?.aether_forecast.calibrated_value ?? 42.3;
  const getUnit = () =>
    variable === "rainfall_mm" ? "mm" : variable === "temperature_c" ? "°C" : "m/s";

  const monthlyRange = climate?.historical_range || [
    { month: "Jan", normal: 14.2, min_range: 2.0, max_range: 35.0 },
    { month: "Feb", normal: 18.0, min_range: 4.0, max_range: 42.0 },
    { month: "Mar", normal: 15.9, min_range: 1.0, max_range: 38.0 },
    { month: "Apr", normal: 12.1, min_range: 0.5, max_range: 28.0 },
    { month: "May", normal: 22.5, min_range: 5.0, max_range: 65.0 },
    { month: "Jun", normal: 74.3, min_range: 25.0, max_range: 160.0 },
    { month: "Jul", normal: 210.6, min_range: 95.0, max_range: 380.0 },
    { month: "Aug", normal: 233.1, min_range: 110.0, max_range: 420.0 },
    { month: "Sep", normal: 120.4, min_range: 40.0, max_range: 260.0 },
    { month: "Oct", normal: 21.4, min_range: 0.0, max_range: 60.0 },
    { month: "Nov", normal: 5.2, min_range: 0.0, max_range: 20.0 },
    { month: "Dec", normal: 8.6, min_range: 0.0, max_range: 25.0 },
  ];

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
      <div className="border-b border-slate-200 pb-3">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-semibold">
          <Compass className="h-3 w-3 text-sky-600" />
          <span>Long-Term Climatological Benchmarking</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-950 tracking-tight mt-1">
          Climate Context
        </h1>
        <p className="text-xs text-slate-500">
          How unusual is the current forecast compared to historical climate? (ERA5 1991–2020)
        </p>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Current Forecast */}
        <motion.div variants={fadeUp}>
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="p-3.5 pb-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Current Rainfall (24h)
              </span>
              <div className="flex items-baseline gap-1 mt-0.5 font-mono">
                <span className="text-2xl font-black text-slate-950">
                  <NumberTicker value={currentVal} decimals={1} />
                </span>
                <span className="text-xs font-bold text-slate-500">{getUnit()}</span>
              </div>
            </CardHeader>
            <CardContent className="p-3.5 pt-0">
              <span className="text-[11px] text-slate-400 block">{selectedLocation.name}</span>
            </CardContent>
          </Card>
        </motion.div>

        {/* Climate Normal */}
        <motion.div variants={fadeUp}>
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="p-3.5 pb-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Climate Normal
              </span>
              <div className="flex items-baseline gap-1 mt-0.5 font-mono">
                <span className="text-2xl font-black text-slate-800">
                  <NumberTicker value={climate?.climate_normal ?? 21.4} decimals={1} />
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
        <motion.div variants={fadeUp}>
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="p-3.5 pb-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Anomaly
              </span>
              <div className="flex items-baseline gap-1 mt-0.5 font-mono">
                <span className="text-2xl font-black text-emerald-600">
                  +<NumberTicker value={climate?.anomaly ?? 20.9} decimals={1} /> {getUnit()}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-3.5 pt-0">
              <span className="text-[11px] font-bold text-emerald-600 block">
                +{climate?.anomaly_pct ?? 96}% Above Normal
              </span>
            </CardContent>
          </Card>
        </motion.div>

        {/* Historical Percentile */}
        <motion.div variants={fadeUp}>
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="p-3.5 pb-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Historical Percentile
              </span>
              <div className="flex items-baseline gap-1 mt-0.5 font-mono">
                <span className="text-2xl font-black text-indigo-700">
                  <NumberTicker value={climate?.percentile ?? 92} decimals={0} suffix="nd" />
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-3.5 pt-0">
              <span className="text-[11px] text-slate-400 block">Ranks in top 8% of history</span>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Section: Climatology Envelope Chart + Additional Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Climatology Envelope Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-8">
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  30-Year Climatology (Rainfall Profile)
                </CardTitle>
                <p className="text-[11px] text-slate-400">
                  Monthly normal envelope with current forecast marker (ERA5 1991–2020)
                </p>
              </div>
              <Badge variant="secondary" className="font-mono text-[10px]">
                Delhi NCR Grid
              </Badge>
            </CardHeader>

            <CardContent className="p-4">
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "#64748B" }}
                      axisLine={{ stroke: "#E2E8F0" }}
                      tickLine={false}
                    />
                    <YAxis
                      unit=" mm"
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
        <motion.div variants={fadeUp} className="lg:col-span-4 space-y-3">
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
                <span className="font-mono font-bold text-rose-600">+1.6°C</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <CloudRain className="h-4 w-4 text-sky-600" />
                  <span className="font-medium text-slate-700">Seasonal Anomaly:</span>
                </div>
                <span className="font-mono font-bold text-sky-700">+38%</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="font-medium text-slate-700">Extreme Frequency:</span>
                </div>
                <span className="font-mono font-bold text-amber-700">2.3× Baseline</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-slate-500" />
                  <span className="font-medium text-slate-700">Decadal Trend:</span>
                </div>
                <span className="font-mono font-bold text-slate-800">+0.4°C / decade</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
