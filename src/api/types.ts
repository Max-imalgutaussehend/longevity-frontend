// Re-exports from the auto-generated OpenAPI types.
// Import from here instead of generated.ts directly.
import type { components } from './generated.js';

export type User = components["schemas"]["User"];
export type ScoreResult = components["schemas"]["ScoreResult"];
export type MetricResult = components["schemas"]["MetricResult"];
export type DomainResult = components["schemas"]["DomainResult"];
export type HistoryPoint = components["schemas"]["HistoryPoint"];
export type Source = components["schemas"]["Source"];
export type ShareToken = components["schemas"]["ShareToken"];
export type PartnerOffer = components["schemas"]["PartnerOffer"];
export type WeeklyReport = components["schemas"]["WeeklyReport"];

export interface MetricHistoryItem {
  id: number;
  value: number;
  measuredAt: string;
  sourceKind: string;
}

export interface MetricSummary {
  metric: string;
  label: string;
  domain: string;
  domainLabel: string;
  latestValue: number;
  unit: string;
  latestMeasuredAt: string;
  sourceKind: string;
  sourceAdapter: string | null;
  count: number;
  history: MetricHistoryItem[];
}

export interface SampleRecord {
  id: number;
  metric: string;
  label: string;
  value: number;
  unit: string;
  measuredAt: string;
  sourceKind: string;
  sourceAdapter: string | null;
}

export interface SamplesSummaryResponse {
  metrics: MetricSummary[];
  recentSamples: SampleRecord[];
  totalCount: number;
}
