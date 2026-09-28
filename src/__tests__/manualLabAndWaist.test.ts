import { describe, it, expect } from 'vitest';
import { validateManualLabInput } from '../routes/daten/components/ManualLabModal.js';
import { LIFESTYLE_FIELDS, MANUAL_LAB_FIELDS } from '../routes/daten/datenTypes.js';
import { getScoreMetricRoute } from '../routes/Score.js';

describe('Manual Lab & Waist Feature (#84)', () => {
  describe('LIFESTYLE_FIELDS: Taillenumfang (waist)', () => {
    it('contains waist field with correct metadata and bounds', () => {
      const waistField = LIFESTYLE_FIELDS.find((f) => f.key === 'waist');
      expect(waistField).toBeDefined();
      expect(waistField?.unit).toBe('cm');
      expect(waistField?.min).toBe(40);
      expect(waistField?.max).toBe(220);
      expect(waistField?.kind).toBe('number');
      expect(waistField?.label).toContain('Taillenumfang');
    });
  });

  describe('MANUAL_LAB_FIELDS metadata', () => {
    it('defines the 7 lab fields with units and bounds', () => {
      const keys = MANUAL_LAB_FIELDS.map((f) => f.key);
      expect(keys).toContain('systolic_bp');
      expect(keys).toContain('ldl');
      expect(keys).toContain('hdl');
      expect(keys).toContain('hba1c');
      expect(keys).toContain('hscrp');
      expect(keys).toContain('fasting_glucose');
      expect(keys).toContain('triglycerides');

      const bp = MANUAL_LAB_FIELDS.find((f) => f.key === 'systolic_bp');
      expect(bp?.unit).toBe('mmHg');
      expect(bp?.min).toBe(70);
      expect(bp?.max).toBe(250);

      const hba1c = MANUAL_LAB_FIELDS.find((f) => f.key === 'hba1c');
      expect(hba1c?.unit).toBe('%');
      expect(hba1c?.min).toBe(3.5);
      expect(hba1c?.max).toBe(15);
    });
  });

  describe('validateManualLabInput()', () => {
    const validDate = '2026-05-15';

    it('rejects missing or empty sampledAt date', () => {
      const res = validateManualLabInput('', { ldl: '120' });
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Bitte ein Abnahmedatum angeben.');
    });

    it('rejects future sampledAt date', () => {
      const futureDate = '2099-01-01';
      const res = validateManualLabInput(futureDate, { ldl: '120' });
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Das Abnahmedatum darf nicht in der Zukunft liegen.');
    });

    it('rejects when no lab values are provided', () => {
      const res = validateManualLabInput(validDate, {});
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Bitte mindestens einen Laborwert eingeben.');
    });

    it('rejects non-numeric values', () => {
      const res = validateManualLabInput(validDate, { ldl: 'invalid' });
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('LDL-Cholesterin: Bitte eine gültige Zahl eingeben.');
    });

    it('validates systolic blood pressure boundaries (70 - 250 mmHg)', () => {
      const tooLow = validateManualLabInput(validDate, { systolic_bp: '60' });
      expect(tooLow.isValid).toBe(false);
      expect(tooLow.error).toContain('Systolischer Blutdruck: Wert muss zwischen 70 und 250 mmHg liegen.');

      const tooHigh = validateManualLabInput(validDate, { systolic_bp: '260' });
      expect(tooHigh.isValid).toBe(false);
      expect(tooHigh.error).toContain('Systolischer Blutdruck: Wert muss zwischen 70 und 250 mmHg liegen.');

      const ok = validateManualLabInput(validDate, { systolic_bp: '125' });
      expect(ok.isValid).toBe(true);
      expect(ok.payload?.[0]).toEqual({
        metric: 'systolic_bp',
        value: 125,
        unit: 'mmHg',
        measuredAt: new Date(validDate).toISOString(),
      });
    });

    it('validates HbA1c boundaries and supports comma decimal separator', () => {
      const tooLow = validateManualLabInput(validDate, { hba1c: '2.5' });
      expect(tooLow.isValid).toBe(false);
      expect(tooLow.error).toContain('HbA1c: Wert muss zwischen 3.5 und 15 % liegen.');

      const tooHigh = validateManualLabInput(validDate, { hba1c: '16.0' });
      expect(tooHigh.isValid).toBe(false);
      expect(tooHigh.error).toContain('HbA1c: Wert muss zwischen 3.5 und 15 % liegen.');

      const commaVal = validateManualLabInput(validDate, { hba1c: '5,4' });
      expect(commaVal.isValid).toBe(true);
      expect(commaVal.payload?.[0].value).toBe(5.4);
    });

    it('validates LDL and HDL boundaries', () => {
      const ldlLow = validateManualLabInput(validDate, { ldl: '8' });
      expect(ldlLow.isValid).toBe(false);

      const hdlHigh = validateManualLabInput(validDate, { hdl: '250' });
      expect(hdlHigh.isValid).toBe(false);

      const bothValid = validateManualLabInput(validDate, { ldl: '115', hdl: '55' });
      expect(bothValid.isValid).toBe(true);
      expect(bothValid.payload).toHaveLength(2);
      expect(bothValid.payload?.[0].metric).toBe('ldl');
      expect(bothValid.payload?.[1].metric).toBe('hdl');
    });

    it('validates hsCRP boundaries', () => {
      const hsCrpLow = validateManualLabInput(validDate, { hscrp: '0.005' });
      expect(hsCrpLow.isValid).toBe(false);

      const hsCrpOk = validateManualLabInput(validDate, { hscrp: '0.75' });
      expect(hsCrpOk.isValid).toBe(true);
      expect(hsCrpOk.payload?.[0].value).toBe(0.75);
    });
  });

  describe('Score page deep-linking: getScoreMetricRoute()', () => {
    it('routes lifestyle metrics to /daten?open=lifestyle&metric=...', () => {
      expect(getScoreMetricRoute('smoking')).toBe('/daten?open=lifestyle&metric=smoking');
      expect(getScoreMetricRoute('alcohol_units')).toBe('/daten?open=lifestyle&metric=alcohol_units');
      expect(getScoreMetricRoute('strength_sessions')).toBe('/daten?open=lifestyle&metric=strength_sessions');
      expect(getScoreMetricRoute('zone2_minutes')).toBe('/daten?open=lifestyle&metric=zone2_minutes');
      expect(getScoreMetricRoute('waist')).toBe('/daten?open=lifestyle&metric=waist');
    });

    it('routes lab metrics to /daten?open=labs&metric=...', () => {
      expect(getScoreMetricRoute('ldl')).toBe('/daten?open=labs&metric=ldl');
      expect(getScoreMetricRoute('hdl')).toBe('/daten?open=labs&metric=hdl');
      expect(getScoreMetricRoute('hba1c')).toBe('/daten?open=labs&metric=hba1c');
      expect(getScoreMetricRoute('hscrp')).toBe('/daten?open=labs&metric=hscrp');
      expect(getScoreMetricRoute('systolic_bp')).toBe('/daten?open=labs&metric=systolic_bp');
    });

    it('routes device and wearable metrics to /daten?tab=sources', () => {
      expect(getScoreMetricRoute('vo2max')).toBe('/daten?tab=sources');
      expect(getScoreMetricRoute('resting_hr')).toBe('/daten?tab=sources');
      expect(getScoreMetricRoute('steps')).toBe('/daten?tab=sources');
      expect(getScoreMetricRoute('sleep_duration')).toBe('/daten?tab=sources');
    });
  });
});
