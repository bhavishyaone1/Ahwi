"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CloudSun,
  Layers,
  ShieldAlert,
  Cpu,
  Compass,
  HelpCircle,
  Activity,
  Award,
  Radio,
  Menu,
  X
} from "lucide-react";
import { SystemHealthModal } from "./SystemHealthModal";
import { StatusPill } from "./StatusPill";
import { SystemStatus } from "../lib/types";
import { fetchSystemStatus } from "../lib/api";

const NAV_GROUPS = [
  {
    group: "OBSERVE",
    items: [
      { name: "Overview", href: "/", icon: CloudSun },
      { name: "Forecast", href: "/forecast", icon: Activity },
    ],
  },
  {
    group: "UNDERSTAND",
    items: [
      { name: "Model Intelligence", href: "/models", icon: Cpu },
      { name: "Weight Map", href: "/weight-map", icon: Layers },
      { name: "Climate", href: "/climate", icon: Compass },
    ],
  },
  {
    group: "ACT",
    items: [
      { name: "Extreme Risk", href: "/risk", icon: ShieldAlert },
      { name: "Ask AETHER", href: "/ask", icon: HelpCircle },
    ],
  },
  {
    group: "VERIFY",
    items: [
      { name: "Benchmark", href: "/benchmark", icon: Award },
    ],
  },
];

const MOBILE_NAV_ITEMS = [
  { name: "Overview", href: "/", icon: CloudSun },
  { name: "Forecast", href: "/forecast", icon: Activity },
  { name: "Models", href: "/models", icon: Cpu },
  { name: "Risk", href: "/risk", icon: ShieldAlert },
  { name: "More", href: "/benchmark", icon: Award },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchSystemStatus()
      .then(setStatus)
      .catch(() => {
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
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Branding */}
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-sky-500/20 group-hover:scale-105 transition-transform">
                Æ
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-black tracking-tight text-slate-900">
                    AETHER
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                    PS 26081
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block font-medium">
                  Adaptive Hybrid Weather Intelligence
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Grouped */}
            <nav className="hidden lg:flex items-center space-x-4">
              {NAV_GROUPS.map((grp) => (
                <div key={grp.group} className="flex items-center space-x-1 pl-2 border-l border-slate-200 first:border-l-0 first:pl-0">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 mr-1 hidden xl:inline">
                    {grp.group}
                  </span>
                  {grp.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? "bg-sky-50 text-sky-700 font-semibold shadow-xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? "text-sky-600" : "text-slate-400"}`} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Right Action Controls */}
            <div className="flex items-center space-x-2">
              <StatusPill status={status} />

              <button
                onClick={() => setIsHealthOpen(true)}
                title="Inspect data feed health & latency"
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
              >
                <Radio className="w-4 h-4 text-sky-600 animate-pulse" />
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu if expanded */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
            {NAV_GROUPS.map((grp) => (
              <div key={grp.group} className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {grp.group}
                </span>
                <div className="grid grid-cols-2 gap-1 pl-2">
                  {grp.items.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-1.5 p-2 rounded-lg text-xs font-medium ${
                        pathname === item.href ? "bg-sky-50 text-sky-700 font-bold" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <item.icon className="w-3.5 h-3.5 text-sky-600" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition ${
                isActive ? "text-sky-600 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <SystemHealthModal isOpen={isHealthOpen} onClose={() => setIsHealthOpen(false)} />
    </>
  );
};
