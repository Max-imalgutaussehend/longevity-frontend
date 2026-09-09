// Auto-generated from backend/openapi.json via `pnpm gen:api`
// DO NOT EDIT MANUALLY

export type Metric =
  | 'vo2max' | 'resting_hr' | 'systolic_bp' | 'ldl' | 'hdl' | 'hba1c' | 'waist'
  | 'sleep_duration' | 'sleep_consistency' | 'hrv_rmssd'
  | 'zone2_minutes' | 'steps' | 'strength_sessions'
  | 'smoking' | 'alcohol_units' | 'hscrp';

export type Domain = 'cardiometabolic' | 'recovery' | 'activity' | 'risk';

export interface MetricResult {
  metric: Metric;
  domain: Domain;
  value: number | null;
  unit: string;
  percentile: number | null;
  z: number | null;
  ageDays: number | null;
  freshness: number;
  effectiveWeight: number;
  contribution: number;
  available: boolean;
}

export interface DomainResult {
  domain: Domain;
  weight: number;
  score: number;
  metrics: MetricResult[];
}

export interface ScoreResult {
  score: number;
  coverage: number;
  bioAge: number;
  chronoAge: number;
  band: { low: number; high: number };
  domains: DomainResult[];
  engineVersion: string;
  computedAt: string;
}

export interface Lever {
  metric: Metric;
  currentValue: number | null;
  targetValue: number;
  delta: number;
  horizonWeeks: number;
}

export interface Source {
  id: string;
  kind: 'apple_health' | 'oura' | 'lab' | 'questionnaire';
  adapter: 'mock' | 'health_export_xml' | 'auto_export_webhook' | 'manual';
  enabled: boolean;
  lastSyncAt: string | null;
  sampleCount: number;
}

export interface ShareToken {
  id: string;
  bandLow: number;
  bandHigh: number;
  issuedAt: string;
  expiresAt: string;
  revokedAt: string | null;
  partnerRef: string | null;
}

export interface PartnerOffer {
  id: string;
  partnerName: string;
  title: string;
  description: string;
  minBand: number;
  valueLabel: string;
  isDemo: boolean;
  qualified: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  birthDate: string;
  sex: 'm' | 'f';
  chronoAge: number;
}
