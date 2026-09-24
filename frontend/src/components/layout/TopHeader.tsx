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
  Search,
  Command as CommandIcon,
} from "lucide-react";
import { toast } from "sonner";

interface TopHeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenHealthModal: () => void;
  onOpenCommandPalette?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onToggleMobileSidebar,
  onOpenHealthModal,
  onOpenCommandPalette,
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

        {/* Location Dropdown selector (Station: Location ▼) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface border border-border/90 hover:bg-surface-secondary text-text-primary transition-all shadow-sm hover:shadow group"
          >
            <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-text-muted hidden sm:inline">
              Station:
            </span>
            <span className="text-xs sm:text-sm font-bold tracking-tight text-text-primary">
              {selectedLocation.name}
            </span>
            <ChevronDown className="h-3 w-3 text-accent group-hover:translate-y-0.5 transition-transform" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="elevated-glow absolute left-0 mt-2 w-64 rounded-2xl bg-surface border border-border shadow-2xl py-2 z-30 text-xs font-medium max-h-80 overflow-y-auto">
                <span className="px-3.5 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.08em] block font-mono border-b border-border/50">
                  Observation Stations (MoES Grid)
                </span>
                <div className="py-1">
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
                      className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-surface-secondary transition ${
                        selectedLocation.name === st.name
                          ? "text-accent font-bold bg-accent/10"
                          : "text-text-secondary"
                      }`}
                    >
                      <span className="font-semibold text-text-primary">{st.name}</span>
                      <span className="text-[10px] font-mono text-text-muted">
                        {st.lat.toFixed(1)}°N, {st.lon.toFixed(1)}°E
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Command Palette Quick Trigger */}
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border/80 hover:bg-surface-2 text-text-muted hover:text-text-primary transition shadow-sm text-xs"
            title="Open Command Palette (Cmd+K / Ctrl+K)"
          >
            <Search className="h-3.5 w-3.5 text-accent" />
            <span className="font-sans text-[11px] font-medium hidden md:inline text-text-muted">Command Palette</span>
            <kbd className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-surface-2 border border-border text-text-muted">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* Center / Right Metadata & Status Bar */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Date / Timestamp */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-text-muted font-mono bg-surface-2 border border-border/80 px-3 py-1 rounded-full shadow-sm">
          <Calendar className="h-3.5 w-3.5 text-text-muted shrink-0" />
          <span className="font-bold tracking-tight">{currentTime || "23 Sep 2026 • 00:00 UTC"}</span>
        </div>

        {/* Status Pill */}
        <div
          onClick={onOpenHealthModal}
          className={`cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-mono font-bold tracking-wider uppercase transition shadow-sm ${
            isReal
              ? "bg-success/10 text-success border-success/30"
              : "bg-warning/10 text-warning border-warning/30"
          }`}
          title="Click to view telemetry & data mode health"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isReal ? "bg-success animate-pulse" : "bg-warning"
            }`}
          />
          <span>{isReal ? "LIVE INGESTION" : "DEMO REPLAY"}</span>
        </div>

        {/* Forecast Trace CTA Button */}
        <button
          onClick={openTraceDrawer}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-info/10 border border-info/30 text-info text-[10px] font-mono font-bold tracking-wider uppercase hover:bg-info/20 transition shadow-sm"
        >
          <Activity className="h-3 w-3 text-info" />
          <span>Trace DAG</span>
        </button>

        {/* Refresh pipeline with Sonner Toast */}
        <button
          onClick={async () => {
            try {
              await refresh();
              toast.success("Telemetry pipeline re-assimilated", {
                description: `Refreshed multi-model blend for ${selectedLocation.name}`,
              });
            } catch {
              toast.error("Failed to refresh forecast pipeline");
            }
          }}
          title="Refresh forecast pipeline"
          className="p-1.5 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-surface-2 transition"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-accent" : ""}`} />
        </button>
      </div>
    </header>
  );
};
