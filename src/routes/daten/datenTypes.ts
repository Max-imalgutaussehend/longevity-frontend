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
  key: 'smoking' | 'alcohol_units' | 'strength_sessions' | 'zone2_minutes' | 'waist';
  label: string;
  unit: string;
  kind: 'select' | 'number';
  min?: number;
  max?: number;
  step?: string | number;
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
    max: 100,
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
    max: 1440,
    placeholder: 'z. B. 90',
    tooltip: 'Lockeres Ausdauertraining — "könnte sich noch unterhalten"',
  },
  {
    key: 'waist',
    label: 'Taillenumfang',
    unit: 'cm',
    kind: 'number',
    min: 40,
    max: 220,
    step: '1',
    placeholder: 'z. B. 85',
    tooltip: 'Taillenumfang auf Nabelhöhe in cm (plausibler Bereich: 40–220 cm)',
  },
];

export interface ManualLabField {
  key: 'systolic_bp' | 'ldl' | 'hdl' | 'hba1c' | 'hscrp' | 'fasting_glucose' | 'triglycerides';
  label: string;
  unit: string;
  min: number;
  max: number;
  step?: string | number;
  placeholder?: string;
  tooltip?: string;
}

export const MANUAL_LAB_FIELDS: Array<ManualLabField> = [
  {
    key: 'systolic_bp',
    label: 'Systolischer Blutdruck',
    unit: 'mmHg',
    min: 70,
    max: 250,
    step: '1',
    placeholder: 'z. B. 120',
    tooltip: 'Systolischer Blutdruck in Ruhe (oberer Wert)',
  },
  {
    key: 'ldl',
    label: 'LDL-Cholesterin',
    unit: 'mg/dL',
    min: 10,
    max: 500,
    step: '1',
    placeholder: 'z. B. 110',
    tooltip: 'Low-Density Lipoprotein Cholesterin',
  },
  {
    key: 'hdl',
    label: 'HDL-Cholesterin',
    unit: 'mg/dL',
    min: 5,
    max: 200,
    step: '1',
    placeholder: 'z. B. 55',
    tooltip: 'High-Density Lipoprotein Cholesterin',
  },
  {
    key: 'hba1c',
    label: 'HbA1c',
    unit: '%',
    min: 3.5,
    max: 15,
    step: '0.1',
    placeholder: 'z. B. 5.4',
    tooltip: 'Langzeitblutzucker (glykiertes Hämoglobin)',
  },
  {
    key: 'hscrp',
    label: 'hsCRP',
    unit: 'mg/L',
    min: 0.01,
    max: 50,
    step: '0.01',
    placeholder: 'z. B. 0.8',
    tooltip: 'Hochsensitives C-reaktives Protein (Entzündungsmarker)',
  },
  {
    key: 'fasting_glucose',
    label: 'Nüchternglukose (optional)',
    unit: 'mg/dL',
    min: 40,
    max: 400,
    step: '1',
    placeholder: 'z. B. 90',
    tooltip: 'Blutzucker im nüchternen Zustand',
  },
  {
    key: 'triglycerides',
    label: 'Triglyzeride (optional)',
    unit: 'mg/dL',
    min: 20,
    max: 1000,
    step: '1',
    placeholder: 'z. B. 130',
    tooltip: 'Blutfette im Nüchternzustand',
  },
];
