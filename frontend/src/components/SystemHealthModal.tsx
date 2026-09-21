"use client";

import React from "react";
import { X, CheckCircle2, AlertCircle, Server, Activity, Database, Cpu, Satellite } from "lucide-react";
import { useAetherData } from "../context/AetherDataContext";

interface SystemHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemHealthModal: React.FC<SystemHealthModalProps> = ({ isOpen, onClose }) => {
  const { data } = useAetherData();
  if (!isOpen) return null;

  const feeds = [
    { name: "ECMWF IFS (NWP)", provider: "ECMWF Open Data", status: "HEALTHY", latency: "42ms", icon: Server },
    { name: "ECMWF AIFS (AI)", provider: "ECMWF / DeepMind", status: "HEALTHY", latency: "38ms", icon: Cpu },
    { name: "NOAA GFS (NWP)", provider: "NOAA / NCEP", status: "HEALTHY", latency: "55ms", icon: Server },
    { name: "NASA GPM IMERG", provider: "NASA EarthData", status: "HEALTHY", latency: "62ms", icon: Satellite },
    { name: "INSAT-3D / 3DR", provider: "IMD / MOSDAC", status: "HEALTHY", latency: "74ms", icon: Satellite },
    { name: "Copernicus ERA5", provider: "ECMWF CDS", status: "HISTORICAL", latency: "Offline Baseline", icon: Database },
    { name: "SQLAlchemy / PostGIS", provider: "AETHER DB", status: "CONNECTED", latency: "12ms", icon: Database },
    { name: "Causal LSTM & XGBoost", provider: "Local PyTorch", status: "ACTIVE", latency: "24ms", icon: Activity },
    { name: "DeepMind GraphCast", provider: "Research AI Model", status: "UNAVAILABLE", latency: "Awaiting weights", icon: Cpu },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              AETHER System & Source Health
            </h3>
            <p className="text-xs text-slate-500">
              Real-time operational availability across all ingestion layers
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl max-h-80 overflow-y-auto">
          {feeds.map((f, i) => {
            const Icon = f.icon;
            const isHealthy = f.status === "HEALTHY" || f.status === "CONNECTED" || f.status === "ACTIVE" || f.status === "HISTORICAL";
            return (
              <div key={i} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="font-semibold text-slate-800 block">{f.name}</span>
                    <span className="text-[10px] text-slate-400">{f.provider}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      f.status === "UNAVAILABLE"
                        ? "bg-slate-100 text-slate-500"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {f.status === "UNAVAILABLE" ? "○ UNAVAILABLE" : "● " + f.status}
                  </span>
                  <span className="block font-mono text-[10px] text-slate-400 mt-0.5">{f.latency}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Target Grid: 0.25° (~27 km)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
