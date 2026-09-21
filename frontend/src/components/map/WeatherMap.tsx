"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Map as MapLibreMap, Marker } from "maplibre-gl";
import { LocationInfo } from "@/lib/types";
import { MapControls } from "./MapControls";
import { MapLegend } from "./MapLegend";
import { MapTimeline, TIME_STEPS } from "./MapTimeline";
import { MapPin, Navigation, Sparkles } from "lucide-react";

export interface StationLocation {
  name: string;
  lat: number;
  lon: number;
  region: string;
}

export const INDIAN_STATIONS: StationLocation[] = [
  { name: "Delhi NCR", lat: 28.6139, lon: 77.2090, region: "North India" },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777, region: "West Coast" },
  { name: "Chennai", lat: 13.0827, lon: 80.2707, region: "South East" },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639, region: "East India" },
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946, region: "South Interior" },
  { name: "Hyderabad", lat: 17.3850, lon: 78.4867, region: "Deccan" },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714, region: "West" },
  { name: "Guwahati", lat: 26.1445, lon: 91.7362, region: "Northeast" },
  { name: "Bhubaneswar", lat: 20.2961, lon: 85.8245, region: "East Coast" },
  { name: "Shimla", lat: 31.1048, lon: 77.1734, region: "Western Himalayas" },
];

export interface WeatherMapProps {
  selectedStation: LocationInfo;
  onSelectStation: (st: LocationInfo) => void;
  variable: string;
  currentValue?: number;
  confidence?: number;
  dominantModel?: string;
  regime?: string;
  leadTimeHours: number;
  onLeadTimeChange: (h: number) => void;
  activeLayer: string;
  onLayerChange: (layer: string) => void;
}

export const WeatherMap: React.FC<WeatherMapProps> = ({
  selectedStation,
  onSelectStation,
  variable,
  currentValue = 42.3,
  confidence = 78,
  dominantModel = "ECMWF_AIFS",
  regime = "HEAVY_RAIN",
  leadTimeHours,
  onLeadTimeChange,
  activeLayer,
  onLayerChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  // Time playback loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const idx = TIME_STEPS.findIndex((t) => t.hours === leadTimeHours);
      const nextIdx = (idx + 1) % TIME_STEPS.length;
      onLeadTimeChange(TIME_STEPS[nextIdx].hours);
    }, 2500);
    return () => clearInterval(interval);
  }, [isPlaying, leadTimeHours, onLeadTimeChange]);

  // Check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setWebglSupported(false);
      }
    } catch {
      setWebglSupported(false);
    }
  }, []);

  // Initialize MapLibre GL
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !webglSupported) return;

    try {
      // MapLibre default light basemap
      const map = new MapLibreMap({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: [
                "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              ],
              tileSize: 256,
              attribution: "© OpenStreetMap contributors | AETHER Meteorological Engine",
            },
          },
          layers: [
            {
              id: "osm-tiles",
              type: "raster",
              source: "osm",
              minzoom: 0,
              maxzoom: 18,
              paint: {
                "raster-opacity": 0.85,
                "raster-saturation": -0.6,
                "raster-contrast": 0.1,
              },
            },
          ],
        },
        center: [selectedStation.longitude || 77.2090, selectedStation.latitude || 28.6139],
        zoom: 4.8,
        minZoom: 3.5,
        maxZoom: 9.5,
      });

      map.on("load", () => {
        setMapLoaded(true);
        mapRef.current = map;

        // Add Station Markers with custom DOM elements
        INDIAN_STATIONS.forEach((st) => {
          const isSelected = st.name === selectedStation.name;

          const el = document.createElement("div");
          el.className = "station-marker group cursor-pointer";
          el.innerHTML = `
            <div class="relative flex items-center justify-center">
              <div class="h-3.5 w-3.5 rounded-full ${isSelected ? "bg-sky-600 ring-4 ring-sky-200" : "bg-slate-700 ring-2 ring-white"} shadow-md transition-transform group-hover:scale-125"></div>
              <span class="absolute -bottom-5 whitespace-nowrap rounded bg-slate-900/90 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-xs pointer-events-none">
                ${st.name}
              </span>
            </div>
          `;

          el.addEventListener("click", () => {
            onSelectStation({
              name: st.name,
              latitude: st.lat,
              longitude: st.lon,
              state: st.region,
              station_id: `STN_${st.name.toUpperCase().replace(/\s+/g, "_")}`,
            });
            map.flyTo({ center: [st.lon, st.lat], zoom: 6, duration: 800 });
          });

          const marker = new Marker({ element: el })
            .setLngLat([st.lon, st.lat])
            .addTo(map);

          markersRef.current.push(marker);
        });
      });

      map.on("error", (e) => {
        console.warn("MapLibre GL Notice:", e);
      });

      return () => {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        map.remove();
        mapRef.current = null;
      };
    } catch (err) {
      console.warn("MapLibre GL failed to initialize, switching to fallback:", err);
      setWebglSupported(false);
    }
  }, [webglSupported, onSelectStation, selectedStation.name]);

  // Update selected marker flyTo when station changes externally
  useEffect(() => {
    if (mapRef.current && selectedStation.longitude && selectedStation.latitude) {
      mapRef.current.flyTo({
        center: [selectedStation.longitude, selectedStation.latitude],
        duration: 700,
        essential: true,
      });
    }
  }, [selectedStation]);

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [78.9629, 22.5937],
        zoom: 4.6,
        duration: 700,
      });
    }
  };

  return (
    <div className="relative w-full h-[580px] rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-xs flex flex-col justify-between select-none">
      {/* Top Map Layer Controls */}
      <MapControls
        activeLayer={activeLayer}
        onLayerChange={onLayerChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
      />

      {/* Main Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-full absolute inset-0 z-0 bg-slate-100"
      />

      {/* Meteorological SVG Layer Overlay on Top of Map */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        <svg
          className="h-full w-full opacity-65 transition-opacity duration-300"
          viewBox="0 0 800 600"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="rainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#08519c" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#2171b5" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6baed6" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="tempGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d7301f" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#ef6548" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#fdbb84" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="riskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#ea580c" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Dynamic weather layer based on activeLayer */}
          {activeLayer === "rainfall" && (
            <g>
              <ellipse cx="380" cy="240" rx="140" ry="110" fill="url(#rainGrad)" />
              <ellipse cx="440" cy="270" rx="90" ry="70" fill="#08306b" fillOpacity="0.4" />
              <ellipse cx="340" cy="380" rx="120" ry="90" fill="url(#rainGrad)" />
            </g>
          )}

          {activeLayer === "temperature" && (
            <g>
              <ellipse cx="400" cy="280" rx="180" ry="140" fill="url(#tempGrad)" />
              <ellipse cx="360" cy="320" rx="110" ry="80" fill="#b30000" fillOpacity="0.35" />
            </g>
          )}

          {activeLayer === "risk" && (
            <g>
              <ellipse cx="370" cy="230" rx="130" ry="100" fill="url(#riskGrad)" />
              <circle cx="370" cy="230" r="50" fill="#dc2626" fillOpacity="0.45" />
            </g>
          )}

          {activeLayer === "trust" && (
            <g stroke="#0284C7" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.4">
              <line x1="100" y1="0" x2="100" y2="600" />
              <line x1="250" y1="0" x2="250" y2="600" />
              <line x1="400" y1="0" x2="400" y2="600" />
              <line x1="550" y1="0" x2="550" y2="600" />
              <line x1="700" y1="0" x2="700" y2="600" />
            </g>
          )}
        </svg>
      </div>

      {/* Floating Selected Station Label */}
      <div className="absolute top-16 right-3 z-20 rounded-md border border-slate-200 bg-white/95 px-3 py-2 shadow-xs backdrop-blur-xs text-xs pointer-events-auto max-w-[220px]">
        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mb-0.5">
          <MapPin className="h-3 w-3 text-sky-600" />
          <span className="font-semibold text-slate-800">{selectedStation.name}</span>
          <span className="text-[10px] font-mono text-slate-400">
            {selectedStation.latitude.toFixed(2)}°N, {selectedStation.longitude.toFixed(2)}°E
          </span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
          <span className="text-slate-600">AETHER Forecast:</span>
          <span className="font-mono font-bold text-sky-700">
            {currentValue} {variable === "rainfall_mm" ? "mm" : variable === "temperature_c" ? "°C" : "m/s"}
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
          <span>Trust: <strong className="text-slate-700">{dominantModel.replace("_", " ")}</strong></span>
          <span>Conf: <strong className="text-emerald-700">{confidence}%</strong></span>
        </div>
      </div>

      {/* Dynamic Layer Legend */}
      <MapLegend activeLayer={activeLayer} />

      {/* Bottom Timeline Control */}
      <MapTimeline
        currentHours={leadTimeHours}
        onChangeHours={onLeadTimeChange}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
      />
    </div>
  );
};
