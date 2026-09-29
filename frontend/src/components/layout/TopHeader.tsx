"use client";

import React, { useState, useEffect } from "react";
import { useAetherData } from "@/context/AetherDataContext";
import { INDIAN_STATIONS } from "@/components/map/WeatherMap";
import { SystemStatus } from "@/lib/types";
import { fetchSystemStatus } from "@/lib/api";
import {
  MapPin,
  Calendar,
  RefreshCw,
  Menu,
  ChevronDown,
  Activity,
  Search,
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
        d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
        " · " +
        d.toTimeString().slice(0, 5) +
        " IST"
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  const isReal = status?.data_mode === "REAL";

  return (
    <header className="sticky top-0 z-30 h-14 bg-surface/90 dark:bg-[#0b0d12]/90 backdrop-blur-xl border-b border-border px-4 sm:px-5 flex items-center justify-between transition-colors shadow-[0_1px_0_var(--border)]">
      {/* Left: mobile trigger + location */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition"
          title="Open menu"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        {/* Location dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2/70 border border-border/80 hover:border-border hover:bg-surface-2 text-text-primary transition-all group"
          >
            <MapPin className="h-3 w-3 text-accent shrink-0" />
            <span className="hidden sm:inline text-[9.5px] font-mono uppercase tracking-wider font-bold text-text-muted">
              Station:
            </span>
            <span className="text-[11.5px] font-bold tracking-tight text-text-primary">
              {selectedLocation.name}
            </span>
            <ChevronDown className="h-3 w-3 text-text-muted group-hover:translate-y-0.5 transition-transform shrink-0" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="elevated-glow absolute left-0 top-full mt-1.5 w-64 rounded-2xl bg-surface/98 dark:bg-[#0e1118]/98 backdrop-blur-2xl border border-border shadow-[var(--shadow-panel)] py-1.5 z-30 text-xs max-h-80 overflow-y-auto">
                <span className="px-3.5 py-1.5 text-[9px] font-bold text-text-muted uppercase tracking-[0.1em] block font-mono border-b border-border/50 mb-1">
                  MoES Observation Grid
                </span>
                {INDIAN_STATIONS.map((st) => (
                  <button
                    key={st.name}
                    type="button"
                    onClick={() => {
                      setSelectedLocation({ name: st.name, latitude: st.lat, longitude: st.lon, region: st.region });
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-surface-2/80 transition ${
                      selectedLocation.name === st.name
                        ? "text-accent font-bold bg-accent/8"
                        : "text-text-secondary"
                    }`}
                  >
                    <span className="font-semibold text-text-primary text-[11.5px]">{st.name}</span>
                    <span className="text-[9px] font-mono text-text-muted">
                      {st.lat.toFixed(1)}°N {st.lon.toFixed(1)}°E
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Command palette trigger */}
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-surface-2/60 border border-border/70 hover:bg-surface-2 hover:border-border text-text-muted hover:text-text-primary transition text-[11px] group"
            title="Command Palette (Cmd+K)"
          >
            <Search className="h-3 w-3 text-accent shrink-0" />
            <span className="hidden lg:inline font-medium text-[10.5px]">Search…</span>
            <kbd className="font-mono text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-surface-2 border border-border text-text-muted">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* Right: metadata + controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Clock */}
        <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-text-muted font-mono bg-surface-2/60 border border-border/70 px-2.5 py-1 rounded-full">
          <Calendar className="h-3 w-3 text-text-muted shrink-0" />
          <span className="font-semibold tracking-tight">{currentTime || "—"}</span>
        </div>

        {/* Data mode badge */}
        <button
          onClick={onOpenHealthModal}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9.5px] font-mono font-bold tracking-wider uppercase transition cursor-pointer ${
            isReal
              ? "bg-success/10 text-success border-success/30 hover:bg-success/15"
              : "bg-warning/10 text-warning border-warning/30 hover:bg-warning/15"
          }`}
          title="View telemetry health"
        >
          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${isReal ? "bg-success animate-pulse" : "bg-warning"}`} />
          <span>{isReal ? "LIVE" : "DEMO"}</span>
        </button>

        {/* Trace DAG */}
        <button
          onClick={openTraceDrawer}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-info/8 border border-info/25 text-info text-[9.5px] font-mono font-bold tracking-wider uppercase hover:bg-info/15 transition"
        >
          <Activity className="h-3 w-3" />
          <span className="hidden md:inline">Trace</span>
        </button>

        {/* Refresh */}
        <button
          onClick={async () => {
            try {
              await refresh();
              toast.success("Pipeline refreshed", {
                description: `Re-assimilated blend for ${selectedLocation.name}`,
              });
            } catch {
              toast.error("Failed to refresh pipeline");
            }
          }}
          title="Refresh forecast pipeline"
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-accent" : ""}`} />
        </button>
      </div>
    </header>
  );
};
