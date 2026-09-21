"use client";

import React, { useEffect, useState } from "react";
import { WeatherMap, INDIAN_STATIONS, StationLocation } from "../components/WeatherMap";
import { ModelWeightBars } from "../components/ModelWeightBars";
import { ConfidenceIndicator } from "../components/ConfidenceIndicator";
import { ExtremeRiskCard } from "../components/ExtremeRiskCard";
import { BlendedForecast, ExtremeRiskAssessment } from "../lib/types";
import { fetchForecast, fetchExtremeRisk } from "../lib/api";
import { CloudRain, Thermometer, Wind, RefreshCw } from "lucide-react";

export default function OverviewPage() {
  const [station, setStation] = useState<StationLocation>(INDIAN_STATIONS[0]); // Delhi default
  const [variable, setVariable] = useState<string>("rainfall_mm");
  const [horizon, setHorizon] = useState<number>(24);
  const [forecast, setForecast] = useState<BlendedForecast | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<ExtremeRiskAssessment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetchForecast(station.lat, station.lon, variable, horizon, station.name),
      fetchExtremeRisk(station.lat, station.lon, horizon, station.name),
    ])
      .then(([fData, rData]) => {
        setForecast(fData);
        setRiskAssessment(rData);
      })
      .catch((err) => {
        console.error("API fetch error:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [station, variable, horizon]);

  const getUnit = () =>
    variable === "rainfall_mm" ? "mm" : variable === "temperature_c" ? "°C" : "m/s";

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        {/* Variable Switcher */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setVariable("rainfall_mm")}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              variable === "rainfall_mm"
                ? "bg-white text-sky-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-sky-600" />
            <span>Rainfall</span>
          </button>

          <button
            onClick={() => setVariable("temperature_c")}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              variable === "temperature_c"
                ? "bg-white text-amber-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-amber-600" />
            <span>Temperature</span>
          </button>

          <button
            onClick={() => setVariable("wind_speed_ms")}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              variable === "wind_speed_ms"
                ? "bg-white text-teal-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-teal-600" />
            <span>Wind Speed</span>
          </button>
        </div>

        {/* Lead Time Horizon Switcher */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Horizon:
          </span>
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {[6, 12, 24, 48, 72].map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  horizon === h
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {h}h
              </button>
            ))}
          </div>

          <button
            onClick={loadData}
            title="Refresh active pipeline inference"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-sky-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main 12-Column Responsive Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Primary Interactive Synoptic Map */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <WeatherMap
            selectedStation={station}
            onSelectStation={setStation}
            variable={variable}
            currentValue={forecast?.calibrated_forecast}
            confidence={forecast?.confidence_pct}
            dominantModel={forecast?.dominant_model}
            regime={forecast?.detected_regime}
          />

          {/* Quick Station Bar */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 text-[11px] font-medium shrink-0">
              Quick Select:
            </span>
            {INDIAN_STATIONS.map((st) => (
              <button
                key={st.name}
                onClick={() => setStation(st)}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition border ${
                  station.name === st.name
                    ? "bg-sky-50 text-sky-800 border-sky-300 font-semibold"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {st.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right 5 Columns: Meteorological Decision Support Cards */}
        <div className="lg:col-span-5 space-y-5">
          {/* Situation Hero Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
                  {station.name} &bull; Next {horizon} Hours
                </span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {forecast?.calibrated_forecast ?? "--"}
                  </span>
                  <span className="text-lg font-bold text-slate-500 font-mono">
                    {getUnit()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                  Weather Regime
                </span>
                <span className="text-sm font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg inline-block mt-1">
                  {forecast?.detected_regime || "NORMAL"}
                </span>
              </div>
            </div>

            {/* Individual NWP vs AETHER Comparison Pill */}
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">ECMWF</span>
                <span className="font-bold text-slate-800 font-mono">
                  {forecast?.raw_model_forecasts?.["ECMWF_IFS"] ?? "--"} {getUnit()}
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">AIFS</span>
                <span className="font-bold text-slate-800 font-mono">
                  {forecast?.raw_model_forecasts?.["ECMWF_AIFS"] ?? "--"} {getUnit()}
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">GFS</span>
                <span className="font-bold text-slate-800 font-mono">
                  {forecast?.raw_model_forecasts?.["GFS"] ?? "--"} {getUnit()}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Model Trust Bar */}
          <ModelWeightBars
            weights={forecast?.model_weights || {}}
            dominantModel={forecast?.dominant_model || "ECMWF_AIFS"}
            regime={forecast?.detected_regime}
          />

          {/* Calibrated Confidence Indicator */}
          <ConfidenceIndicator
            confidencePct={forecast?.confidence_pct || 82}
            confidenceTier={forecast?.confidence_tier || "High"}
            drivers={forecast?.confidence_drivers || ["High model agreement"]}
          />

          {/* Extreme Risk Alert */}
          <ExtremeRiskCard assessment={riskAssessment} />
        </div>
      </div>
    </div>
  );
}
