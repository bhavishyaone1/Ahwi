"use client";

import React from "react";
import { motion } from "motion/react";
import { useAetherData } from "../../context/AetherDataContext";
import { useTheme } from "@/context/ThemeContext";
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
  const { theme } = useTheme();
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
      <div className="border-b border-border pb-3 min-w-0 space-y-1">
        <div className="badge-scientific text-overline bg-info/10 text-info border border-info/30">
          <Compass className="h-3 w-3 text-info shrink-0" />
          <span>Long-Term Climatological Benchmarking</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight mt-1">
          Climate Context
        </h1>
        <p className="text-xs text-text-muted font-medium">
          Measure how unusual the current forecast is against historical climate (ERA5 1991–2020 baseline).
        </p>
      </div>

      {climate ? (
        <>
          {/* Top 4 Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Current Forecast */}
            <motion.div variants={fadeUp} className="min-w-0">
              <Card className="shadow-sm hover:shadow-md card-interactive border-border bg-surface rounded-2xl">
                <CardHeader className="p-4 pb-1">
                  <span className="text-overline text-text-muted block font-semibold">
                    Current Forecast (24h)
                  </span>
                  <div className="flex items-baseline gap-1 mt-1 font-mono tabular-nums">
                    <span className="text-4xl font-black text-text-primary tracking-tight">
                      {currentVal !== undefined ? (
                        <NumberTicker value={currentVal} decimals={1} />
                      ) : (
                        "--"
                      )}
                    </span>
                    <span className="text-xs font-bold font-mono text-text-muted ml-1">{getUnit()}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <span className="text-[11px] text-text-muted block truncate">{selectedLocation.name}</span>
                </CardContent>
              </Card>
            </motion.div>

            {/* Climate Normal */}
            <motion.div variants={fadeUp} className="min-w-0">
              <Card className="shadow-sm hover:shadow-md card-interactive border-border bg-surface rounded-2xl">
                <CardHeader className="p-4 pb-1">
                  <span className="text-overline text-text-muted block font-semibold">
                    Climate Normal
                  </span>
                  <div className="flex items-baseline gap-1 mt-1 font-mono tabular-nums">
                    <span className="text-4xl font-black text-text-primary tracking-tight">
                      <NumberTicker value={climate.climate_normal} decimals={1} />
                    </span>
                    <span className="text-xs font-bold font-mono text-text-muted ml-1">{getUnit()}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <span className="text-[11px] text-text-muted block font-mono">30-Year Seasonal Baseline</span>
                </CardContent>
              </Card>
            </motion.div>

            {/* Anomaly */}
            <motion.div variants={fadeUp} className="min-w-0">
              <Card className="shadow-sm hover:shadow-md card-interactive border-border bg-surface rounded-2xl">
                <CardHeader className="p-4 pb-1">
                  <span className="text-overline text-text-muted block font-semibold">
                    Anomaly
                  </span>
                  <div className="flex items-baseline gap-1 mt-1 font-mono tabular-nums">
                    <span className={`text-4xl font-black tracking-tight ${climate.anomaly >= 0 ? "text-success" : "text-warning"}`}>
                      {climate.anomaly >= 0 ? "+" : ""}
                      <NumberTicker value={climate.anomaly} decimals={1} />
                    </span>
                    <span className="text-xs font-bold font-mono text-text-muted ml-1">{getUnit()}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <span className={`text-[11px] font-bold block ${climate.anomaly >= 0 ? "text-success" : "text-warning"}`}>
                    {climate.anomaly_pct >= 0 ? "+" : ""}{climate.anomaly_pct}% vs Normal
                  </span>
                </CardContent>
              </Card>
            </motion.div>

            {/* Historical Percentile */}
            <motion.div variants={fadeUp} className="min-w-0">
              <Card className="shadow-sm hover:shadow-md card-interactive border-border bg-surface rounded-2xl">
                <CardHeader className="p-4 pb-1">
                  <span className="text-overline text-text-muted block font-semibold">
                    Historical Percentile
                  </span>
                  <div className="flex items-baseline gap-1 mt-1 font-mono tabular-nums">
                    <span className="text-4xl font-black text-accent tracking-tight">
                      <NumberTicker value={climate.percentile} decimals={0} suffix="th" />
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <span className="text-[11px] text-text-muted block">
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
              <Card className="shadow-sm hover:shadow-md card-interactive border-border bg-surface rounded-2xl">
                <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-sm font-bold text-text-primary">
                      30-Year Climatological Baseline (1991–2020 ERA5)
                    </CardTitle>
                    <p className="text-[11px] text-text-muted">
                      Normal cycle with min/max envelope and current forecast benchmark
                    </p>
                  </div>
                  <Badge variant="scientific" className="font-mono tabular-nums text-[10px]">
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
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#26313D" : "#E2E8F0"} vertical={false} />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11, fill: theme === "dark" ? "#94A3B8" : "#64748B" }}
                          axisLine={{ stroke: theme === "dark" ? "#26313D" : "#E2E8F0" }}
                          tickLine={false}
                        />
                        <YAxis
                          unit={` ${getUnit()}`}
                          tick={{ fontSize: 11, fill: theme === "dark" ? "#94A3B8" : "#64748B" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: theme === "dark" ? "#11161D" : "#0F172A",
                            borderRadius: "8px",
                            border: theme === "dark" ? "1px solid #26313D" : "none",
                            color: "#FFF",
                            fontSize: "11px",
                            padding: "8px 12px",
                            fontFamily: "monospace",
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
                          fill={theme === "dark" ? "#1E293B" : "#E2E8F0"}
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
              <Card className="shadow-sm hover:shadow-md card-interactive border-border bg-surface rounded-2xl">
                <CardHeader className="p-4 pb-2 border-b border-border">
                  <span className="font-mono text-[10px] uppercase font-semibold text-text-muted tracking-wider block">
                    Synoptic Diagnosis
                  </span>
                  <CardTitle className="text-sm font-bold text-text-primary">
                    Additional Climate Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-secondary/70 border border-border">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-rose-500" />
                      <span className="font-medium text-text-secondary">Temperature Anomaly:</span>
                    </div>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                      +{climate.temp_anomaly_c}°C
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-secondary/70 border border-border">
                    <div className="flex items-center gap-2">
                      <CloudRain className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                      <span className="font-medium text-text-secondary">Seasonal Anomaly:</span>
                    </div>
                    <span className="font-mono font-bold text-sky-700 dark:text-sky-300">
                      +{climate.seasonal_anomaly_pct}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-secondary/70 border border-border">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="font-medium text-text-secondary">Extreme Frequency:</span>
                    </div>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                      {climate.extreme_multiplier}× Baseline
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-secondary/70 border border-border">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-text-muted" />
                      <span className="font-medium text-text-secondary">Decadal Trend:</span>
                    </div>
                    <span className="font-mono font-bold text-text-primary">
                      +{climate.trend_c_per_decade}°C / decade
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      ) : (
        <Card className="p-8 text-center text-text-muted border-dashed border-border bg-surface">
          <p className="text-sm font-semibold">Climate baseline data unavailable for the current selection.</p>
          <p className="text-xs text-text-muted mt-1">
            Reconnecting to ERA5 30-year climatology baseline service...
          </p>
        </Card>
      )}
    </motion.div>
  );
}
