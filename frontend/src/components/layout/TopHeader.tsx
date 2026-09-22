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
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-surface-secondary text-text-primary transition shadow-xs group"
          >
            <MapPin className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="text-xs font-semibold text-text-muted hidden sm:inline">
              Dashboard:
            </span>
            <span className="text-xs font-bold text-text-primary">
              {selectedLocation.name}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-text-muted group-hover:text-text-primary transition-transform" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-1.5 w-56 rounded-lg bg-surface border border-border shadow-lg py-1.5 z-30 text-xs font-medium max-h-80 overflow-y-auto">
                <span className="px-3 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider block">
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
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-surface-secondary transition ${
                      selectedLocation.name === st.name
                        ? "text-sky-700 dark:text-sky-300 font-bold bg-sky-50/60 dark:bg-sky-950/40"
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
        {/* Date / Timestamp from reference */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-text-muted font-mono bg-surface-secondary/70 border border-border px-2.5 py-1 rounded-md">
          <Calendar className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
          <span>{currentTime || "22 Sep 2026 • 00:00 UTC"}</span>
        </div>

        {/* Status Pill (REAL DATA vs DEMO MODE) */}
        <div
          onClick={onOpenHealthModal}
          className={`cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold transition ${
            isReal
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
          }`}
          title="Click to view telemetry & data mode health"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isReal ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <span>{isReal ? "● REAL DATA" : "● DEMO MODE"}</span>
        </div>

        {/* Forecast Trace CTA Button */}
        <button
          onClick={openTraceDrawer}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-bold hover:bg-sky-100 dark:hover:bg-sky-900 transition"
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
