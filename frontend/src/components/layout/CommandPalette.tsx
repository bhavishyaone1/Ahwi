"use client";

import React, { useEffect } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useAetherData } from "@/context/AetherDataContext";
import { INDIAN_STATIONS } from "@/components/map/WeatherMap";
import { MAP_LAYERS } from "@/components/map/MapControls";
import { NAV_GROUPS } from "./Sidebar";
import {
  MapPin,
  Layers,
  Compass,
  Search,
  X,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
}) => {
  const router = useRouter();
  const { setSelectedLocation, setActiveLayer } = useAetherData();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        <Command
          label="AETHER Operational Command Palette"
          className="w-full flex flex-col focus:outline-none"
        >
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-surface-secondary/50">
            <Search className="h-4 w-4 text-accent shrink-0" />
            <Command.Input
              placeholder="Search station, operational layer, or page... (ESC to close)"
              className="flex-1 bg-transparent text-xs font-medium text-text-primary placeholder:text-text-muted focus:outline-none"
              autoFocus
            />
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-secondary transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 space-y-1 text-xs">
            <Command.Empty className="py-6 text-center text-xs text-text-muted">
              No matching meteorological stations, layers, or routes found.
            </Command.Empty>

            <Command.Group
              heading="Observation Stations (MoES Subcontinent Grid)"
              className="text-[10px] font-mono uppercase tracking-wider text-text-muted px-2 py-1"
            >
              {INDIAN_STATIONS.map((st) => (
                <Command.Item
                  key={st.name}
                  value={`station ${st.name} ${st.region}`}
                  onSelect={() => {
                    setSelectedLocation({
                      name: st.name,
                      latitude: st.lat,
                      longitude: st.lon,
                      region: st.region,
                    });
                    onOpenChange(false);
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-accent/15 cursor-pointer transition select-none data-[selected=true]:bg-accent/15 data-[selected=true]:text-accent"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
                    <span className="font-semibold text-text-primary">{st.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-text-muted">
                    {st.region} &bull; {st.lat.toFixed(1)}°N, {st.lon.toFixed(1)}°E
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group
              heading="Meteorological Layers"
              className="text-[10px] font-mono uppercase tracking-wider text-text-muted px-2 py-1 pt-2 border-t border-border/50"
            >
              {MAP_LAYERS.map((layer) => {
                const Icon = layer.icon;
                return (
                  <Command.Item
                    key={layer.id}
                    value={`layer ${layer.label}`}
                    onSelect={() => {
                      setActiveLayer(layer.id);
                      onOpenChange(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-accent/15 cursor-pointer transition select-none data-[selected=true]:bg-accent/15 data-[selected=true]:text-accent"
                  >
                    <Icon className="h-3.5 w-3.5 text-accent shrink-0" />
                    <span className="font-semibold text-text-primary">{layer.label}</span>
                  </Command.Item>
                );
              })}
            </Command.Group>

            <Command.Group
              heading="Operational Sections"
              className="text-[10px] font-mono uppercase tracking-wider text-text-muted px-2 py-1 pt-2 border-t border-border/50"
            >
              {NAV_GROUPS.flatMap((g) => g.items).map((item) => {
                const Icon = item.icon;
                return (
                  <Command.Item
                    key={item.href}
                    value={`navigate page ${item.name}`}
                    onSelect={() => {
                      router.push(item.href);
                      onOpenChange(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-accent/15 cursor-pointer transition select-none data-[selected=true]:bg-accent/15 data-[selected=true]:text-accent"
                  >
                    <Icon className="h-3.5 w-3.5 text-accent shrink-0" />
                    <span className="font-semibold text-text-primary">{item.name}</span>
                    <span className="ml-auto font-mono text-[10px] text-text-muted">
                      {item.href}
                    </span>
                  </Command.Item>
                );
              })}
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-surface-secondary/70 text-[10px] font-mono text-text-muted">
            <span>&uarr;&darr; Navigate</span>
            <span>&crarr; Select</span>
            <span>ESC Close</span>
          </div>
        </Command>
      </div>
    </div>
  );
};
