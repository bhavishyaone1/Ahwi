"use client";

import React, { useEffect, useState } from "react";
import { INDIAN_STATIONS, StationLocation } from "../../components/WeatherMap";
import { ModelWeightBars } from "../../components/ModelWeightBars";
import { ShapWaterfall } from "../../components/ShapWaterfall";
import { BlendedForecast, ModelExplanation } from "../../lib/types";
import { fetchForecast, fetchModelExplanation } from "../../lib/api";
import { Cpu, ShieldCheck, TrendingUp, HelpCircle } from "lucide-react";

export default function ModelIntelligencePage() {
  const [station, setStation] = useState<StationLocation>(INDIAN_STATIONS[0]);
  const [selectedModel, setSelectedModel] = useState<string>("ECMWF_AIFS");
  const [forecast, setForecast] = useState<BlendedForecast | null>(null);
  const [explanation, setExplanation] = useState<ModelExplanation | null>(null);

  useEffect(() => {
    fetchForecast(station.lat, station.lon, "rainfall_mm", 24, station.name)
      .then(setForecast)
      .catch((err) => console.error(err));

    fetchModelExplanation(selectedModel, station.lat, station.lon, "rainfall_mm", 24, station.name)
      .then(setExplanation)
      .catch((err) => console.error(err));
  }, [station, selectedModel]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-sky-600" />
            <span>Model Intelligence & Adaptive Trust</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Understanding why AETHER trusts specific models under current synoptic regimes
          </p>
        </div>

        {/* Station Select */}
        <select
          value={station.name}
          onChange={(e) => {
            const st = INDIAN_STATIONS.find((s) => s.name === e.target.value);
            if (st) setStation(st);
          }}
          className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
        >
          {INDIAN_STATIONS.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name} ({s.region})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dynamic Weights & Summary */}
        <div className="lg:col-span-5 space-y-5">
          <ModelWeightBars
            weights={forecast?.model_weights || {}}
            dominantModel={forecast?.dominant_model || "ECMWF_AIFS"}
            regime={forecast?.detected_regime}
          />

          {/* Model Skill Profile Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Operational NWP vs AI Profile
            </h4>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-900 block">ECMWF / IFS (Physics)</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  High synoptic fidelity, reliable surface pressure and wind field representation.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-indigo-900 block">ECMWF / AIFS (AI)</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Deep data-driven learning; rapid non-linear convective moisture tracking.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-teal-900 block">NOAA GFS (Physics)</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Independent physics ensemble; provides critical diversity during regime shifts.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: SHAP TreeExplainer Waterfall */}
        <div className="lg:col-span-7">
          <ShapWaterfall
            explanation={explanation}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
          />
        </div>
      </div>
    </div>
  );
}
