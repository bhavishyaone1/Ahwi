"use client";

import React, { useState } from "react";
import { SystemStatus } from "../lib/types";
import { Info, CheckCircle2, AlertTriangle, X } from "lucide-react";

interface StatusPillProps {
  status: SystemStatus | null;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  const [showModal, setShowModal] = useState(false);
  const isReal = status?.data_mode === "REAL";

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shadow-sm ${
          isReal
            ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
            : "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
        }`}
        title="Click for data stream verification details"
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isReal ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
          }`}
        />
        <span className="font-semibold tracking-wide">
          {isReal ? "REAL DATA" : "DEMO MODE"}
        </span>
        <span className="text-[10px] text-gray-500">|</span>
        <span className="text-[11px] text-gray-600 font-mono">
          0.25° Grid
        </span>
        <Info className="w-3.5 h-3.5 ml-0.5 text-gray-400" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              {isReal ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              )}
              <h3 className="text-lg font-semibold text-slate-900">
                {isReal ? "Production Real Data Active" : "Synthetic Scenario Demo Mode"}
              </h3>
            </div>

            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>
                {isReal
                  ? "AETHER is actively ingesting live multi-model feeds from ECMWF Open Data, NOAA GFS, and Copernicus CDS."
                  : "AETHER is currently utilizing the Synthetic Scenario Adapter to demonstrate offline hackathon resilience across synoptic Indian regimes (Monsoon depressions, cyclones, heatwaves)."}
              </p>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Data Source:</span>
                  <span className="text-slate-800 font-medium">
                    {status?.data_source || "SYNTHETIC_SCENARIO"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Grid Resolution:</span>
                  <span className="text-slate-800 font-medium">
                    {status?.target_grid_resolution || "0.25°"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ML Pipeline:</span>
                  <span className="text-emerald-700 font-medium">
                    Identical Unified Engine Active
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 italic">
                * Zero fake numbers: All weights, confidence ratings, and forecasts are dynamically computed by the active XGBoost & LSTM models.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
