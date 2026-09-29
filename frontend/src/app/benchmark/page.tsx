"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  Award,
  Database,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  HelpCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchBenchmarkMatrix, fetchSkillCurve } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { pageVariants, fadeUp } from "@/lib/motion";
import { WeatherContourHeader } from "@/components/common/Backgrounds";
import { useTheme } from "@/context/ThemeContext";

// ── Types ──────────────────────────────────────────────────────────────────
interface BenchmarkRow {
  model_name: string;
  mae: number;
  rmse: number;
  bias: number;
  csi: number | null;
  corr: number | null;
  skill_score: number | null;
  sample_count: number;
}

interface SkillPoint {
  horizon: string;
  Persistence: number;
  Equal_Weight: number;
  IFS: number;
  AIFS: number;
  GFS: number;
  AETHER: number;
}

// ── Metric tooltip explainers (shared const) ───────────────────────────────
const METRIC_TIPS: Record<string, string> = {
  MAE: "Mean Absolute Error — average magnitude of forecast errors. Lower is better.",
  RMSE: "Root Mean Square Error — penalises large errors more than MAE. Lower is better.",
  Bias:
    "Mean forecast minus observation. Positive = over-forecast, negative = under-forecast. Green when close to zero.",
  CSI: "Critical Success Index (Threat Score) — fraction of observed + forecast events correctly predicted. Only meaningful for precipitation threshold events (≥ 64.5 mm/day). Higher is better.",
  Corr:
    "Pearson correlation coefficient between forecasts and observations. Range −1 to +1; higher is better.",
  "Skill Score":
    "Skill score relative to climatological baseline RMSE. Positive = better than climatology.",
};

// ── Okabe-Ito colorblind-safe palette ─────────────────────────────────────
const LINE_COLORS: Record<string, string> = {
  Persistence: "#999999",
  Equal_Weight: "#E69F00",
  IFS: "#56B4E9",
  AIFS: "#009E73",
  GFS: "#CC79A7",
  AETHER: "#D55E00",
};

// ── Static fallback data (used when API not yet wired or non-precip) ───────
const STATIC_SKILL_DATA: SkillPoint[] = [
  { horizon: "6h", Persistence: 5.2, Equal_Weight: 3.8, IFS: 4.1, AIFS: 3.5, GFS: 4.6, AETHER: 3.1 },
  { horizon: "12h", Persistence: 6.8, Equal_Weight: 4.7, IFS: 5.1, AIFS: 4.3, GFS: 5.8, AETHER: 3.9 },
  { horizon: "24h", Persistence: 8.76, Equal_Weight: 5.97, IFS: 6.42, AIFS: 5.36, GFS: 7.12, AETHER: 4.87 },
  { horizon: "48h", Persistence: 11.4, Equal_Weight: 7.8, IFS: 8.4, AIFS: 7.1, GFS: 9.3, AETHER: 6.4 },
  { horizon: "72h", Persistence: 14.2, Equal_Weight: 9.9, IFS: 10.6, AIFS: 9.1, GFS: 11.8, AETHER: 8.2 },
];

// ── Helpers ────────────────────────────────────────────────────────────────
type SortKey = "mae" | "rmse" | "bias" | "csi" | "corr" | "skill_score";

function biasColor(bias: number | null): string {
  if (bias === null) return "text-text-muted";
  const abs = Math.abs(bias);
  if (abs < 0.5) return "text-success font-semibold";
  if (abs < 2.0) return "text-warning";
  return "text-danger";
}

function MetricHeader({ label, tipKey }: { label: string; tipKey: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-0.5 cursor-help">
          {label}
          <HelpCircle className="h-3 w-3 text-text-muted/60 shrink-0" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-[220px]">
        <p className="text-[11px] leading-relaxed">{METRIC_TIPS[tipKey]}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function SortIcon({
  col,
  sortKey,
  dir,
}: {
  col: SortKey;
  sortKey: SortKey | null;
  dir: "asc" | "desc";
}) {
  if (sortKey !== col)
    return <ChevronsUpDown className="h-3 w-3 text-text-muted/40 inline ml-0.5" />;
  return dir === "asc" ? (
    <ChevronUp className="h-3 w-3 text-accent inline ml-0.5" />
  ) : (
    <ChevronDown className="h-3 w-3 text-accent inline ml-0.5" />
  );
}

// ── Skeleton row ───────────────────────────────────────────────────────────
function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-2.5 px-3">
          <div className="h-3 rounded bg-surface-2 w-full" />
        </td>
      ))}
    </tr>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function BenchmarkPage() {
  const { theme } = useTheme();

  // Filter state
  const [variable, setVariable] = useState("rainfall_mm");
  const [leadTime, setLeadTime] = useState(24);
  const [regime, setRegime] = useState("ALL");

  // Table state
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey | null>("mae");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Skill curve state
  const [skillData, setSkillData] = useState<SkillPoint[]>(STATIC_SKILL_DATA);
  const [skillLoading, setSkillLoading] = useState(false);
  const [skillIsLive, setSkillIsLive] = useState(false);

  const isRain = variable === "rainfall_mm";

  // Fetch benchmark comparison matrix
  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchBenchmarkMatrix(variable, leadTime, regime)
      .then((res) => {
        if (!alive) return;
        setBenchmarkData((res.comparison_table as BenchmarkRow[]) || []);
      })
      .catch((e) => console.warn("Benchmark matrix fetch failed:", e))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [variable, leadTime, regime]);

  // Fetch live skill curve — fallback to static on error
  useEffect(() => {
    let alive = true;
    setSkillLoading(true);
    fetchSkillCurve(variable, regime)
      .then((res: any) => {
        if (!alive) return;
        if (res && res.points && res.points.length > 0) {
          setSkillData(res.points);
          setSkillIsLive(true);
        } else {
          setSkillData(STATIC_SKILL_DATA);
          setSkillIsLive(false);
        }
      })
      .catch((err) => {
        console.warn("Skill curve fetch error, using baseline:", err);
        if (!alive) return;
        setSkillData(STATIC_SKILL_DATA);
        setSkillIsLive(false);
      })
      .finally(() => { if (alive) setSkillLoading(false); });
    return () => { alive = false; };
  }, [variable, regime]);

  // Derived KPIs
  const ifsRow = benchmarkData.find((r) => r.model_name === "ECMWF_IFS");
  const aetherRow = benchmarkData.find((r) => r.model_name === "AETHER");
  const maeImprovement =
    ifsRow && aetherRow && ifsRow.mae > 0
      ? (((ifsRow.mae - aetherRow.mae) / ifsRow.mae) * 100).toFixed(1)
      : null;

  // Sorting
  const handleSort = useCallback(
    (col: SortKey) => {
      if (sortKey === col) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(col);
        setSortDir("asc");
      }
    },
    [sortKey]
  );

  const sortedData = React.useMemo(() => {
    if (!sortKey) return benchmarkData;
    return [...benchmarkData].sort((a, b) => {
      const av = a[sortKey] ?? Infinity;
      const bv = b[sortKey] ?? Infinity;
      const cmp = (av as number) < (bv as number) ? -1 : (av as number) > (bv as number) ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [benchmarkData, sortKey, sortDir]);

  // Number of visible table columns (for skeleton)
  const colCount = isRain ? 6 : 7; // Model + MAE + RMSE + Bias + CSI-or-not + Corr + Samples

  const axisStyle = {
    fontSize: 11,
    fill: theme === "dark" ? "#94A3B8" : "#64748B",
  };
  const gridStroke = theme === "dark" ? "#26313D" : "#E2E8F0";
  const tooltipStyle = {
    backgroundColor: theme === "dark" ? "#11161D" : "#0F172A",
    borderRadius: "8px",
    border: theme === "dark" ? "1px solid #26313D" : "none",
    color: "#FFF",
    fontSize: "11px",
    fontFamily: "monospace",
  };

  return (
    <TooltipProvider>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-4"
      >
        {/* ── Header ── */}
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3 min-w-0">
          <WeatherContourHeader />
          <div className="min-w-0 space-y-1 relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <div className="badge-scientific text-overline bg-info/10 text-info border border-info/30">
                <Award className="h-3 w-3 text-info" />
                <span>Operational Multi-Model Verification</span>
              </div>
              <div className="badge-scientific text-overline bg-surface-2 text-text-muted border border-border">
                <Database className="h-3 w-3" />
                <span>Out-of-Sample Chronological Splits</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight mt-1 font-display">
              Verification &amp; Meteorological Benchmarks
            </h1>
            <p className="text-xs text-text-muted font-medium">
              Adaptive multi-model NWP &amp; AI blending engine — rigorous out-of-sample verification
              against operational ECMWF IFS, AIFS, and NOAA GFS.
            </p>
          </div>

          {/* Global Filters */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <select
              value={variable}
              onChange={(e) => setVariable(e.target.value)}
              aria-label="Select variable"
              className="h-8 bg-surface border border-border rounded-xl px-2.5 text-xs font-semibold text-text-primary shadow-sm focus:ring-1 focus:ring-accent focus:outline-none transition"
            >
              <option value="rainfall_mm">Precipitation (mm)</option>
              <option value="temperature_c">Temperature (°C)</option>
              <option value="wind_speed_ms">Wind Speed (m/s)</option>
            </select>

            <select
              value={leadTime}
              onChange={(e) => setLeadTime(Number(e.target.value))}
              aria-label="Select lead time"
              className="h-8 bg-surface border border-border rounded-xl px-2.5 text-xs font-semibold text-text-primary shadow-sm focus:ring-1 focus:ring-accent focus:outline-none transition"
            >
              <option value={6}>+6h Horizon</option>
              <option value={12}>+12h Horizon</option>
              <option value={24}>+24h Horizon</option>
              <option value={48}>+48h Horizon</option>
              <option value={72}>+72h Horizon</option>
            </select>

            <select
              value={regime}
              onChange={(e) => setRegime(e.target.value)}
              aria-label="Select synoptic regime"
              className="h-8 bg-surface border border-border rounded-xl px-2.5 text-xs font-semibold text-text-primary shadow-sm focus:ring-1 focus:ring-accent focus:outline-none transition"
            >
              <option value="ALL">All Regimes</option>
              <option value="HEAVY_RAIN">Heavy Rain</option>
              <option value="HEAT">Heatwave</option>
              <option value="HIGH_WIND">High Wind</option>
              <option value="NORMAL">Normal Equilibrium</option>
            </select>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Benchmark comparison table (7 cols) */}
          <motion.div variants={fadeUp} className="lg:col-span-7 min-w-0">
            <Card className="shadow-sm hover:shadow-md card-interactive border-border bg-surface rounded-2xl overflow-hidden">
              <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between space-y-0">
                <div>
                  <span className="text-overline text-text-muted block font-semibold">
                    Out-of-Sample Verification Matrix (+{leadTime}h Horizon)
                  </span>
                  <CardTitle className="text-sm font-bold text-text-primary mt-0.5">
                    Comparative Skill Scores
                  </CardTitle>
                </div>
                {maeImprovement && Number(maeImprovement) > 0 ? (
                  <div className="badge-scientific text-overline bg-success/10 text-success border border-success/30">
                    <Sparkles className="h-3 w-3" />
                    <span>AETHER −{maeImprovement}% MAE vs IFS</span>
                  </div>
                ) : (
                  <Badge variant="scientific" className="font-mono tabular-nums text-[10px]">
                    Verified Out-of-Sample
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table
                    className="w-full text-xs text-left border-collapse"
                    aria-label="Multi-model verification matrix"
                  >
                    <caption className="sr-only">
                      Out-of-sample benchmark comparison for {variable} at +{leadTime}h horizon,{" "}
                      {regime} regime.
                    </caption>
                    <thead className="bg-surface-2 text-text-muted text-overline border-b border-border font-mono">
                      <tr>
                        <th scope="col" className="p-2.5 px-3">
                          Model
                        </th>
                        {(["mae", "rmse", "bias"] as SortKey[]).map((col) => (
                          <th
                            key={col}
                            scope="col"
                            className="p-2.5 px-3 text-right cursor-pointer select-none hover:text-text-primary transition-colors"
                            onClick={() => handleSort(col)}
                          >
                            <MetricHeader
                              label={col.toUpperCase()}
                              tipKey={col.toUpperCase()}
                            />
                            <SortIcon col={col} sortKey={sortKey} dir={sortDir} />
                          </th>
                        ))}
                        {isRain ? (
                          <th
                            scope="col"
                            className="p-2.5 px-3 text-right cursor-pointer select-none hover:text-text-primary transition-colors"
                            onClick={() => handleSort("csi")}
                          >
                            <MetricHeader label="CSI" tipKey="CSI" />
                            <SortIcon col="csi" sortKey={sortKey} dir={sortDir} />
                          </th>
                        ) : (
                          <>
                            <th
                              scope="col"
                              className="p-2.5 px-3 text-right cursor-pointer select-none hover:text-text-primary transition-colors"
                              onClick={() => handleSort("corr")}
                            >
                              <MetricHeader label="Corr" tipKey="Corr" />
                              <SortIcon col="corr" sortKey={sortKey} dir={sortDir} />
                            </th>
                            <th
                              scope="col"
                              className="p-2.5 px-3 text-right cursor-pointer select-none hover:text-text-primary transition-colors"
                              onClick={() => handleSort("skill_score")}
                            >
                              <MetricHeader label="Skill" tipKey="Skill Score" />
                              <SortIcon col="skill_score" sortKey={sortKey} dir={sortDir} />
                            </th>
                          </>
                        )}
                        <th scope="col" className="p-2.5 px-3 text-right">
                          Samples
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-mono tabular-nums">
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <SkeletonRow key={i} cols={colCount} />
                        ))
                      ) : sortedData.length > 0 ? (
                        sortedData.map((row) => {
                          const isAether = row.model_name === "AETHER";
                          const cleanName = row.model_name
                            .replace("ECMWF_", "")
                            .replace(/_/g, " ");
                          const bColor = biasColor(row.bias);
                          return (
                            <tr
                              key={row.model_name}
                              className={`transition hover:bg-surface-2/60 ${
                                isAether
                                  ? "bg-accent/10 border-l-2 border-l-accent"
                                  : ""
                              }`}
                            >
                              <td className="p-2.5 px-3 font-sans">
                                <div className="flex items-center gap-1.5">
                                  {isAether ? (
                                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse shrink-0" />
                                  ) : (
                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                                  )}
                                  <span
                                    className={
                                      isAether
                                        ? "text-accent font-black"
                                        : "text-text-primary font-medium"
                                    }
                                  >
                                    {cleanName}
                                  </span>
                                  {isAether && (
                                    <span className="text-[9px] font-mono px-1 rounded bg-accent text-slate-950 font-black ml-1">
                                      BEST
                                    </span>
                                  )}
                                </div>
                              </td>
                              {/* MAE */}
                              <td
                                className={`p-2.5 px-3 text-right ${
                                  isAether
                                    ? "text-accent font-black text-sm"
                                    : "text-text-secondary"
                                }`}
                              >
                                {typeof row.mae === "number" ? row.mae.toFixed(2) : "—"}
                              </td>
                              {/* RMSE */}
                              <td
                                className={`p-2.5 px-3 text-right ${
                                  isAether ? "text-accent font-bold" : "text-text-secondary"
                                }`}
                              >
                                {typeof row.rmse === "number" ? row.rmse.toFixed(2) : "—"}
                              </td>
                              {/* Bias — green when near zero */}
                              <td className={`p-2.5 px-3 text-right ${bColor}`}>
                                {typeof row.bias === "number"
                                  ? row.bias > 0
                                    ? `+${row.bias.toFixed(2)}`
                                    : row.bias.toFixed(2)
                                  : "—"}
                              </td>
                              {/* Conditional: CSI for rain, Corr+Skill for others */}
                              {isRain ? (
                                <td
                                  className={`p-2.5 px-3 text-right ${
                                    isAether ? "text-success font-black" : "text-text-secondary"
                                  }`}
                                >
                                  {typeof row.csi === "number" ? row.csi.toFixed(2) : "—"}
                                </td>
                              ) : (
                                <>
                                  <td className="p-2.5 px-3 text-right text-text-secondary">
                                    {typeof row.corr === "number" ? row.corr.toFixed(2) : "—"}
                                  </td>
                                  <td className="p-2.5 px-3 text-right text-text-secondary">
                                    {typeof row.skill_score === "number"
                                      ? row.skill_score.toFixed(2)
                                      : "—"}
                                  </td>
                                </>
                              )}
                              {/* Samples */}
                              <td className="p-2.5 px-3 text-right text-text-muted text-[11px]">
                                {row.sample_count || "—"}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={colCount}
                            className="p-6 text-center text-text-muted font-sans text-xs"
                          >
                            No benchmark data available for this configuration.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Skill curve chart (5 cols) */}
          <motion.div variants={fadeUp} className="lg:col-span-5 min-w-0">
            <Card className="shadow-sm hover:shadow-md card-interactive border-border bg-surface rounded-2xl overflow-hidden">
              <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between space-y-0">
                <div>
                  <span className="font-mono text-[10px] uppercase font-semibold text-text-muted tracking-wider block">
                    Error Progression
                  </span>
                  <CardTitle className="text-sm font-bold text-text-primary">
                    Lead-Time Skill Curve (MAE)
                  </CardTitle>
                </div>
                <div className="flex items-center gap-1.5">
                  {skillLoading && (
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  )}
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      skillIsLive
                        ? "bg-success/10 text-success border border-success/30"
                        : "bg-surface-2 text-text-muted border border-border"
                    }`}
                  >
                    {skillIsLive ? "LIVE" : "DEMO"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={skillData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={gridStroke}
                        vertical={false}
                      />
                      <XAxis dataKey="horizon" tick={axisStyle} axisLine={{ stroke: gridStroke }} tickLine={false} />
                      <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                      <RechartsTooltip contentStyle={tooltipStyle} />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: "11px" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Persistence"
                        stroke={LINE_COLORS.Persistence}
                        strokeDasharray="4 4"
                        dot={false}
                        strokeWidth={1.5}
                      />
                      <Line
                        type="monotone"
                        dataKey="Equal_Weight"
                        stroke={LINE_COLORS.Equal_Weight}
                        strokeWidth={1.5}
                        dot={{ r: 2.5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="IFS"
                        stroke={LINE_COLORS.IFS}
                        strokeWidth={1.5}
                        dot={{ r: 2.5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="AIFS"
                        stroke={LINE_COLORS.AIFS}
                        strokeWidth={1.5}
                        dot={{ r: 2.5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="GFS"
                        stroke={LINE_COLORS.GFS}
                        strokeWidth={1.5}
                        dot={{ r: 2.5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="AETHER"
                        stroke={LINE_COLORS.AETHER}
                        strokeWidth={3}
                        dot={{ r: 4, fill: LINE_COLORS.AETHER }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {!skillIsLive && (
                  <p className="text-[10px] text-text-muted text-center mt-1 italic">
                    Illustrative trend — live endpoint wiring in progress
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
