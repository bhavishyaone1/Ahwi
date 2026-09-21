"use client";

import React, { useEffect, useState } from "react";
import { INDIAN_STATIONS, StationLocation } from "../../components/WeatherMap";
import { ExtremeRiskCard } from "../../components/ExtremeRiskCard";
import { ExtremeRiskAssessment } from "../../lib/types";
import { fetchExtremeRisk } from "../../lib/api";
import { ShieldAlert, AlertTriangle, CloudRain, Flame, Wind } from "lucide-react";

export default function ExtremeRiskPage() {
  const [station, setStation] = useState<StationLocation>(INDIAN_STATIONS[0]);
  const [horizon, setHorizon] = useState<number>(24);
  const [risk, setRisk] = useState<ExtremeRiskAssessment | null>(null);

  useEffect(() => {
    fetchExtremeRisk(station.lat, station.lon, horizon, station.name)
      .then(setRisk)
      .catch((err) => console.error(err));
  }, [station, horizon]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            <span>Extreme-Weather Risk Assessment</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Probabilistic high-impact event guidance for disaster management & operational decision support
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
        {/* Left 7 Columns: Detailed Risk Cards */}
        <div className="lg:col-span-7 space-y-4">
          <ExtremeRiskCard assessment={risk} />

          {/* Contributing Signals Detail Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Atmospheric Trigger Signals for {station.name}
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-2">
                <CloudRain className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 block">Convective Moisture Convergence:</strong>
                  Deep tropospheric humidity (&gt;85%) and cyclonic vorticity indicate intense local precipitation potential.
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-2">
                <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 block">Thermal Advection Gradient:</strong>
                  Dry continental northwesterly winds maintain elevated sensible heat flux across northwestern plains.
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-2">
                <Wind className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 block">Baroclinic Pressure Gradient:</strong>
                  Surface isobar crowding indicates gust potential exceeding 15 m/s (~30 knots).
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Risk Guidance Matrix */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Probability Classification Criteria
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              AETHER's XGBoost risk classifier outputs continuous calibrated probabilities mapped into operational tiers:
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span>0% – 29%</span>
                <span className="font-bold">LOW (Normal vigilance)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                <span>30% – 59%</span>
                <span className="font-bold">WATCH (Be prepared)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
                <span>60% – 79%</span>
                <span className="font-bold">HIGH (Action required)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-red-100 text-red-900 border border-red-300">
                <span>80% – 100%</span>
                <span className="font-bold">EXTREME (High emergency)</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="flex items-center space-x-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>MoES / NCMRWF Protocol Reminder</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              AETHER provides high-resolution statistical risk guidance for decision-support workflows. Official weather warnings and alerts for civil protection remain the sole mandate of the India Meteorological Department (IMD).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
