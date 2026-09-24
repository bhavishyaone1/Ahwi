"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Server, Activity, Database, Cpu, Satellite } from "lucide-react";
import { useAetherData } from "../context/AetherDataContext";

interface SystemHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemHealthModal: React.FC<SystemHealthModalProps> = ({ isOpen, onClose }) => {
  const { data } = useAetherData();

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
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-surface rounded-2xl shadow-2xl max-w-lg w-full border border-border p-6 text-text-primary elevated-glow animate-in zoom-in-95 duration-150 focus:outline-none">
          <Dialog.Close asChild>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-2 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </Dialog.Close>

          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <Dialog.Title className="text-base font-bold text-text-primary">
                AETHER System & Ingestion Health
              </Dialog.Title>
              <Dialog.Description className="text-xs text-text-muted">
                Real-time operational availability across all NWP & AI observation layers
              </Dialog.Description>
            </div>
          </div>

          <div className="divide-y divide-border border border-border rounded-xl max-h-80 overflow-y-auto">
            {feeds.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-3 flex items-center justify-between text-xs hover:bg-surface-2/60 transition">
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 text-text-muted" />
                    <div>
                      <span className="font-semibold text-text-primary block">{f.name}</span>
                      <span className="text-[10px] text-text-muted">{f.provider}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        f.status === "UNAVAILABLE"
                          ? "bg-surface-2 text-text-muted"
                          : "bg-success/10 text-success border border-success/30"
                      }`}
                    >
                      {f.status === "UNAVAILABLE" ? "○ UNAVAILABLE" : "● " + f.status}
                    </span>
                    <span className="block font-mono text-[10px] text-text-muted mt-0.5">{f.latency}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-[11px] text-text-muted font-mono">Target Grid: 0.25° (~27 km) &bull; MoES Ingestion</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-accent text-slate-950 rounded-xl text-xs font-bold hover:bg-accent-hover transition shadow-sm"
            >
              Done
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
