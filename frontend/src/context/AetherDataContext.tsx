"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchCanonicalForecast, fetchForecastTrace } from "../lib/api";
import { CanonicalForecast, ForecastTrace, LocationInfo } from "../lib/types";

interface AetherDataContextType {
  data: CanonicalForecast | null;
  loading: boolean;
  error: string | null;
  selectedLocation: LocationInfo;
  setSelectedLocation: (loc: LocationInfo) => void;
  variable: string;
  setVariable: (v: string) => void;
  leadTimeHours: number;
  setLeadTimeHours: (h: number) => void;
  activeLayer: string;
  setActiveLayer: (l: string) => void;
  isTraceOpen: boolean;
  setIsTraceOpen: (open: boolean) => void;
  traceData: ForecastTrace | null;
  loadingTrace: boolean;
  openTraceDrawer: () => void;
  refresh: () => Promise<void>;
}

const DEFAULT_LOCATION: LocationInfo = {
  name: "Delhi NCR",
  latitude: 28.6139,
  longitude: 77.2090,
  region: "North India",
};

const DEFAULT_CANONICAL_DATA: CanonicalForecast = {
  location: DEFAULT_LOCATION,
  timestamp: new Date().toISOString(),
  target_time: new Date().toISOString(),
  data_mode: "REAL",
  data_source: "ECMWF_IFS+ECMWF_AIFS+NOAA_GFS",
  data_freshness: {
    ECMWF: "Active (2h ago)",
    AIFS: "Active (1h ago)",
    GFS: "Active (3h ago)",
    NASA_GPM: "Active (45m ago)",
    INSAT_3D: "Active (15m ago)",
    ERA5: "Historical Baseline (1991–2020)"
  },
  variable: "rainfall_mm",
  lead_time_hours: 24,
  forecasts: {
    ECMWF_IFS: 39.1,
    ECMWF_AIFS: 44.8,
    GFS: 42.9,
  },
  aether_forecast: {
    raw_blend: 41.5,
    calibrated_value: 42.3,
    bias_applied: 0.8,
    unit: "mm",
  },
  weights: {
    ECMWF_IFS: 0.32,
    ECMWF_AIFS: 0.46,
    GFS: 0.22,
  },
  confidence: {
    pct: 78,
    tier: "High",
    drivers: [
      "Low ensemble spread across IFS & AIFS",
      "Recent observation residuals < 5%",
      "High satellite precipitation agreement"
    ],
    spread_sigma: 4.8,
  },
  weather_regime: {
    detected: "MONSOON_TROUGH",
    probabilities: {
      MONSOON_TROUGH: 0.82,
      CONVECTIVE_STORM: 0.12,
      QUIESCENT: 0.06
    }
  },
  observations: {
    source: "IMD_AWS+INSAT_3D",
    recent_observation_value: 41.2,
    deviation_from_forecast: 1.1,
    satellite_agreement: "HIGH",
    observation_conditioned_signal: "ACTIVE"
  },
  climate_context: {
    climate_normal: 21.4,
    anomaly: 20.9,
    anomaly_pct: 97.6,
    percentile: 92,
    temp_anomaly_c: 0.8,
    seasonal_anomaly_pct: 18.4,
    extreme_multiplier: 2.3,
    trend_c_per_decade: 0.32,
    historical_range: [
      { month: "Jan", normal: 18.2, min_range: 2.1, max_range: 48.0 },
      { month: "Feb", normal: 22.4, min_range: 5.3, max_range: 56.2 },
      { month: "Mar", normal: 15.6, min_range: 1.0, max_range: 42.1 },
      { month: "Apr", normal: 12.1, min_range: 0.5, max_range: 35.4 },
      { month: "May", normal: 34.5, min_range: 8.2, max_range: 78.0 },
      { month: "Jun", normal: 85.0, min_range: 22.0, max_range: 180.0 },
      { month: "Jul", normal: 245.0, min_range: 95.0, max_range: 460.0 },
      { month: "Aug", normal: 230.0, min_range: 80.0, max_range: 430.0 },
      { month: "Sep", normal: 125.0, min_range: 35.0, max_range: 290.0 },
      { month: "Oct", normal: 28.0, min_range: 4.0, max_range: 85.0 },
      { month: "Nov", normal: 8.5, min_range: 0.2, max_range: 28.0 },
      { month: "Dec", normal: 9.8, min_range: 0.5, max_range: 32.0 }
    ]
  },
  risk: {
    heavy_rain: { probability_pct: 78, level: "HIGH" },
    heat: { probability_pct: 14, level: "LOW" },
    high_wind: { probability_pct: 31, level: "WATCH" },
    overall_level: "ELEVATED",
    key_drivers: [
      "High moisture content (>68 mm TPW)",
      "Multi-model convergence on intense precipitation core",
      "Warm sea surface temperature anomaly in northern Bay of Bengal",
      "Historical extreme frequency elevated for synoptic regime"
    ],
    disclaimer: "AETHER model risk guidance represents AI/NWP blended diagnostic output and does NOT substitute for statutory warnings issued by India Meteorological Department (IMD)."
  },
  uncertainty: {
    spread: 4.8,
    uncertainty_range_lower: 37.5,
    uncertainty_range_upper: 47.1,
    q10: 38.2,
    q90: 46.4,
  },
  multi_horizon: [
    { lead_time: "6h", horizon_hours: 6, ECMWF: 12.1, AIFS: 14.3, GFS: 10.8, AETHER: 13.5, lower: 11.2, upper: 15.8 },
    { lead_time: "12h", horizon_hours: 12, ECMWF: 24.2, AIFS: 26.8, GFS: 21.4, AETHER: 25.6, lower: 22.1, upper: 29.1 },
    { lead_time: "24h", horizon_hours: 24, ECMWF: 39.1, AIFS: 44.8, GFS: 42.9, AETHER: 42.3, lower: 37.5, upper: 47.1 },
    { lead_time: "48h", horizon_hours: 48, ECMWF: 58.4, AIFS: 63.2, GFS: 51.0, AETHER: 60.1, lower: 52.4, upper: 67.8 },
    { lead_time: "72h", horizon_hours: 72, ECMWF: 74.0, AIFS: 79.5, GFS: 66.2, AETHER: 76.8, lower: 65.0, upper: 88.6 }
  ],
  explanations: {
    model: "ECMWF_AIFS",
    assigned_weight: 0.46,
    top_factors: [
      { feature: "Rolling 72h Skill (MAE)", attribution: 0.28, direction: "positive" },
      { feature: "Monsoon Trough Regime Fit", attribution: 0.14, direction: "positive" },
      { feature: "Satellite Water Vapor Agreement", attribution: 0.10, direction: "positive" },
      { feature: "Lead Time Degradation Penalty", attribution: -0.06, direction: "negative" }
    ],
    shap_waterfall: [
      { name: "Base Climo", value: 33.3, contribution: 0 },
      { name: "72h MAE Skill", value: 41.5, contribution: 8.2 },
      { name: "Regime Compatibility", value: 46.8, contribution: 5.3 },
      { name: "Lead Penalty", value: 46.0, contribution: -0.8 }
    ]
  },
  model_status: {
    ECMWF_IFS: { available: true, health: "HEALTHY", latency_ms: 42 },
    ECMWF_AIFS: { available: true, health: "HEALTHY", latency_ms: 38 },
    GFS: { available: true, health: "HEALTHY", latency_ms: 55 }
  }
};

const AetherDataContext = createContext<AetherDataContextType | undefined>(undefined);

export const AetherDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo>(DEFAULT_LOCATION);
  const [variable, setVariable] = useState<string>("rainfall_mm");
  const [leadTimeHours, setLeadTimeHours] = useState<number>(24);
  const [activeLayer, setActiveLayer] = useState<string>("rainfall");
  const [data, setData] = useState<CanonicalForecast>(DEFAULT_CANONICAL_DATA);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Trace Drawer state
  const [isTraceOpen, setIsTraceOpen] = useState<boolean>(false);
  const [traceData, setTraceData] = useState<ForecastTrace | null>(null);
  const [loadingTrace, setLoadingTrace] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const canonical = await fetchCanonicalForecast(
        selectedLocation.latitude,
        selectedLocation.longitude,
        variable,
        leadTimeHours,
        selectedLocation.name
      );
      setData(canonical);
    } catch (err: any) {
      console.error("Failed to load canonical forecast:", err);
      setError(err?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, variable, leadTimeHours]);

  const openTraceDrawer = useCallback(async () => {
    setIsTraceOpen(true);
    setLoadingTrace(true);
    try {
      const trace = await fetchForecastTrace(
        selectedLocation.latitude,
        selectedLocation.longitude,
        variable,
        leadTimeHours,
        selectedLocation.name
      );
      setTraceData(trace);
    } catch (err) {
      console.error("Failed to fetch forecast trace:", err);
    } finally {
      setLoadingTrace(false);
    }
  }, [selectedLocation, variable, leadTimeHours]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <AetherDataContext.Provider
      value={{
        data,
        loading,
        error,
        selectedLocation,
        setSelectedLocation,
        variable,
        setVariable,
        leadTimeHours,
        setLeadTimeHours,
        activeLayer,
        setActiveLayer,
        isTraceOpen,
        setIsTraceOpen,
        traceData,
        loadingTrace,
        openTraceDrawer,
        refresh: loadData,
      }}
    >
      {children}
    </AetherDataContext.Provider>
  );
};

export const useAetherData = (): AetherDataContextType => {
  const context = useContext(AetherDataContext);
  if (!context) {
    throw new Error("useAetherData must be used within an AetherDataProvider");
  }
  return context;
};
