"use client";

import React, { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, Marker } from "maplibre-gl";
import { LocationInfo } from "@/lib/types";
import { MapControls } from "./MapControls";
import { MapLegend } from "./MapLegend";
import { MapTimeline, TIME_STEPS } from "./MapTimeline";
import { MapPin, CloudRain, Thermometer, Wind, Sparkles, ShieldAlert } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

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
  currentValue,
  confidence,
  dominantModel = "ECMWF_AIFS",
  regime = "HEAVY_RAIN",
  leadTimeHours,
  onLeadTimeChange,
  activeLayer,
  onLayerChange,
}) => {
  const { theme } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, { marker: Marker; dotEl: HTMLElement }>>(new Map());
  const onSelectStationRef = useRef(onSelectStation);
  onSelectStationRef.current = onSelectStation;

  const windCanvasRef = useRef<HTMLCanvasElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layersVisible, setLayersVisible] = useState(true);

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

  // Initialize MapLibre GL once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !webglSupported) return;

    try {
      const isDark = document.documentElement.classList.contains("dark");

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
                "raster-saturation": isDark ? -0.95 : -0.6,
                "raster-contrast": isDark ? 0.4 : 0.1,
                "raster-brightness-max": isDark ? 0.45 : 1.0,
                "raster-brightness-min": isDark ? 0.05 : 0.0,
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

        // Station simulated / calibrated baseline readings for marker tags (OpenWeather reference style)
        const stationValues: Record<string, number> = {
          "Delhi NCR": 42.3,
          "Mumbai": 68.1,
          "Chennai": 24.5,
          "Kolkata": 55.0,
          "Bengaluru": 18.2,
          "Hyderabad": 29.4,
          "Ahmedabad": 14.8,
          "Guwahati": 62.7,
          "Bhubaneswar": 51.3,
          "Shimla": 31.6,
        };

        // Add Station Markers with custom DOM elements (OpenWeather reference style)
        INDIAN_STATIONS.forEach((st) => {
          const isSelected = st.name === selectedStation.name;
          const stVal = stationValues[st.name] ?? 25.0;

          const el = document.createElement("div");
          el.className = "station-marker group cursor-pointer transition-transform duration-200 hover:scale-110 select-none";

          const pill = document.createElement("div");
          pill.className = `flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shadow-md transition-all ${
            isSelected
              ? "bg-[#18181b] text-white ring-2 ring-[#e87a53] border border-[#e87a53] scale-105"
              : "bg-surface/90 text-text-primary border border-border/80 hover:border-[#e87a53]/50"
          }`;

          const valBadge = document.createElement("span");
          valBadge.className = `px-1 rounded-sm text-[9px] font-bold ${
            isSelected
              ? "bg-[#e87a53] text-slate-950"
              : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
          }`;
          valBadge.textContent = `${Math.round(stVal)}`;

          const nameSpan = document.createElement("span");
          nameSpan.className = "tracking-tight whitespace-nowrap";
          nameSpan.textContent = st.name;

          pill.appendChild(valBadge);
          pill.appendChild(nameSpan);
          el.appendChild(pill);

          el.addEventListener("click", () => {
            onSelectStationRef.current({
              name: st.name,
              latitude: st.lat,
              longitude: st.lon,
              region: st.region,
              station_id: `STN_${st.name.toUpperCase().replace(/\s+/g, "_")}`,
            });
            map.flyTo({ center: [st.lon, st.lat], zoom: 6, duration: 800 });
          });

          const marker = new Marker({ element: el })
            .setLngLat([st.lon, st.lat])
            .addTo(map);

          markersRef.current.set(st.name, { marker, dotEl: pill });
        });
      });

      map.on("error", (e) => {
        console.warn("MapLibre GL Notice:", e);
      });

      const resizeObserver = new ResizeObserver(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);

      return () => {
        resizeObserver.disconnect();
        markersRef.current.forEach(({ marker }) => marker.remove());
        markersRef.current.clear();
        map.remove();
        mapRef.current = null;
      };
    } catch (err) {
      console.warn("MapLibre GL failed to initialize, switching to fallback:", err);
      setWebglSupported(false);
    }
  }, [webglSupported]);

  // Adjust basemap raster paint when Light / Dark theme toggles
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const isDark = theme === "dark";

    try {
      mapRef.current.setPaintProperty("osm-tiles", "raster-saturation", isDark ? -0.95 : -0.6);
      mapRef.current.setPaintProperty("osm-tiles", "raster-contrast", isDark ? 0.4 : 0.1);
      mapRef.current.setPaintProperty("osm-tiles", "raster-brightness-max", isDark ? 0.45 : 1.0);
      mapRef.current.setPaintProperty("osm-tiles", "raster-brightness-min", isDark ? 0.05 : 0.0);
    } catch (err) {
      // Ignore if style layer not ready
    }
  }, [theme, mapLoaded]);

  // Update selected marker highlight and flyTo without rebuilding the map
  useEffect(() => {
    markersRef.current.forEach(({ dotEl }, name) => {
      const isSelected = name === selectedStation.name;
      dotEl.className = `flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shadow-md transition-all ${
        isSelected
          ? "bg-[#18181b] text-white ring-2 ring-[#e87a53] border border-[#e87a53] scale-105"
          : "bg-surface/90 text-text-primary border border-border/80 hover:border-[#e87a53]/50"
      }`;
    });

    if (mapRef.current && selectedStation.longitude && selectedStation.latitude) {
      mapRef.current.flyTo({
        center: [selectedStation.longitude, selectedStation.latitude],
        duration: 700,
        essential: true,
      });
    }
  }, [selectedStation.name, selectedStation.longitude, selectedStation.latitude]);

  // Animated Wind Particles Canvas loop
  useEffect(() => {
    if (activeLayer !== "wind") return;
    const canvas = windCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: Array<{ x: number; y: number; speed: number; length: number; opacity: number }> = [];
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 1.0 + Math.random() * 2.2,
        length: 8 + Math.random() * 12,
        opacity: 0.2 + Math.random() * 0.6,
      });
    }

    let animId: number;
    const isDark = theme === "dark";
    const strokeColor = isDark ? "#7dd3fc" : "#0369a1";

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 1.3;
      ctx.strokeStyle = strokeColor;

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.globalAlpha = p.opacity;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.length * 0.8, p.y - p.length * 0.5);
        ctx.stroke();

        p.x += p.speed * 0.8;
        p.y -= p.speed * 0.5;

        if (p.x > canvas.width || p.y < 0) {
          p.x = Math.random() * (canvas.width * 0.7);
          p.y = canvas.height + Math.random() * 20;
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeLayer, theme]);

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

  const handleSearchStation = (query: string) => {
    setSearchQuery(query);
    const q = query.toLowerCase().trim();
    if (!q) return;
    const found = INDIAN_STATIONS.find(
      (s) => s.name.toLowerCase().includes(q) || s.region.toLowerCase().includes(q)
    );
    if (found) {
      onSelectStationRef.current({
        name: found.name,
        latitude: found.lat,
        longitude: found.lon,
        region: found.region,
      });
    }
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl border border-border/90 bg-surface-secondary overflow-hidden shadow-xl flex flex-col justify-between select-none">
      {/* Top Map Layer Controls & Floating Search */}
      <MapControls
        activeLayer={activeLayer}
        onLayerChange={onLayerChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchStation}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => {
          if (!document.fullscreenElement) {
            mapContainerRef.current?.parentElement?.requestFullscreen?.();
            setIsFullscreen(true);
          } else {
            document.exitFullscreen?.();
            setIsFullscreen(false);
          }
        }}
        layersVisible={layersVisible}
        onToggleLayersVisible={() => setLayersVisible(!layersVisible)}
      />

      {/* MapLibre DOM Container */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 z-0 h-full w-full bg-surface-secondary"
      >
        {!webglSupported && (
          <div className="flex h-full w-full items-center justify-center p-6 text-center text-xs text-text-muted">
            WebGL acceleration not detected. Using 2D meteorological cartographic fallback.
          </div>
        )}
      </div>

      {/* Weather Layer Overlays */}
      {layersVisible && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          <svg
            className="h-full w-full"
            viewBox="0 0 800 600"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <radialGradient id="precipCore" cx="48%" cy="38%" r="35%">
                <stop offset="0%" stopColor="#49006a" stopOpacity="0.8" />
                <stop offset="25%" stopColor="#7a0177" stopOpacity="0.65" />
                <stop offset="50%" stopColor="#ae017e" stopOpacity="0.5" />
                <stop offset="75%" stopColor="#dd3497" stopOpacity="0.35" />
                <stop offset="90%" stopColor="#f768a1" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#fa9fb5" stopOpacity="0.0" />
              </radialGradient>

              <radialGradient id="tempGrad" cx="50%" cy="45%" r="40%">
                <stop offset="0%" stopColor="#67000d" stopOpacity="0.75" />
                <stop offset="35%" stopColor="#d7301f" stopOpacity="0.55" />
                <stop offset="70%" stopColor="#fc8d59" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#fee8c8" stopOpacity="0.0" />
              </radialGradient>

              <radialGradient id="riskGrad" cx="46%" cy="36%" r="32%">
                <stop offset="0%" stopColor="#990000" stopOpacity="0.85" />
                <stop offset="45%" stopColor="#d7301f" stopOpacity="0.6" />
                <stop offset="85%" stopColor="#fc8d59" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
              </radialGradient>
            </defs>

            {activeLayer === "rainfall" && (
              <g>
                <ellipse cx="380" cy="240" rx="160" ry="120" fill="url(#precipCore)" />
                <ellipse cx="410" cy="260" rx="90" ry="70" fill="#ae017e" fillOpacity="0.45" />
                <circle cx="430" cy="250" r="40" fill="#49006a" fillOpacity="0.55" />
              </g>
            )}

            {activeLayer === "temperature" && (
              <g>
                <ellipse cx="400" cy="280" rx="180" ry="140" fill="url(#tempGrad)" />
                <ellipse cx="360" cy="320" rx="110" ry="80" fill="#b30000" fillOpacity="0.35" />
              </g>
            )}

            {activeLayer === "satellite" && (
              <g opacity="0.8">
                <ellipse cx="390" cy="250" rx="150" ry="110" fill="#FFFFFF" fillOpacity="0.55" />
                <ellipse cx="420" cy="260" rx="90" ry="70" fill="#E2E8F0" fillOpacity="0.65" />
                <circle cx="430" cy="250" r="45" fill="#CBD5E1" fillOpacity="0.75" />
                <ellipse cx="320" cy="390" rx="110" ry="80" fill="#FFFFFF" fillOpacity="0.45" />
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
      )}

      {/* Animated Wind Particles Canvas */}
      {layersVisible && activeLayer === "wind" && (
        <canvas
          ref={windCanvasRef}
          id="wind-particles-canvas"
          className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-75"
        />
      )}

      {/* Floating Selected Station Observation Card (OpenWeather reference style) */}
      <div className="elevated-glow absolute top-16 right-3 z-20 rounded-2xl border border-white/10 dark:border-white/15 bg-surface/95 dark:bg-[#12161f]/95 shadow-2xl backdrop-blur-xl text-xs pointer-events-auto min-w-[250px] max-w-[270px] overflow-hidden transition-all">
        {/* Thin gradient accent strip across the top */}
        <div className="h-1 w-full bg-gradient-to-r from-[#e87a53] via-amber-400 to-sky-400" />

        <div className="p-4 space-y-3">
          {/* Main large readout matching OpenWeather (-8.8 °C with weather icon) */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-4xl font-black font-mono tracking-tight text-text-primary">
                {currentValue !== undefined ? currentValue : "--"}
              </span>
              <span className="text-sm font-bold font-mono text-text-muted ml-1">
                {variable === "rainfall_mm" ? "mm" : variable === "temperature_c" ? "°C" : "m/s"}
              </span>
            </div>
            {/* Icon in a gradient chip */}
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#e87a53] via-[#f97316] to-amber-400 text-slate-950 flex items-center justify-center shadow-md shadow-amber-600/35 shrink-0">
              {variable === "rainfall_mm" ? (
                <CloudRain className="h-5 w-5" />
              ) : variable === "temperature_c" ? (
                <Thermometer className="h-5 w-5" />
              ) : (
                <Wind className="h-5 w-5" />
              )}
            </div>
          </div>

          {/* Station name and coordinates */}
          <div className="flex items-center justify-between text-text-muted text-[11px] pb-2 border-b border-border/60">
            <div className="flex items-center gap-1.5 font-bold text-text-primary truncate">
              <MapPin className="h-3.5 w-3.5 text-[#e87a53] shrink-0" />
              <span className="truncate">{selectedStation.name}</span>
            </div>
            <span className="font-mono text-[10px] shrink-0">
              {selectedStation.latitude.toFixed(1)}°N, {selectedStation.longitude.toFixed(1)}°E
            </span>
          </div>

          {/* Tabular breakdown matching OpenWeather reference */}
          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-text-muted font-sans">Feels like</span>
              <span className="font-semibold text-text-primary">
                {variable === "temperature_c" && currentValue ? `${(currentValue + 2.1).toFixed(1)} °C` : "32.4 °C"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted font-sans">Precipitation</span>
              <span className="font-semibold text-text-primary">
                {variable === "rainfall_mm" && currentValue ? `${currentValue} mm` : "1.2 mm"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted font-sans">Wind speed</span>
              <span className="font-semibold text-text-primary">
                {variable === "wind_speed_ms" && currentValue ? `${currentValue} m/s` : "4.8 m/s"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted font-sans">Wind Direction</span>
              <span className="font-semibold text-text-primary">240 deg (WSW)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted font-sans">Humidity</span>
              <span className="font-semibold text-text-primary">78 %</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted font-sans">Clouds</span>
              <span className="font-semibold text-text-primary">85 %</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted font-sans">Pressure</span>
              <span className="font-semibold text-text-primary">1008 hPa</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-border/50">
              <span className="text-text-muted font-sans">Dominant Model</span>
              <span className="font-bold text-[#e87a53] dark:text-[#f89b78]">
                {dominantModel.replace("ECMWF_", "")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted font-sans">Confidence</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {confidence !== undefined ? `${confidence}%` : "--"}
              </span>
            </div>
          </div>
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
