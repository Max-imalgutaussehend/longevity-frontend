import { describe, it, expect } from 'vitest';
import {
  getMetricLabel,
  getDomainLabel,
  getSourceLabel,
  getMetricUnit,
  humanizeKey,
  formatMetricValue,
  formatMetricUnit,
} from '../lib/formatters.js';

describe('Central Formatters & Label System (#88)', () => {
  describe('getMetricLabel()', () => {
    it('returns exact German labels for known metrics', () => {
      expect(getMetricLabel('vo2max')).toBe('VO₂max');
      expect(getMetricLabel('resting_hr')).toBe('Ruhepuls');
      expect(getMetricLabel('systolic_bp')).toBe('Systol. Blutdruck');
      expect(getMetricLabel('ldl')).toBe('LDL-Cholesterin');
      expect(getMetricLabel('hdl')).toBe('HDL-Cholesterin');
      expect(getMetricLabel('hba1c')).toBe('HbA1c');
      expect(getMetricLabel('waist')).toBe('Taillenumfang');
      expect(getMetricLabel('sleep_duration')).toBe('Schlafdauer');
      expect(getMetricLabel('sleep_consistency')).toBe('Schlafkonsistenz');
      expect(getMetricLabel('hrv_rmssd')).toBe('HRV (RMSSD)');
      expect(getMetricLabel('zone2_minutes')).toBe('Zone-2-Minuten');
      expect(getMetricLabel('steps')).toBe('Schritte');
      expect(getMetricLabel('strength_sessions')).toBe('Krafteinheiten');
      expect(getMetricLabel('smoking')).toBe('Rauchen');
      expect(getMetricLabel('alcohol_units')).toBe('Alkohol');
      expect(getMetricLabel('hscrp')).toBe('hsCRP');
      expect(getMetricLabel('blood_score')).toBe('Blutwert-Score');
    });

    it('humanizes unknown technical snake_case keys instead of displaying raw strings', () => {
      expect(getMetricLabel('fasting_glucose')).toBe('Nüchternglukose');
      expect(getMetricLabel('heart_rate_variability')).toBe('Herzfrequenzvariabilität');
      expect(getMetricLabel('body_temperature')).toBe('Body Temperature');
      expect(getMetricLabel('respiratory_rate')).toBe('Respiratory Rate');
    });

    it('handles null, undefined, and empty string safely', () => {
      expect(getMetricLabel(null)).toBe('—');
      expect(getMetricLabel(undefined)).toBe('—');
      expect(getMetricLabel('')).toBe('—');
    });
  });

  describe('getDomainLabel()', () => {
    it('returns German domain labels', () => {
      expect(getDomainLabel('cardiometabolic')).toBe('Kardiometabolik');
      expect(getDomainLabel('cardio')).toBe('Kardiometabolik');
      expect(getDomainLabel('recovery')).toBe('Regeneration');
      expect(getDomainLabel('activity')).toBe('Aktivität');
      expect(getDomainLabel('risk')).toBe('Risiko');
    });

    it('humanizes unknown domains', () => {
      expect(getDomainLabel('mental_wellness')).toBe('Mental Wellness');
    });

    it('handles null and undefined safely', () => {
      expect(getDomainLabel(null)).toBe('—');
      expect(getDomainLabel(undefined)).toBe('—');
    });
  });

  describe('getSourceLabel()', () => {
    it('maps all supported source kinds and hyphenated aliases', () => {
      expect(getSourceLabel('apple_health')).toBe('Apple Health');
      expect(getSourceLabel('apple-health')).toBe('Apple Health');
      expect(getSourceLabel('oura')).toBe('Oura Ring');
      expect(getSourceLabel('withings')).toBe('Withings');
      expect(getSourceLabel('strava')).toBe('Strava');
      expect(getSourceLabel('google_fit')).toBe('Google Fit');
      expect(getSourceLabel('google-fit')).toBe('Google Fit');
      expect(getSourceLabel('google_health')).toBe('Google Health');
      expect(getSourceLabel('google-health')).toBe('Google Health');
      expect(getSourceLabel('fhir')).toBe('FHIR Labor');
      expect(getSourceLabel('lab')).toBe('Laborwerte');
      expect(getSourceLabel('manual')).toBe('Manuelle Eingabe');
      expect(getSourceLabel('questionnaire')).toBe('Fragebogen');
      expect(getSourceLabel('health_auto_export')).toBe('Health Auto Export');
    });

    it('humanizes unknown source providers', () => {
      expect(getSourceLabel('polar_flow')).toBe('Polar Flow');
      expect(getSourceLabel('whoop_strap')).toBe('Whoop Strap');
    });

    it('handles null and undefined safely', () => {
      expect(getSourceLabel(null)).toBe('—');
      expect(getSourceLabel(undefined)).toBe('—');
    });
  });

  describe('getMetricUnit()', () => {
    it('returns metric units or empty string', () => {
      expect(getMetricUnit('vo2max')).toBe('ml/kg/min');
      expect(getMetricUnit('resting_hr')).toBe('bpm');
      expect(getMetricUnit('systolic_bp')).toBe('mmHg');
      expect(getMetricUnit('sleep_duration')).toBe('h');
      expect(getMetricUnit('unknown_metric')).toBe('');
      expect(getMetricUnit(null)).toBe('');
    });
  });

  describe('humanizeKey()', () => {
    it('cleans up snake_case, kebab-case, and camelCase keys', () => {
      expect(humanizeKey('cardio_fitness_score')).toBe('Cardio Fitness Score');
      expect(humanizeKey('custom-health-tracker')).toBe('Custom Health Tracker');
      expect(humanizeKey('activeEnergyBurned')).toBe('Active Energy Burned');
    });
  });

  describe('formatMetricValue() (#82)', () => {
    it('formats steps as integer with German locale thousands separator', () => {
      expect(formatMetricValue('steps', 8913.72)).toBe('8.914');
      expect(formatMetricValue('steps', 12345)).toBe('12.345');
    });

    it('rounds resting heart rate and blood pressure to whole numbers', () => {
      expect(formatMetricValue('resting_hr', 60.28)).toBe('60');
      expect(formatMetricValue('resting_hr', 58.7)).toBe('59');
      expect(formatMetricValue('systolic_bp', 120.2)).toBe('120');
    });

    it('formats vo2max and sleep duration with 1 decimal place', () => {
      expect(formatMetricValue('vo2max', 51.94)).toBe('51.9');
      expect(formatMetricValue('vo2max', 45)).toBe('45.0');
      expect(formatMetricValue('sleep_duration', 7.86)).toBe('7.9');
      expect(formatMetricValue('sleep_duration', 7)).toBe('7.0');
    });

    it('handles other metrics nicely', () => {
      expect(formatMetricValue('other', 14)).toBe('14');
      expect(formatMetricValue('other', 14.56)).toBe('14.6');
    });

    it('handles null, undefined, and NaN safely', () => {
      expect(formatMetricValue('steps', null)).toBe('—');
      expect(formatMetricValue('steps', undefined)).toBe('—');
      expect(formatMetricValue('steps', NaN)).toBe('—');
    });
  });

  describe('formatMetricUnit() (#82)', () => {
    it('translates raw English API units to German localized equivalents', () => {
      expect(formatMetricUnit('steps', 'steps/day')).toBe('Schritte/Tag');
      expect(formatMetricUnit('steps', 'steps')).toBe('Schritte/Tag');
      expect(formatMetricUnit('zone2_minutes', 'min/week')).toBe('min/Wo.');
      expect(formatMetricUnit('strength_sessions', '/week')).toBe('/Woche');
    });

    it('falls back to METRIC_UNITS or rawUnit', () => {
      expect(formatMetricUnit('resting_hr', 'bpm')).toBe('bpm');
      expect(formatMetricUnit('vo2max')).toBe('ml/kg/min');
      expect(formatMetricUnit('custom', 'mg/dl')).toBe('mg/dl');
    });
  });
});

