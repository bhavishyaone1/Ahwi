"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAetherData } from "../context/AetherDataContext";
import {
  X,
  CheckCircle2,
  ChevronRight,
  Activity,
  Database,
  Cpu,
  Compass,
  Layers,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const ForecastTraceDrawer: React.FC = () => {
  const { isTraceOpen, setIsTraceOpen, traceData, loadingTrace } = useAetherData();

  const getStepIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Database className="w-4 h-4 text-sky-600" />;
      case 1:
        return <Compass className="w-4 h-4 text-cyan-600" />;
      case 2:
        return <Activity className="w-4 h-4 text-indigo-600" />;
      case 3:
        return <Layers className="w-4 h-4 text-amber-600" />;
      case 4:
        return <Cpu className="w-4 h-4 text-purple-600" />;
      case 5:
        return <Cpu className="w-4 h-4 text-blue-600" />;
      case 6:
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 7:
        return <Layers className="w-4 h-4 text-teal-600" />;
      case 8:
        return <Activity className="w-4 h-4 text-sky-700" />;
      case 9:
        return <Activity className="w-4 h-4 text-violet-600" />;
      case 10:
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-sky-600" />;
    }
  };

  return (
    <AnimatePresence>
      {isTraceOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop with Motion Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsTraceOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            {/* Drawer with Motion Slide */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Operational Lineage
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-950 mt-0.5">
                    Forecast Trace & Execution
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {traceData
                      ? `${traceData.location} (${traceData.horizon} · ${traceData.variable})`
                      : "Inspecting pipeline..."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTraceOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
                  aria-label="Close trace drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingTrace ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-500">Querying active execution steps...</p>
                  </div>
                ) : traceData ? (
                  <div className="relative border-l-2 border-sky-100 ml-3 space-y-5">
                    {traceData.steps.map((s, idx) => (
                      <div key={idx} className="relative pl-5">
                        {/* Node Dot */}
                        <div className="absolute -left-[15px] top-0.5 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center">
                          {getStepIcon(idx)}
                        </div>

                        <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/70 hover:border-sky-300 transition">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Step {s.step}
                            </span>
                            <Badge variant="success" className="text-[10px] px-1.5 py-0 gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>{s.status}</span>
                            </Badge>
                          </div>
                          <h3 className="text-xs font-semibold text-slate-900 mt-1">
                            {s.name}
                          </h3>

                          {/* Detail block */}
                          <div className="mt-2 bg-white rounded-md p-2 border border-slate-200 font-mono text-[10px] text-slate-700 overflow-x-auto">
                            <pre className="whitespace-pre-wrap leading-relaxed">
                              {typeof s.detail === "object"
                                ? JSON.stringify(s.detail, null, 2)
                                : String(s.detail)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-8">No trace available.</p>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
                <span className="font-mono text-[10px]">MoES / NCMRWF PS 26081</span>
                <Button
                  variant="default"
                  size="xs"
                  onClick={() => setIsTraceOpen(false)}
                >
                  Close Trace
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
