"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "motion/react";

interface ModelWeightDonutProps {
  weights: {
    aifs: number;
    ecmwf: number;
    gfs: number;
  };
  className?: string;
}

export function ModelWeightDonut({ weights, className = "" }: ModelWeightDonutProps) {
  const data = [
    { name: "ECMWF AIFS", value: Math.round(weights.aifs * 100), color: "#0284C7" },
    { name: "ECMWF IFS", value: Math.round(weights.ecmwf * 100), color: "#2563EB" },
    { name: "NOAA GFS", value: Math.round(weights.gfs * 100), color: "#64748B" },
  ];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative h-44 w-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={52}
              outerRadius={72}
              paddingAngle={3}
              dataKey="value"
              animationDuration={600}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: any) => [`${val}%`, "Weight"]}
              contentStyle={{
                backgroundColor: "#0F172A",
                color: "#FFFFFF",
                borderRadius: "6px",
                fontSize: "11px",
                border: "none",
                padding: "6px 10px",
              }}
              itemStyle={{ color: "#FFFFFF" }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            AETHER
          </span>
          <span className="text-xs font-bold text-slate-800 leading-tight">
            MODEL<br />WEIGHTS
          </span>
        </div>
      </div>

      {/* Legend with motion bars */}
      <div className="mt-3 w-full space-y-1.5 px-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-600 font-medium">{item.name}</span>
            </div>
            <motion.span
              key={item.value}
              initial={{ scale: 0.95, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="font-mono font-semibold text-slate-900"
            >
              {item.value}%
            </motion.span>
          </div>
        ))}
      </div>
    </div>
  );
}
