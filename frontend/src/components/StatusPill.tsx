"use client";

import React, { useState } from "react";
import { SystemStatus } from "../lib/types";
import { Info, CheckCircle2, AlertTriangle, X, Clock, Database, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StatusPillProps {
  status: SystemStatus | null;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  const [showModal, setShowModal] = useState(false);
  const isReal = status?.data_mode === "REAL";

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all shadow-2xs ${
            isReal
              ? "bg-emerald-50 text-emerald-800 border-emerald-300/80 hover:bg-emerald-100"
              : "bg-amber-50 text-amber-900 border-amber-300/80 hover:bg-amber-100"
          }`}
          title="Click for data stream verification details"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isReal ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <span className="tracking-wide">
            {isReal ? "REAL DATA" : "DEMO MODE"}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-[11px] text-slate-600 font-mono">
            0.25° Grid
          </span>
          <Info className="h-3 w-3 text-slate-400 ml-0.5" />
        </button>

        <span className="hidden xl:flex items-center gap-1 text-[11px] font-mono text-slate-400 pl-1 border-l border-slate-200">
          <Clock className="h-3 w-3 text-slate-400" />
          <span>Updated 2 min ago</span>
        </span>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200 p-5 relative">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              {isReal ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              )}
              <h3 className="text-sm font-bold text-slate-950">
                {isReal ? "Production Real Data Active" : "Synthetic Scenario Adapter"}
              </h3>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p>
                {isReal
                  ? "Live NWP and satellite feeds are actively ingesting from ECMWF Open Data, NOAA NOMADS, and NASA GPM/IMD."
                  : "Currently demonstrating pipeline behavior using the deterministic Synthetic Scenario Adapter for SIH offline review."}
              </p>

              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode:</span>
                  <span className="font-bold text-slate-900">{status?.data_mode || "DEMO"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Source:</span>
                  <span className="font-bold text-slate-900">{status?.data_source || "SYNTHETIC_SCENARIO"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Resolution:</span>
                  <span className="font-bold text-slate-900">{status?.target_grid_resolution || "0.25° (~27 km)"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Models:</span>
                  <span className="font-bold text-slate-900">
                    {(status?.active_models || ["ECMWF_IFS", "ECMWF_AIFS", "GFS"]).join(", ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800"
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
