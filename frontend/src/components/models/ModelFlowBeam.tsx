"use client";

import React from "react";
import { motion } from "motion/react";
import { CloudRain, Cpu, Sparkles, CheckCircle2 } from "lucide-react";

interface ModelFlowBeamProps {
  weights: {
    aifs: number;
    ecmwf: number;
    gfs: number;
  };
  className?: string;
}

export function ModelFlowBeam({ weights, className = "" }: ModelFlowBeamProps) {
  const models = [
    { id: "ecmwf", name: "ECMWF IFS", weight: weights.ecmwf, color: "#2563EB", delay: 0 },
    { id: "aifs", name: "ECMWF AIFS", weight: weights.aifs, color: "#0284C7", delay: 0.2 },
    { id: "gfs", name: "NOAA GFS", weight: weights.gfs, color: "#64748B", delay: 0.4 },
  ];

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow-md card-interactive ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-aether-sky" />
          <span className="text-xs font-semibold text-text-primary">
            Multi-Model Fusion DAG
          </span>
        </div>
        <span className="text-[11px] font-mono text-text-muted">
          Causal Softmax Blending
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Left: Input Forecast Models */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Source Models
          </p>
          {models.map((m) => (
            <motion.div
              key={m.id}
              whileHover={{ scale: 1.01 }}
              className="flex items-center justify-between rounded-md border border-border bg-surface-secondary/70 px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: m.color }}
                />
                <span className="font-medium text-text-primary">{m.name}</span>
              </div>
              <span className="font-mono text-xs font-semibold text-text-secondary">
                {Math.round(m.weight * 100)}%
              </span>
            </motion.div>
          ))}
        </div>

        {/* Center: AETHER Adaptive Weighting Engine */}
        <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-aether-sky/20 bg-aether-sky/10 text-center relative">
          <motion.div
            animate={{
              scale: [1, 1.04, 1],
              borderColor: ["#BAE6FD", "#38BDF8", "#BAE6FD"],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border-2 border-aether-sky/50 shadow-sm mb-2"
          >
            <Sparkles className="h-5 w-5 text-aether-sky" />
          </motion.div>
          <span className="text-xs font-bold text-text-primary">
            AETHER Core Engine
          </span>
          <span className="text-[10px] text-aether-sky mt-0.5">
            2-Layer LSTM + XGBoost Reliability
          </span>

          <div className="mt-2 flex flex-wrap justify-center gap-1">
            <span className="rounded bg-aether-sky/20 px-1.5 py-0.5 text-[9px] font-mono text-aether-sky">
              Regime-Aware
            </span>
            <span className="rounded bg-aether-sky/20 px-1.5 py-0.5 text-[9px] font-mono text-aether-sky">
              Spatially Adaptive
            </span>
          </div>
        </div>

        {/* Right: Hybrid Calibrated Blend */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Calibrated Output
          </p>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                AETHER Blend
              </span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-500">
                Optimal Skill
              </span>
            </div>
            <p className="text-[11px] text-text-secondary">
              Bias-corrected weighted consensus with calibrated uncertainty bands.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
