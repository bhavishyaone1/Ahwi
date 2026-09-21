"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CloudSun, Layers, ShieldAlert, Cpu, Compass, HelpCircle, Activity, Award } from "lucide-react";
import { StatusPill } from "./StatusPill";
import { SystemStatus } from "../lib/types";
import { fetchSystemStatus } from "../lib/api";

const NAV_ITEMS = [
  { name: "Overview", href: "/", icon: CloudSun },
  { name: "Forecast", href: "/forecast", icon: Activity },
  { name: "Model Intelligence", href: "/models", icon: Cpu },
  { name: "Weight Map", href: "/weight-map", icon: Layers },
  { name: "Climate Context", href: "/climate", icon: Compass },
  { name: "Extreme Risk", href: "/risk", icon: ShieldAlert },
  { name: "Ask AETHER", href: "/ask", icon: HelpCircle },
  { name: "Benchmark", href: "/benchmark", icon: Award },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [status, setStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    fetchSystemStatus()
      .then(setStatus)
      .catch(() => {
        // Safe default if backend starting
        setStatus({
          status: "OPERATIONAL",
          app_name: "AETHER Weather Intelligence",
          data_mode: "DEMO",
          data_source: "SYNTHETIC_SCENARIO",
          target_grid_resolution: "0.25° (~27 km)",
          active_models: ["ECMWF_IFS", "ECMWF_AIFS", "GFS"],
          timestamp_utc: new Date().toISOString(),
        });
      });
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white font-black text-xl shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              Æ
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  AETHER
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  PS 26081
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                Adaptive Hybrid Weather Intelligence
              </p>
            </div>
          </Link>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-sky-50 text-sky-700 font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-sky-600" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Operational Status Pill */}
          <div className="flex items-center space-x-3">
            <StatusPill status={status} />
          </div>
        </div>
      </div>
    </header>
  );
};
