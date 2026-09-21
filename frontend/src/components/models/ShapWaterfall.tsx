"use client";

import React from "react";
import { motion } from "motion/react";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface ShapFeature {
  feature: string;
  shap_value: number;
  feature_value?: number | string;
}

interface ShapWaterfallProps {
  features: ShapFeature[];
  modelName?: string;
  className?: string;
}

export function ShapWaterfall({
  features,
  modelName = "ECMWF AIFS",
  className = "",
}: ShapWaterfallProps) {
  // Find max absolute SHAP value for scaling
  const maxAbs = Math.max(...features.map((f) => Math.abs(f.shap_value)), 0.15);

  return (
    <TooltipProvider>
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-text-primary">
              SHAP Feature Attribution ({modelName})
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-text-muted hover:text-text-primary transition-colors">
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-[11px] leading-relaxed">
                  SHAP (Shapley Additive exPlanations) computes the exact marginal contribution of each synoptic feature to this model&apos;s adaptive weight assignment.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-text-muted">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-xs bg-emerald-500" /> + Weight
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-xs bg-rose-500" /> - Weight
            </span>
          </div>
        </div>

        {/* Feature Bars */}
        <div className="space-y-2.5">
          {features.map((item, idx) => {
            const isPositive = item.shap_value >= 0;
            const pct = Math.min(100, (Math.abs(item.shap_value) / maxAbs) * 100);

            return (
              <div key={item.feature || idx} className="group">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-text-secondary truncate max-w-[200px]">
                    {item.feature}
                  </span>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    {item.feature_value !== undefined && (
                      <span className="text-[11px] text-text-muted">
                        val: {typeof item.feature_value === "number" ? item.feature_value.toFixed(2) : item.feature_value}
                      </span>
                    )}
                    <span
                      className={`font-semibold ${
                        isPositive ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {item.shap_value.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Bidirectional Zero-Axis Bar */}
                <div className="relative flex h-3 w-full items-center rounded-sm bg-surface-secondary overflow-hidden">
                  {/* Center vertical reference line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-border z-10" />

                  {isPositive ? (
                    // Positive bar extends to the right from 50%
                    <div className="absolute left-1/2 h-full flex items-center">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct / 2}%` }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-r-xs bg-emerald-500 group-hover:bg-emerald-600 transition-colors"
                      />
                    </div>
                  ) : (
                    // Negative bar extends to the left from 50%
                    <div className="absolute right-1/2 h-full flex items-center justify-end">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct / 2}%` }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-l-xs bg-rose-500 group-hover:bg-rose-600 transition-colors"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 text-[10px] text-text-muted border-t border-border flex items-center justify-between">
          <span>Baseline E[f(x)] = 0.33</span>
          <span>Computed via TreeSHAP (Causal)</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
