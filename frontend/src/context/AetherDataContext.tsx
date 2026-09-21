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

const AetherDataContext = createContext<AetherDataContextType | undefined>(undefined);

export const AetherDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo>(DEFAULT_LOCATION);
  const [variable, setVariable] = useState<string>("rainfall_mm");
  const [leadTimeHours, setLeadTimeHours] = useState<number>(24);
  const [activeLayer, setActiveLayer] = useState<string>("rainfall");
  const [data, setData] = useState<CanonicalForecast | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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
