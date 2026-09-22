"use client";

import React, { useState, useEffect } from "react";
import { useAetherData } from "@/context/AetherDataContext";
import { INDIAN_STATIONS } from "@/components/map/WeatherMap";
import { SystemStatus } from "@/lib/types";
import { fetchSystemStatus } from "@/lib/api";
import {
  MapPin,
  Calendar,
  Clock,
  RefreshCw,
  Menu,
  ChevronDown,
  Activity,
  Layers,
  Radio,
} from "lucide-react";

interface TopHeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenHealthModal: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onToggleMobileSidebar,
  onOpenHealthModal,
}) => {
  const {
    selectedLocation,
    setSelectedLocation,
    loading,
    refresh,
    data,
    openTraceDrawer,
  } = useAetherData();

  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

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

    const updateClock = () => {
      const d = new Date();
      setCurrentTime(
        d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
          " • " +
          d.toTimeString().slice(0, 5) +
          " UTC"
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  const isReal = status?.data_mode === "REAL";

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface/90 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-1.5 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-surface-secondary transition"
          title="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Location Dropdown selector (Dashboard: Location ▼) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface border border-border/90 hover:bg-surface-secondary text-text-primary transition-all shadow-md hover:shadow-lg group"
          >
            <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
            <span className="text-xs font-semibold text-text-muted hidden sm:inline">
              Dashboard:
            </span>
            <span className="text-sm font-black tracking-tight text-text-primary">
              {selectedLocation.name}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-orange-500 group-hover:translate-y-0.5 transition-transform" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-60 rounded-2xl bg-surface border border-border/90 shadow-xl py-2 z-30 text-xs font-medium max-h-80 overflow-y-auto">
                <span className="px-3.5 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                  Select Observation Station
                </span>
                {INDIAN_STATIONS.map((st) => (
                  <button
                    key={st.name}
                    type="button"
                    onClick={() => {
                      setSelectedLocation({
                        name: st.name,
                        latitude: st.lat,
                        longitude: st.lon,
                        region: st.region,
                      });
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-surface-secondary transition ${
                      selectedLocation.name === st.name
                        ? "text-orange-600 dark:text-orange-400 font-bold bg-orange-500/10 dark:bg-orange-950/30"
                        : "text-text-secondary"
                    }`}
                  >
                    <span>{st.name}</span>
                    <span className="text-[10px] font-mono text-text-muted">
                      {st.region}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center / Right Metadata & Status Bar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date / Timestamp from reference (fuller pill shape + shadow) */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-text-muted font-mono bg-surface-secondary/80 border border-border/80 px-3 py-1 rounded-full shadow-sm">
          <Calendar className="h-3.5 w-3.5 text-text-muted" />
          <span>{currentTime || "22 Sep 2026 • 00:00 UTC"}</span>
        </div>

        {/* Status Pill (fuller pill shape + shadow) */}
        <div
          onClick={onOpenHealthModal}
          className={`cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition shadow-sm ${
            isReal
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-emerald-500/20"
              : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-amber-500/20"
          }`}
          title="Click to view telemetry & data mode health"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isReal ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <span>{isReal ? "REAL DATA" : "DEMO MODE"}</span>
        </div>

        {/* Forecast Trace CTA Button (fuller pill shape + shadow) */}
        <button
          onClick={openTraceDrawer}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-sky-500/10 to-sky-600/20 dark:from-sky-950/60 dark:to-sky-900/40 border border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 text-xs font-bold hover:from-sky-500/20 hover:to-sky-600/30 shadow-sm shadow-sky-500/20 transition"
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Trace</span>
        </button>

        {/* Refresh pipeline */}
        <button
          onClick={refresh}
          title="Refresh forecast pipeline"
          className="p-1.5 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-surface-secondary transition"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-sky-600" : ""}`} />
        </button>
      </div>
    </header>
  );
};
