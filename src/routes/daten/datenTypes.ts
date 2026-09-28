export interface SourceSyncStatusInfo {
  status: 'ok' | 'token_expired' | 'error' | 'paused' | 'ready';
  badgeLabel: string;
  badgeColor: 'teal' | 'neutral' | 'red' | 'amber' | 'green';
  isTokenExpired: boolean;
  isError: boolean;
  isConnected: boolean;
  needsReconnect: boolean;
}

export interface ConsentStatus {
  hasConsented: boolean;
  consentAt: string | null;
  version: string | null;
  latestVersion: string;
  consentText: string;
}

export const SOURCE_BADGES: Record<string, { label: string }> = {
  google_fit: { label: 'Google Health' },
  apple_health: { label: 'Apple Health' },
  oura: { label: 'Oura Ring' },
  strava: { label: 'Strava' },
  withings: { label: 'Withings' },
  health_auto_export: { label: 'Health Auto Export' },
  lab: { label: 'Laborwert' },
  manual: { label: 'Manuell' },
  questionnaire: { label: 'Fragebogen' },
};

export const SMOKING_OPTIONS = [
  { value: '0', label: 'Nie' },
  { value: '1', label: 'Ehemalig (>1 Jahr)' },
  { value: '2', label: 'Ehemalig (<1 Jahr)' },
  { value: '3', label: 'Aktuell' },
];

export interface LifestyleField {
  key: 'smoking' | 'alcohol_units' | 'strength_sessions' | 'zone2_minutes';
  label: string;
  unit: string;
  kind: 'select' | 'number';
  min?: number;
  max?: number;
  tooltip?: string;
  placeholder?: string;
}

export const LIFESTYLE_FIELDS: Array<LifestyleField> = [
  { key: 'smoking', label: 'Rauchen', unit: 'category', kind: 'select' },
  {
    key: 'alcohol_units',
    label: 'Alkohol-Einheiten pro Woche',
    unit: 'units/week',
    kind: 'number',
    min: 0,
    placeholder: 'z. B. 4',
    tooltip: '1 Einheit = 10g Alkohol ≈ 1 kleines Bier',
  },
  {
    key: 'strength_sessions',
    label: 'Krafteinheiten pro Woche',
    unit: '/week',
    kind: 'number',
    min: 0,
    max: 14,
    placeholder: 'z. B. 2',
    tooltip: 'Gezielte Krafttrainingseinheiten pro Woche (medizinisch plausibel bis 14)',
  },
  {
    key: 'zone2_minutes',
    label: 'Zone-2-Minuten pro Woche',
    unit: 'min/week',
    kind: 'number',
    min: 0,
    placeholder: 'z. B. 90',
    tooltip: 'Lockeres Ausdauertraining — "könnte sich noch unterhalten"',
  },
];
