"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { useTheme } from "@/context/ThemeContext";
import { useAetherData } from "../../context/AetherDataContext";
import { INDIAN_STATIONS } from "@/components/map/WeatherMap";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { Activity, ChevronRight, Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { NumberTicker } from "@/components/common/NumberTicker";
import { pageVariants, fadeUp } from "@/lib/motion";
import { WeatherContourHeader } from "@/components/common/Backgrounds";

export default function ForecastPage() {
  const { theme } = useTheme();
  const {
    data,
    selectedLocation,
    setSelectedLocation,
    variable,
    setVariable,
    leadTimeHours,
    setLeadTimeHours,
    openTraceDrawer,
  } = useAetherData();

  const [activeTab, setActiveTab] = useState<"forecast" | "table" | "uncertainty">(
    "forecast"
  );

  const getUnit = () =>
    variable === "rainfall_mm" ? "mm" : variable === "temperature_c" ? "°C" : "m/s";

  const chartData = data?.multi_horizon || [];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4"
    >
      {/* Header with WeatherContourHeader */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <WeatherContourHeader />
        <div>
          <div className="badge-scientific text-overline bg-info/10 text-info border border-info/30">
            <Activity className="h-3 w-3 text-info shrink-0" />
            <span>Multi-Model Synthesis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight mt-1">
            Forecast Exploration
          </h1>
          <p className="text-xs text-text-muted font-medium">
            Adaptive multi-model NWP & AI blending engine — compare ECMWF IFS, AIFS, and NOAA GFS across lead times (MoES PS 26081).
          </p>
        </div>

        {/* Global Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Variable Selector */}
          <select
            value={variable}
            onChange={(e) => setVariable(e.target.value)}
            className="h-8 bg-surface border border-border rounded-xl px-2.5 text-xs font-semibold text-text-primary shadow-sm focus:ring-1 focus:ring-accent focus:outline-none transition"
          >
            <option value="rainfall_mm">Rainfall (mm)</option>
            <option value="temperature_c">Temperature (°C)</option>
            <option value="wind_speed_ms">Wind Speed (m/s)</option>
          </select>

          {/* Location Selector */}
          <select
            value={selectedLocation.name}
            onChange={(e) => {
              const st = INDIAN_STATIONS.find((s) => s.name === e.target.value);
              if (st) {
                setSelectedLocation({
                  name: st.name,
                  latitude: st.lat,
                  longitude: st.lon,
                  region: st.region,
                });
              }
            }}
            className="h-8 bg-surface border border-border rounded-xl px-2.5 text-xs font-semibold text-text-primary shadow-sm focus:ring-1 focus:ring-accent focus:outline-none transition"
          >
            {INDIAN_STATIONS.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name} ({s.region})
              </option>
            ))}
          </select>

          {/* Horizon Selector */}
          <select
            value={leadTimeHours}
            onChange={(e) => setLeadTimeHours(Number(e.target.value))}
            className="h-8 bg-surface border border-border rounded-xl px-2.5 text-xs font-semibold text-text-primary shadow-sm focus:ring-1 focus:ring-accent focus:outline-none transition"
          >
            <option value={6}>6 hours</option>
            <option value={12}>12 hours</option>
            <option value={24}>24 hours</option>
            <option value={48}>48 hours</option>
            <option value={72}>72 hours</option>
          </select>
        </div>
      </div>

      {/* Tabs with layoutId motion */}
      <div className="flex items-center gap-1 border-b border-border pb-1">
        {(["forecast", "table", "uncertainty"] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                isActive ? "text-text-primary font-bold" : "text-text-muted hover:text-text-primary"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="forecast-tab-pill"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              {tab === "forecast" ? "Time-Series Curves" : tab === "table" ? "Ensemble Table" : "Uncertainty Envelope"}
            </button>
          );
        })}
      </div>

      {/* Main Content: Chart (8 cols) + Key Forecast Panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left 8 cols: Time Series / Table */}
        <motion.div variants={fadeUp} className="lg:col-span-8 min-w-0">
          <Card className="shadow-sm hover:shadow-md card-interactive border-border bg-surface rounded-2xl">
            <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-bold text-text-primary">
                  {variable === "rainfall_mm"
                    ? "Rainfall"
                    : variable === "temperature_c"
                    ? "Temperature"
                    : "Wind"}{" "}
                  Forecast ({selectedLocation.name})
                </CardTitle>
                <p className="text-[11px] text-text-muted">
                  Comparison of NWP & AI models with AETHER dynamic softmax blend
                </p>
              </div>
              <Badge variant="secondary" className="font-mono text-[10px]">
                +{leadTimeHours}h Horizon
              </Badge>
            </CardHeader>

            <CardContent className="p-4">
              {activeTab === "forecast" && (
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme === "dark" ? "#1E293B" : "#F1F5F9"}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="lead_time"
                        tick={{ fontSize: 11, fill: theme === "dark" ? "#94A3B8" : "#64748B" }}
                        axisLine={{ stroke: theme === "dark" ? "#334155" : "#E2E8F0" }}
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
                          borderRadius: "6px",
                          border: theme === "dark" ? "1px solid #1E293B" : "none",
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

                      {/* Calibrated Uncertainty Envelope */}
                      <Area
                        type="monotone"
                        dataKey="AETHER"
                        stroke="none"
                        fill="#f97316"
                        fillOpacity={0.12}
                        name="AETHER Calibrated Interval"
                      />

                      <Line
                        type="monotone"
                        dataKey="ECMWF"
                        stroke="#0ea5e9"
                        strokeWidth={1.5}
                        dot={{ r: 3, fill: "#0ea5e9" }}
                        name="ECMWF IFS"
                      />
                      <Line
                        type="monotone"
                        dataKey="AIFS"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ r: 3.5, fill: "#f59e0b" }}
                        name="ECMWF AIFS"
                      />
                      <Line
                        type="monotone"
                        dataKey="GFS"
                        stroke={theme === "dark" ? "#94A3B8" : "#64748B"}
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={{ r: 2.5, fill: theme === "dark" ? "#94A3B8" : "#64748B" }}
                        name="NOAA GFS"
                      />
                      <Line
                        type="monotone"
                        dataKey="AETHER"
                        stroke="#f97316"
                        strokeWidth={3}
                        dot={{ r: 4.5, fill: "#f97316" }}
                        name="AETHER Blend"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}

              {activeTab === "table" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-overline text-text-muted bg-surface-2">
                        <th className="py-2.5 px-3">Horizon</th>
                        <th className="py-2.5 px-3">ECMWF IFS</th>
                        <th className="py-2.5 px-3">ECMWF AIFS</th>
                        <th className="py-2.5 px-3">NOAA GFS</th>
                        <th className="py-2.5 px-3 font-bold text-text-primary">AETHER Blend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-mono tabular-nums">
                      {chartData.map((pt) => (
                        <tr key={pt.lead_time} className="hover:bg-surface-2/60">
                          <td className="py-2.5 px-3 font-semibold text-text-primary">
                            {pt.lead_time}
                          </td>
                          <td className="py-2.5 px-3 text-text-secondary">{pt.ECMWF} {getUnit()}</td>
                          <td className="py-2.5 px-3 text-info font-medium">{pt.AIFS} {getUnit()}</td>
                          <td className="py-2.5 px-3 text-text-muted">{pt.GFS} {getUnit()}</td>
                          <td className="py-2.5 px-3 font-bold text-text-primary bg-accent/10">
                            {pt.AETHER} {getUnit()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "uncertainty" && (
                <div className="p-4 bg-surface-2 rounded-xl space-y-3 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-primary">
                      Gaussian Calibrated Spread (σ)
                    </span>
                    <span className="font-mono tabular-nums text-xs font-bold text-info">
                      σ = {data?.confidence.spread_sigma !== undefined ? data.confidence.spread_sigma : "--"} {getUnit()}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">
                    Uncertainty interval bounds: [
                    {data?.uncertainty.uncertainty_range_lower ?? "--"} {getUnit()} —{" "}
                    {data?.uncertainty.uncertainty_range_upper ?? "--"} {getUnit()}]. Derived from validation
                    residuals across multi-model forecast ensembles.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right 4 cols: Key Forecast Card */}
        <motion.div variants={fadeUp} className="lg:col-span-4 min-w-0 space-y-3">
          <Card className="shadow-sm hover:shadow-md card-interactive border-border bg-surface rounded-2xl">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <span className="text-overline text-text-muted block font-semibold">
                Key Forecast ({leadTimeHours}h Horizon)
              </span>
              <CardTitle className="text-sm font-extrabold text-text-primary tracking-tight">
                AETHER Blended Forecast
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl font-black font-mono tabular-nums text-text-primary tracking-tight">
                  {data?.aether_forecast.calibrated_value !== undefined ? (
                    <NumberTicker value={data.aether_forecast.calibrated_value} decimals={1} />
                  ) : (
                    "--"
                  )}
                </span>
                <span className="text-xs font-bold font-mono text-text-muted ml-1">
                  {data?.aether_forecast.unit || getUnit()}
                </span>
              </div>

              {/* Models Breakdown */}
              <div className="space-y-2 pt-3 border-t border-border text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary font-medium">ECMWF IFS:</span>
                  <span className="font-mono tabular-nums font-semibold text-text-primary">
                    {data?.forecasts?.["ECMWF_IFS"] !== undefined ? `${data.forecasts["ECMWF_IFS"]} ${getUnit()}` : "--"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary font-medium">ECMWF AIFS:</span>
                  <span className="font-mono tabular-nums font-semibold text-info">
                    {data?.forecasts?.["ECMWF_AIFS"] !== undefined ? `${data.forecasts["ECMWF_AIFS"]} ${getUnit()}` : "--"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary font-medium">NOAA GFS:</span>
                  <span className="font-mono tabular-nums font-semibold text-text-muted">
                    {data?.forecasts?.["GFS"] !== undefined ? `${data.forecasts["GFS"]} ${getUnit()}` : "--"}
                  </span>
                </div>
              </div>

              {/* Confidence & Agreement */}
              <div className="pt-3 border-t border-border space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary font-medium">Forecast Confidence:</span>
                  <span className="font-mono tabular-nums font-bold text-success">
                    {data?.confidence.pct !== undefined ? `${data.confidence.pct}%` : "--"}
                  </span>
                </div>
                <div className="w-full bg-surface-secondary rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-success h-full rounded-full"
                    style={{ width: `${data?.confidence.pct ?? 0}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-text-secondary font-medium">Model Agreement:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                    (data?.confidence.spread_sigma ?? 2.8) < 3.0
                      ? "text-success bg-success/10 border-success/20"
                      : (data?.confidence.spread_sigma ?? 2.8) < 6.0
                      ? "text-warning bg-warning/10 border-warning/20"
                      : "text-danger bg-danger/10 border-danger/20"
                  }`}>
                    {(data?.confidence.spread_sigma ?? 2.8) < 3.0
                      ? "High"
                      : (data?.confidence.spread_sigma ?? 2.8) < 6.0
                      ? "Moderate"
                      : "Low"}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={openTraceDrawer}
                className="w-full justify-between mt-2"
              >
                <span>View Trace Pipeline</span>
                <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Forecast Trace Execution DAG Footer */}
      <motion.div variants={fadeUp}>
        <Card className="shadow-sm hover:shadow-md card-interactive border-border bg-surface-secondary/40 rounded-2xl">
          <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-accent" />
              <span>Forecast Pipeline Execution Trace</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="xs"
              onClick={openTraceDrawer}
              className="text-accent font-bold hover:text-accent-hover"
            >
              Open Full Drawer
            </Button>
          </CardHeader>
          <CardContent className="p-3.5 pt-2">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-text-secondary">
              <span className="px-2 py-0.5 rounded bg-surface border border-border">
                1. Source NWP & AI
              </span>
              <ArrowRight className="h-3 w-3 text-text-muted" />
              <span className="px-2 py-0.5 rounded bg-surface border border-border">
                2. Temporal Align
              </span>
              <ArrowRight className="h-3 w-3 text-text-muted" />
              <span className="px-2 py-0.5 rounded bg-surface border border-border">
                3. Error Memory (30d)
              </span>
              <ArrowRight className="h-3 w-3 text-text-muted" />
              <span className="px-2 py-0.5 rounded bg-surface border border-border">
                4. Regime Detection
              </span>
              <ArrowRight className="h-3 w-3 text-text-muted" />
              <span className="px-2 py-0.5 rounded bg-surface border border-border">
                5. Causal LSTM
              </span>
              <ArrowRight className="h-3 w-3 text-text-muted" />
              <span className="px-2 py-0.5 rounded bg-surface border border-border">
                6. Softmax Weights
              </span>
              <ArrowRight className="h-3 w-3 text-text-muted" />
              <span className="px-2 py-0.5 rounded bg-success/10 border border-success/20 font-bold text-success">
                7. AETHER Calibrated Blend
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
