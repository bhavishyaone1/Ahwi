export interface SystemStatus {
  status: string;
  app_name: string;
  data_mode: "REAL" | "DEMO";
  data_source: string;
  target_grid_resolution: string;
  active_models: string[];
  timestamp_utc: string;
}

export interface BlendedForecast {
  location_name: string;
  latitude: number;
  longitude: number;
  target_time: string;
  variable: string;
  lead_time_hours: number;
  raw_blend: number;
  calibrated_forecast: number;
  bias_correction: number;
  confidence_pct: number;
  confidence_tier: "High" | "Moderate" | "Low";
  confidence_drivers: string[];
  dominant_model: string;
  model_weights: Record<string, number>;
  raw_model_forecasts: Record<string, number>;
  spread: number;
  detected_regime: string;
  regime_probabilities: Record<string, number>;
  data_mode: "REAL" | "DEMO";
  data_source: string;
}

export interface WeightGridPoint {
  station: string;
  latitude: number;
  longitude: number;
  region: string;
  dominant_model: string;
  weights: Record<string, number>;
  blended_forecast: number;
  confidence: number;
  regime: string;
  data_mode: string;
}

export interface ExtremeRiskProbability {
  event_type: string;
  probability_pct: number;
  risk_level: "LOW" | "WATCH" | "HIGH" | "EXTREME";
  threshold_description: string;
  contributing_signals: string[];
}

export interface ExtremeRiskAssessment {
  location_name: string;
  latitude: number;
  longitude: number;
  valid_time: string;
  lead_time_hours: number;
  risks: Record<string, ExtremeRiskProbability>;
  overall_risk_level: "LOW" | "WATCH" | "HIGH" | "EXTREME";
  disclaimer: string;
  data_mode: string;
  data_source: string;
}

export interface ClimatologicalBaselinePoint {
  day_of_year: number;
  mean_value: number;
  std_dev: number;
  p10: number;
  p90: number;
}

export interface ClimateContext {
  location_name: string;
  latitude: number;
  longitude: number;
  variable: string;
  current_forecast_value: number;
  climatological_baseline_mean: number;
  climatological_baseline_std: number;
  anomaly_absolute: number;
  anomaly_percentage: number;
  percentile: number;
  historical_trend_summary: string;
  envelope: ClimatologicalBaselinePoint[];
  data_mode: string;
  data_source: string;
}

export interface ShapContribution {
  feature_name: string;
  feature_value: number;
  shap_value: number;
  effect: "INCREASES_WEIGHT" | "DECREASES_WEIGHT";
  plain_text_explanation: string;
}

export interface ModelExplanation {
  location_name: string;
  model: string;
  assigned_weight: number;
  base_value: number;
  top_drivers: ShapContribution[];
  summary_narrative: string;
  data_mode: string;
}

export interface BenchmarkMetric {
  model_name: string;
  mae: number;
  rmse: number;
  bias: number;
  csi?: number;
  sample_count: number;
}

export interface BenchmarkMatrix {
  variable: string;
  lead_time_hours: number;
  weather_regime: string;
  test_period: string;
  comparison_table: BenchmarkMetric[];
  data_mode: string;
}

export interface QueryResponse {
  query_summary: string;
  headline: string;
  blended_forecast: string;
  confidence: string;
  dominant_model: string;
  dominant_weight: string;
  source_data: Record<string, string>;
  contributing_reasons: string[];
  data_mode: string;
  data_source: string;
}

export interface LocationInfo {
  name: string;
  latitude: number;
  longitude: number;
  region?: string;
  state?: string;
  station_id?: string;
}

export interface DataFreshness {
  ECMWF: string;
  AIFS: string;
  GFS: string;
  NASA_GPM: string;
  INSAT_3D: string;
  ERA5: string;
}

export interface AetherForecastOutput {
  raw_blend: number;
  calibrated_value: number;
  bias_applied: number;
  unit: string;
}

export interface ConfidenceOutput {
  pct: number;
  tier: string;
  drivers: string[];
  spread_sigma?: number;
}

export interface WeatherRegimeOutput {
  detected: string;
  probabilities: Record<string, number>;
}

export interface ObservationVerification {
  source: string;
  recent_observation_value: number | null;
  deviation_from_forecast: number | null;
  satellite_agreement: string;
  observation_conditioned_signal: string;
}

export interface MonthlyClimateEnvelope {
  month: string;
  normal: number;
  min_range: number;
  max_range: number;
}

export interface ClimateContextOutput {
  climate_normal: number;
  anomaly: number;
  anomaly_pct: number;
  percentile: number;
  temp_anomaly_c: number;
  seasonal_anomaly_pct: number;
  extreme_multiplier: number;
  trend_c_per_decade: number;
  historical_range: MonthlyClimateEnvelope[];
}

export interface RiskCategoryDetail {
  probability_pct: number;
  level: "LOW" | "WATCH" | "HIGH" | "EXTREME";
}

export interface ExtremeRiskOutput {
  heavy_rain: RiskCategoryDetail;
  heat: RiskCategoryDetail;
  high_wind: RiskCategoryDetail;
  overall_level: string;
  key_drivers: string[];
  disclaimer: string;
}

export interface UncertaintyBand {
  spread: number;
  uncertainty_range_lower: number;
  uncertainty_range_upper: number;
  q10?: number;
  q90?: number;
}

export interface HorizonPoint {
  lead_time: string;
  horizon_hours: number;
  ECMWF: number;
  AIFS: number;
  GFS: number;
  AETHER: number;
  lower: number;
  upper: number;
}

export interface ShapFactor {
  feature: string;
  attribution: number;
  direction: "positive" | "negative";
}

export interface ModelExplanationOutput {
  model: string;
  assigned_weight: number;
  top_factors: ShapFactor[];
  shap_waterfall: Array<{ name: string; value: number; contribution: number }>;
}

export interface ModelHealthStatus {
  available: boolean;
  health: string;
  latency_ms: number | null;
}

export interface CanonicalForecast {
  location: LocationInfo;
  timestamp: string;
  target_time: string;
  data_mode: "REAL" | "DEMO";
  data_source: string;
  data_freshness: DataFreshness;
  variable: string;
  lead_time_hours: number;
  forecasts: Record<string, number>;
  aether_forecast: AetherForecastOutput;
  weights: Record<string, number>;
  confidence: ConfidenceOutput;
  weather_regime: WeatherRegimeOutput;
  observations: ObservationVerification;
  climate_context: ClimateContextOutput;
  risk: ExtremeRiskOutput;
  uncertainty: UncertaintyBand;
  multi_horizon: HorizonPoint[];
  explanations: ModelExplanationOutput;
  model_status: Record<string, ModelHealthStatus>;
}

export interface ForecastTraceStep {
  step: number;
  name: string;
  status: string;
  duration_ms?: number;
  detail: any;
}

export interface ForecastTrace {
  title: string;
  location: string;
  horizon: string;
  variable: string;
  steps: ForecastTraceStep[];
  total_latency_ms?: number;
}

