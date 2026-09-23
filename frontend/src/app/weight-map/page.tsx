"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Map as MapLibreMap, Marker, Popup } from "maplibre-gl";
import { useAetherData } from "../../context/AetherDataContext";
import { Layers, MapPin, ZoomIn, ZoomOut, Info, RefreshCw } from "lucide-react";
import { fetchWeightMap } from "@/lib/api";
import { WeightGridPoint } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { pageVariants, fadeUp } from "@/lib/motion";

export default function WeightMapPage() {
  const { variable, setVariable, leadTimeHours, setLeadTimeHours, setSelectedLocation } =
    useAetherData();
  const [selectedModel, setSelectedModel] = useState<string>("Dominant Model");
  const [weightPoints, setWeightPoints] = useState<WeightGridPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPoint, setSelectedPoint] = useState<WeightGridPoint | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  // Load backend weight map data
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchWeightMap(variable, leadTimeHours)
      .then((data) => {
        if (!isMounted) return;
        setWeightPoints(data);
        if (data.length > 0 && !selectedPoint) {
          setSelectedPoint(data[0]);
        }
      })
      .catch((err) => {
        console.warn("Failed to load weight map:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [variable, leadTimeHours]);

  // Initialize MapLibre GL instance
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
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
              attribution: "© OpenStreetMap contributors | AETHER Spatial Dominance",
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
        center: [78.9629, 22.5937],
        zoom: 4.3,
        minZoom: 3.5,
        maxZoom: 9.0,
      });

      map.on("load", () => {
        mapRef.current = map;
      });

      const resizeObserver = new ResizeObserver(() => {
        if (mapRef.current) mapRef.current.resize();
      });
      resizeObserver.observe(mapContainerRef.current);

      return () => {
        resizeObserver.disconnect();
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        map.remove();
        mapRef.current = null;
      };
    } catch (err) {
      console.warn("MapLibre GL failed to initialize for weight map:", err);
    }
  }, []);

  // Update markers when weightPoints or selectedModel changes
  useEffect(() => {
    if (!mapRef.current || weightPoints.length === 0) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    weightPoints.forEach((pt) => {
      const aifsW = pt.weights["ECMWF_AIFS"] || 0;
      const ifsW = pt.weights["ECMWF_IFS"] || 0;
      const gfsW = pt.weights["GFS"] || 0;

      // Determine marker color and size based on selected filter
      let color = "#0284C7"; // Default AIFS
      let displayWeight = aifsW;

      if (selectedModel === "ECMWF Weight") {
        color = "#2563EB";
        displayWeight = ifsW;
      } else if (selectedModel === "GFS Weight") {
        color = "#64748B";
        displayWeight = gfsW;
      } else if (selectedModel === "Dominant Model") {
        if (ifsW > aifsW && ifsW > gfsW) color = "#2563EB";
        else if (gfsW > aifsW && gfsW > ifsW) color = "#64748B";
        else color = "#0284C7";
        displayWeight = Math.max(aifsW, ifsW, gfsW);
      }

      const isSelected = selectedPoint?.station === pt.station;
      const radius = Math.max(18, Math.round(displayWeight * 50));

      const el = document.createElement("div");
      el.className = "cursor-pointer group relative flex items-center justify-center";
      el.style.width = `${radius}px`;
      el.style.height = `${radius}px`;

      el.innerHTML = `
        <div class="h-full w-full rounded-full border-2 ${isSelected ? "border-slate-950 scale-125 ring-4 ring-sky-300" : "border-white"} shadow-md transition-transform group-hover:scale-125 flex items-center justify-center" style="background-color: ${color}cc;">
          <span class="text-[9px] font-bold text-white font-mono drop-shadow-sm">${Math.round(displayWeight * 100)}%</span>
        </div>
        <div class="absolute -bottom-6 hidden whitespace-nowrap rounded bg-slate-950 px-1.5 py-0.5 text-[10px] font-medium text-white shadow-md group-hover:block z-30 pointer-events-none">
          ${pt.station} (${Math.round(displayWeight * 100)}%)
        </div>
      `;

      el.addEventListener("click", () => {
        setSelectedPoint(pt);
        setSelectedLocation({
          name: pt.station,
          latitude: pt.latitude,
          longitude: pt.longitude,
          region: pt.region,
        });
        if (mapRef.current) {
          mapRef.current.flyTo({ center: [pt.longitude, pt.latitude], zoom: 5.5, duration: 600 });
        }
      });

      const marker = new Marker({ element: el })
        .setLngLat([pt.longitude, pt.latitude])
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });
  }, [weightPoints, selectedModel, selectedPoint, setSelectedLocation]);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3 min-w-0">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="badge-scientific text-overline bg-info/10 text-info border border-info/30">
              <Layers className="h-3 w-3 text-info" />
              <span>0.25° Spatial Dominance</span>
            </div>
            <div className="badge-scientific text-overline bg-surface-secondary text-text-muted border border-border">
              <MapPin className="h-3 w-3" />
              <span className="font-mono tabular-nums">{weightPoints.length} Indian Reference Stations</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight mt-1">
            Spatial Model Contribution Map
          </h1>
          <p className="text-xs text-text-muted font-medium">
            Dynamic geographic weight allocation derived from continuous historical skill tracking (0.25° resolution).
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Variable */}
          <select
            value={variable}
            onChange={(e) => setVariable(e.target.value)}
            className="h-8 bg-surface border border-border rounded-lg px-2.5 text-xs font-semibold text-text-primary shadow-sm focus:ring-1 focus:ring-info focus:outline-none transition"
          >
            <option value="rainfall_mm">Precipitation (mm)</option>
            <option value="temperature_c">Temperature (°C)</option>
            <option value="wind_speed_ms">Wind Speed (m/s)</option>
          </select>

          {/* Lead Time */}
          <select
            value={leadTimeHours}
            onChange={(e) => setLeadTimeHours(Number(e.target.value))}
            className="h-8 bg-surface border border-border rounded-lg px-2.5 text-xs font-semibold text-text-primary shadow-sm focus:ring-1 focus:ring-info focus:outline-none transition"
          >
            <option value={6}>+6 hours</option>
            <option value={12}>+12 hours</option>
            <option value={24}>+24 hours</option>
            <option value={48}>+48 hours</option>
            <option value={72}>+72 hours</option>
          </select>

          {/* Model Filter */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="h-8 bg-surface border border-border rounded-lg px-2.5 text-xs font-semibold text-text-primary shadow-sm focus:ring-1 focus:ring-info focus:outline-none transition"
          >
            <option value="Dominant Model">Dominant Ensemble Member</option>
            <option value="AIFS Weight">AIFS Weight Allocation</option>
            <option value="ECMWF Weight">ECMWF IFS Weight Allocation</option>
            <option value="GFS Weight">GFS Weight Allocation</option>
          </select>
        </div>
      </div>

      {/* Main Map + Inspection Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left 8 cols: MapLibre GL Map */}
        <motion.div variants={fadeUp} className="lg:col-span-8 min-w-0">
          <div className="relative w-full h-[540px] bg-surface-secondary rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col justify-between">
            <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />

            {/* Top Overlay Indicator */}
            <div className="absolute top-3 left-3 z-10 glass-panel rounded-lg px-3 py-1.5 text-xs font-semibold text-text-primary shadow-sm flex items-center gap-2">
              <span className="radar-telemetry-dot shrink-0" />
              <span className="font-mono text-overline text-text-primary">Layer: {selectedModel} (+{leadTimeHours}h Horizon)</span>
            </div>

            {/* Bottom Legend */}
            <div className="absolute bottom-3 left-3 z-10 glass-panel rounded-xl p-3 shadow-md text-xs space-y-2 max-w-xs">
              <span className="text-overline text-text-muted block font-semibold">
                Model Allocation Palette
              </span>
              <div className="flex items-center gap-3 text-[11px] font-medium font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent shrink-0" />
                  <span className="font-semibold text-text-primary">AIFS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-500 shrink-0" />
                  <span className="font-semibold text-text-primary">IFS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-500 shrink-0" />
                  <span className="font-semibold text-text-primary">GFS</span>
                </div>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed">
                Marker diameter is proportional to continuous Softmax weight dynamically assigned by XGBoost.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right 4 cols: Regional Inspection Card */}
        <motion.div variants={fadeUp} className="lg:col-span-4 min-w-0 space-y-3">
          <Card className="shadow-sm hover:shadow-md card-interactive border-border bg-surface rounded-2xl overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <span className="text-overline text-text-muted block font-semibold">
                Regional Inspection
              </span>
              <CardTitle className="text-base font-bold text-text-primary">
                {selectedPoint ? selectedPoint.station : "Select Station"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {selectedPoint ? (
                <>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-border">
                    <span className="text-overline text-text-muted">Coordinates:</span>
                    <span className="font-mono tabular-nums text-text-primary font-semibold text-xs">
                      {selectedPoint.latitude.toFixed(2)}°N, {selectedPoint.longitude.toFixed(2)}°E
                    </span>
                  </div>

                  {/* Model Weight Breakdown */}
                  <div className="space-y-2.5">
                    <span className="text-overline text-text-muted block font-semibold">
                      Dynamic Weight Attribution
                    </span>
                    <div className="space-y-2.5">
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-accent">ECMWF AIFS (AI)</span>
                          <span className="font-mono tabular-nums font-bold text-accent">
                            {Math.round((selectedPoint.weights["ECMWF_AIFS"] || 0) * 100)}%
                          </span>
                        </div>
                        <Progress
                          value={Math.round((selectedPoint.weights["ECMWF_AIFS"] || 0) * 100)}
                          indicatorColor="bg-accent"
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-sky-600 dark:text-sky-400">ECMWF IFS (NWP)</span>
                          <span className="font-mono tabular-nums font-bold text-sky-600 dark:text-sky-400">
                            {Math.round((selectedPoint.weights["ECMWF_IFS"] || 0) * 100)}%
                          </span>
                        </div>
                        <Progress
                          value={Math.round((selectedPoint.weights["ECMWF_IFS"] || 0) * 100)}
                          indicatorColor="bg-sky-500"
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-600 dark:text-slate-400">NOAA GFS (NWP)</span>
                          <span className="font-mono tabular-nums font-bold text-slate-600 dark:text-slate-400">
                            {Math.round((selectedPoint.weights["GFS"] || 0) * 100)}%
                          </span>
                        </div>
                        <Progress
                          value={Math.round((selectedPoint.weights["GFS"] || 0) * 100)}
                          indicatorColor="bg-slate-500"
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border space-y-2.5 text-xs font-mono tabular-nums">
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted font-sans text-overline">AETHER Blend:</span>
                      <span className="font-black text-sm text-text-primary">
                        {selectedPoint.blended_forecast} {variable === "rainfall_mm" ? "mm" : "°C"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted font-sans text-overline">Confidence:</span>
                      <span className="font-bold text-success">
                        {Math.round(selectedPoint.confidence)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted font-sans text-overline">Regime:</span>
                      <Badge variant="scientific" className="text-[10px]">
                        {selectedPoint.regime}
                      </Badge>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-xs text-text-muted">
                  {loading ? "Loading spatial grid points..." : "Click any station on the map to inspect."}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
