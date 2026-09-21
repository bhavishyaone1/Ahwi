"use client";

import React, { useEffect, useState } from "react";
import { fetchWeightMap } from "../../lib/api";
import { WeightGridPoint } from "../../lib/types";
import { Layers, CheckCircle2, CloudRain, Thermometer, Wind } from "lucide-react";

export default function WeightMapPage() {
  const [variable, setVariable] = useState<string>("rainfall_mm");
  const [horizon, setHorizon] = useState<number>(24);
  const [points, setPoints] = useState<WeightGridPoint[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchWeightMap(variable, horizon)
      .then(setPoints)
      .catch((err) => console.error(err));
  }, [variable, horizon]);

  const filteredPoints = selectedFilter === "ALL"
    ? points
    : points.filter((p) => p.dominant_model === selectedFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Layers className="w-6 h-6 text-sky-600" />
            <span>Geographic Model-Reliability Map</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            PS 26081 Requirement: Geographic mapping of regional model contributions
          </p>
        </div>

        {/* Filter by Dominant Model */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          {["ALL", "ECMWF_AIFS", "ECMWF_IFS", "GFS"].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedFilter(m)}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedFilter === m
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {m === "ALL" ? "All Models" : m.replace("ECMWF_", "")}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Regional Stations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPoints.map((pt) => {
          const wAifs = Math.round((pt.weights["ECMWF_AIFS"] || 0.33) * 100);
          const wEcmwf = Math.round((pt.weights["ECMWF_IFS"] || 0.33) * 100);
          const wGfs = Math.round((pt.weights["GFS"] || 0.33) * 100);

          return (
            <div
              key={pt.station}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-sky-300 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{pt.station}</h3>
                  <span className="text-[11px] text-slate-500">{pt.region} Subdivision</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {pt.regime}
                </span>
              </div>

              {/* Dominant Model Badge */}
              <div className="flex items-center justify-between bg-sky-50/70 p-2.5 rounded-xl border border-sky-100">
                <span className="text-xs text-sky-900 font-medium">Dominant Model:</span>
                <span className="text-xs font-bold text-sky-800 font-mono">
                  {pt.dominant_model}
                </span>
              </div>

              {/* Weight Breakdown */}
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-slate-600">AIFS (AI)</span>
                    <span className="font-bold text-slate-900">{wAifs}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${wAifs}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-slate-600">ECMWF (NWP)</span>
                    <span className="font-bold text-slate-900">{wEcmwf}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: `${wEcmwf}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-slate-600">GFS (NWP)</span>
                    <span className="font-bold text-slate-900">{wGfs}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${wGfs}%` }} />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Confidence:</span>
                <span className="font-bold text-emerald-600">{pt.confidence}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
