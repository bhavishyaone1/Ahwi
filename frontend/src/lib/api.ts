import {
  BlendedForecast,
  ClimateContext,
  ExtremeRiskAssessment,
  ModelExplanation,
  QueryResponse,
  SystemStatus,
  WeightGridPoint,
  BenchmarkMatrix,
  CanonicalForecast,
  ForecastTrace,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "/api" : "http://127.0.0.1:8000/api");

export async function fetchSystemStatus(): Promise<SystemStatus> {
  const res = await fetch(`${API_BASE}/status`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch system status");
  return res.json();
}

export async function fetchForecast(
  lat: number = 28.6139,
  lon: number = 77.2090,
  variable: string = "rainfall_mm",
  horizon: number = 24,
  locationName: string = "Delhi NCR"
): Promise<BlendedForecast> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    var: variable,
    horizon: horizon.toString(),
    location_name: locationName,
  });
  const res = await fetch(`${API_BASE}/forecast?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch blended forecast");
  return res.json();
}

export async function fetchWeightMap(
  variable: string = "rainfall_mm",
  horizon: number = 24
): Promise<WeightGridPoint[]> {
  const params = new URLSearchParams({
    var: variable,
    horizon: horizon.toString(),
  });
  const res = await fetch(`${API_BASE}/weights/map?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch weight map");
  return res.json();
}

export async function fetchExtremeRisk(
  lat: number = 28.6139,
  lon: number = 77.2090,
  horizon: number = 24,
  locationName: string = "Delhi NCR"
): Promise<ExtremeRiskAssessment> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    horizon: horizon.toString(),
    location_name: locationName,
  });
  const res = await fetch(`${API_BASE}/risk?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch extreme risk");
  return res.json();
}

export async function fetchClimateContext(
  lat: number = 28.6139,
  lon: number = 77.2090,
  variable: string = "rainfall_mm",
  locationName: string = "Delhi NCR"
): Promise<ClimateContext> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    var: variable,
    location_name: locationName,
  });
  const res = await fetch(`${API_BASE}/climate?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch climate context");
  return res.json();
}

export async function fetchModelExplanation(
  model: string = "ECMWF_AIFS",
  lat: number = 28.6139,
  lon: number = 77.2090,
  variable: string = "rainfall_mm",
  horizon: number = 24,
  locationName: string = "Delhi NCR"
): Promise<ModelExplanation> {
  const params = new URLSearchParams({
    model,
    lat: lat.toString(),
    lon: lon.toString(),
    var: variable,
    horizon: horizon.toString(),
    location_name: locationName,
  });
  const res = await fetch(`${API_BASE}/explanation?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch model explanation");
  return res.json();
}

export async function fetchBenchmarkMatrix(
  variable: string = "rainfall_mm",
  horizon: number = 24,
  regime: string = "ALL"
): Promise<BenchmarkMatrix> {
  const params = new URLSearchParams({
    var: variable,
    horizon: horizon.toString(),
    regime,
  });
  const res = await fetch(`${API_BASE}/benchmark?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch benchmark matrix");
  return res.json();
}

export async function fetchSkillCurve(
  variable: string = "rainfall_mm",
  regime: string = "ALL"
): Promise<unknown> {
  const params = new URLSearchParams({ var: variable, regime });
  const res = await fetch(`${API_BASE}/benchmark/skill-curve?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch skill curve");
  return res.json();
}


export async function submitOperatorQuery(query: string): Promise<QueryResponse> {
  const res = await fetch(`${API_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error("Failed to execute operator query");
  return res.json();
}

export async function fetchCanonicalForecast(
  lat: number = 28.6139,
  lon: number = 77.2090,
  variable: string = "rainfall_mm",
  horizon: number = 24,
  locationName: string = "Delhi NCR"
): Promise<CanonicalForecast> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    var: variable,
    horizon: horizon.toString(),
    location_name: locationName,
  });
  const res = await fetch(`${API_BASE}/canonical?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch canonical forecast");
  return res.json();
}

export async function fetchForecastTrace(
  lat: number = 28.6139,
  lon: number = 77.2090,
  variable: string = "rainfall_mm",
  horizon: number = 24,
  locationName: string = "Delhi NCR"
): Promise<ForecastTrace> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    var: variable,
    horizon: horizon.toString(),
    location_name: locationName,
  });
  const res = await fetch(`${API_BASE}/trace?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch forecast trace");
  return res.json();
}

