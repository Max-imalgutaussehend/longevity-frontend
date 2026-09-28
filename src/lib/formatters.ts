export const METRIC_LABELS: Record<string, string> = {
  vo2max: 'VO₂max',
  resting_hr: 'Ruhepuls',
  systolic_bp: 'Systol. Blutdruck',
  ldl: 'LDL-Cholesterin',
  hdl: 'HDL-Cholesterin',
  hba1c: 'HbA1c',
  waist: 'Taillenumfang',
  sleep_duration: 'Schlafdauer',
  sleep_consistency: 'Schlafkonsistenz',
  hrv_rmssd: 'HRV (RMSSD)',
  zone2_minutes: 'Zone-2-Minuten',
  steps: 'Schritte',
  strength_sessions: 'Krafteinheiten',
  smoking: 'Rauchen',
  alcohol_units: 'Alkohol',
  hscrp: 'hsCRP',
  blood_score: 'Blutwert-Score',
  heart_rate_variability: 'Herzfrequenzvariabilität',
};

export const DOMAIN_LABELS: Record<string, string> = {
  cardiometabolic: 'Kardiometabolik',
  cardio: 'Kardiometabolik',
  recovery: 'Regeneration',
  activity: 'Aktivität',
  risk: 'Risiko',
};

export const SOURCE_LABELS: Record<string, string> = {
  apple_health: 'Apple Health',
  'apple-health': 'Apple Health',
  oura: 'Oura Ring',
  withings: 'Withings',
  strava: 'Strava',
  google_fit: 'Google Fit',
  'google-fit': 'Google Fit',
  google_health: 'Google Health',
  'google-health': 'Google Health',
  fhir: 'FHIR Labor',
  lab: 'Laborwerte',
  manual: 'Manuelle Eingabe',
  questionnaire: 'Fragebogen',
  health_auto_export: 'Health Auto Export',
};

export const METRIC_UNITS: Record<string, string> = {
  vo2max: 'ml/kg/min',
  resting_hr: 'bpm',
  systolic_bp: 'mmHg',
  ldl: 'mg/dl',
  hdl: 'mg/dl',
  hba1c: '%',
  waist: 'cm',
  sleep_duration: 'h',
  sleep_consistency: '%',
  hrv_rmssd: 'ms',
  zone2_minutes: 'min/Wo.',
  steps: '/Tag',
  strength_sessions: '/Woche',
  smoking: 'Kategorie',
  alcohol_units: 'Einh./Wo.',
  hscrp: 'mg/l',
  blood_score: 'Pkt.',
};

const SPECIAL_TRANSLATIONS: Record<string, string> = {
  blood_score: 'Blutwert-Score',
  heart_rate_variability: 'Herzfrequenzvariabilität',
  fasting_glucose: 'Nüchternglukose',
  body_fat: 'Körperfettanteil',
  muscle_mass: 'Muskelmasse',
  biological_age: 'Biologisches Alter',
};

/**
 * Wandelt rohe snake_case, kebab-case oder camelCase Strings in lesbare Bezeichnungen um.
 */
export function humanizeKey(key: string | null | undefined): string {
  if (!key) return '—';
  const trimmed = key.trim();
  if (!trimmed) return '—';

  const normalized = trimmed.toLowerCase();
  if (SPECIAL_TRANSLATIONS[normalized]) {
    return SPECIAL_TRANSLATIONS[normalized];
  }

  // Replace underscores and hyphens with spaces, split camelCase
  const withSpaces = trimmed
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ');

  // Capitalize each word nicely
  return withSpaces
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Liefert den formatierten Metrik-Namen mit intelligentem Fallback.
 */
export function getMetricLabel(metric: string | null | undefined): string {
  if (!metric) return '—';
  return METRIC_LABELS[metric] ?? humanizeKey(metric);
}

/**
 * Liefert die formatierte Domänen-Bezeichnung mit intelligentem Fallback.
 */
export function getDomainLabel(domain: string | null | undefined): string {
  if (!domain) return '—';
  return DOMAIN_LABELS[domain] ?? humanizeKey(domain);
}

/**
 * Liefert die formatierte Quell-Bezeichnung mit intelligentem Fallback.
 */
export function getSourceLabel(sourceKind: string | null | undefined): string {
  if (!sourceKind) return '—';
  return SOURCE_LABELS[sourceKind] ?? humanizeKey(sourceKind);
}

/**
 * Liefert die Einheit einer Metrik oder einen leeren String falls unbekannt.
 */
export function getMetricUnit(metric: string | null | undefined): string {
  if (!metric) return '';
  return METRIC_UNITS[metric] ?? '';
}

export const UNIT_TRANSLATIONS: Record<string, string> = {
  'steps/day': 'Schritte/Tag',
  '/day': '/Tag',
  'min/week': 'min/Wo.',
  '/week': '/Woche',
  'hours': 'h',
  'hour': 'h',
};

/**
 * Liefert die lokalisierte Einheit einer Metrik.
 * Übersetzt auch rohe englische API-Einheiten wie 'steps/day', 'min/week', '/week'.
 */
export function formatMetricUnit(metric?: string | null, rawUnit?: string | null): string {
  const trimmed = rawUnit?.trim();
  if (trimmed && UNIT_TRANSLATIONS[trimmed]) {
    return UNIT_TRANSLATIONS[trimmed];
  }
  if (metric === 'steps') {
    return 'Schritte/Tag';
  }
  if (metric && METRIC_UNITS[metric]) {
    return METRIC_UNITS[metric];
  }
  return trimmed ?? '';
}

/**
 * Formatiert metrische Werte mit passender Rundung und Nachkommastellen:
 * - Schritte als Integer mit deutscher Tausendertrennung (z. B. 8.914)
 * - Ruhepuls und systol. Blutdruck als gerundete Integer (z. B. 60)
 * - VO₂max und Schlafdauer mit 1 Nachkommastelle (z. B. 51.9)
 * - Sonstige Werte: Integer falls ganzzahlig, sonst 1 Nachkommastelle
 */
export function formatMetricValue(
  metric: string | null | undefined,
  val: number | null | undefined,
): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  if (metric === 'steps') return Math.round(val).toLocaleString('de-DE');
  if (metric === 'resting_hr' || metric === 'systolic_bp') return Math.round(val).toString();
  if (metric === 'sleep_duration' || metric === 'vo2max') return val.toFixed(1);
  return Number.isInteger(val) ? val.toString() : val.toFixed(1);
}

