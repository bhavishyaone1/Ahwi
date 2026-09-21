"use client";

import React from "react";
import { motion } from "motion/react";
import { useAetherData } from "../context/AetherDataContext";
import { WeatherMap } from "../components/WeatherMap";
import {
  Sparkles,
  MapPin,
  ShieldAlert,
  ChevronRight,
  RefreshCw,
  Activity,
  Layers,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { NumberTicker } from "@/components/common/NumberTicker";
import { WeatherContourHeader } from "@/components/common/Backgrounds";
import { pageVariants, fadeUp } from "@/lib/motion";

export default function OverviewPage() {
  const {
    data,
    loading,
    selectedLocation,
    setSelectedLocation,
    variable,
    leadTimeHours,
    setLeadTimeHours,
    activeLayer,
    setActiveLayer,
    openTraceDrawer,
    refresh,
  } = useAetherData();

  const getUnit = () =>
    variable === "rainfall_mm"
      ? "mm"
      : variable === "temperature_c"
      ? "°C"
      : "m/s";

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4"
    >
      {/* Overview Top Header with WeatherContourHeader */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <WeatherContourHeader />
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-semibold">
            <Sparkles className="h-3 w-3 text-sky-600" />
            <span>Operational Situation Room</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 mt-1">
            AETHER Weather Intelligence
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Adaptive multi-model forecasting for a changing atmosphere.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="scientific"
            size="sm"
            onClick={openTraceDrawer}
            className="gap-1.5"
          >
            <Activity className="h-3.5 w-3.5 text-sky-700" />
            <span>Forecast Trace</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={refresh}
            title="Refresh pipeline computation"
            className="h-8 w-8"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin text-sky-600" : "text-slate-600"}`}
            />
          </Button>
        </div>
      </div>

      {/* Main Workstation Layout: 65% Map + 35% Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left 65%: Geospatial Map Engine */}
        <motion.div variants={fadeUp} className="lg:col-span-8 flex flex-col space-y-3">
          <WeatherMap
            selectedStation={selectedLocation}
            onSelectStation={setSelectedLocation}
            variable={variable}
            currentValue={data?.aether_forecast.calibrated_value}
            confidence={data?.confidence.pct}
            dominantModel={data?.explanations.model}
            regime={data?.weather_regime.detected}
            leadTimeHours={leadTimeHours}
            onLeadTimeChange={setLeadTimeHours}
            activeLayer={activeLayer}
            onLayerChange={setActiveLayer}
          />
        </motion.div>

        {/* Right 35%: Operational Situation Panel */}
        <motion.div variants={fadeUp} className="lg:col-span-4 space-y-3">
          <Card className="shadow-xs border-slate-200 bg-white">
            <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-start justify-between space-y-0">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  SELECTED STATION
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MapPin className="h-4 w-4 text-sky-600" />
                  <CardTitle className="text-base font-bold text-slate-950">
                    {data?.location.name || selectedLocation.name}
                  </CardTitle>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {selectedLocation.latitude.toFixed(1)}°N, {selectedLocation.longitude.toFixed(1)}°E
                </span>
              </div>
              <Badge variant="secondary" className="font-mono text-[10px]">
                +{leadTimeHours}h Horizon
              </Badge>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* AETHER Blended Forecast Value */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    AETHER BLENDED FORECAST
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-4xl font-bold font-mono text-slate-950 tracking-tight">
                      {data?.aether_forecast.calibrated_value ? (
                        <NumberTicker
                          value={data.aether_forecast.calibrated_value}
                          decimals={1}
                        />
                      ) : (
                        "--"
                      )}
                    </span>
                    <span className="text-sm font-semibold font-mono text-slate-500">
                      {data?.aether_forecast.unit || getUnit()}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                    Next 24 hours
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    WEATHER REGIME
                  </span>
                  <Badge
                    variant={
                      data?.weather_regime.detected === "HEAVY_RAIN"
                        ? "destructive"
                        : "scientific"
                    }
                    className="mt-1 font-bold"
                  >
                    {data?.weather_regime.detected || "HEAVY RAIN"}
                  </Badge>
                </div>
              </div>

              {/* Forecast Confidence Meter */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    FORECAST CONFIDENCE:
                  </span>
                  <span className="font-mono font-bold text-emerald-600 text-xs">
                    {data?.confidence.pct ? (
                      <NumberTicker value={data.confidence.pct} decimals={0} suffix="%" />
                    ) : (
                      "78%"
                    )}
                  </span>
                </div>
                <Progress
                  value={data?.confidence.pct ?? 78}
                  indicatorColor="bg-emerald-500"
                  className="h-1.5"
                />
              </div>

              {/* Adaptive Model Trust Breakdown */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  ADAPTIVE MODEL TRUST
                </span>
                <div className="space-y-2">
                  {Object.entries(
                    data?.weights || {
                      ECMWF_AIFS: 0.46,
                      ECMWF_IFS: 0.32,
                      GFS: 0.22,
                    }
                  )
                    .sort((a, b) => b[1] - a[1])
                    .map(([mName, w]) => {
                      const pct = Math.round(w * 100);
                      const cleanName = mName.replace("ECMWF_", "");
                      return (
                        <div key={mName} className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-medium text-slate-700">{cleanName}</span>
                            <span className="font-mono font-bold text-slate-900">{pct}%</span>
                          </div>
                          <Progress
                            value={pct}
                            indicatorColor={
                              cleanName === "AIFS"
                                ? "bg-sky-600"
                                : cleanName === "IFS"
                                ? "bg-blue-600"
                                : "bg-slate-500"
                            }
                            className="h-1.5"
                          />
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Extreme Weather Risk */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  EXTREME WEATHER RISK
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-md bg-rose-50/70 border border-rose-200">
                    <span className="text-[9px] font-semibold text-rose-700 uppercase block">
                      Heavy Rain
                    </span>
                    <span className="font-bold font-mono text-rose-800 text-xs">
                      {data?.risk.heavy_rain.level || "HIGH"}
                    </span>
                  </div>
                  <div className="p-2 rounded-md bg-emerald-50/70 border border-emerald-200">
                    <span className="text-[9px] font-semibold text-emerald-700 uppercase block">
                      Heat
                    </span>
                    <span className="font-bold font-mono text-emerald-800 text-xs">
                      {data?.risk.heat.level || "LOW"}
                    </span>
                  </div>
                  <div className="p-2 rounded-md bg-amber-50/70 border border-amber-200">
                    <span className="text-[9px] font-semibold text-amber-700 uppercase block">
                      High Wind
                    </span>
                    <span className="font-bold font-mono text-amber-800 text-xs">
                      {data?.risk.high_wind.level || "WATCH"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trace Link */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {data?.data_freshness.AIFS || "Updated 2 min ago"}
                </span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={openTraceDrawer}
                  className="text-sky-700 font-bold hover:text-sky-900 gap-1 p-0 h-auto"
                >
                  <span>Inspect Forecast Trace</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
