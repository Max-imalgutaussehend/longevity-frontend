import { describe, it, expect } from 'vitest';

export function getOfferBadgeState(offer: {
  minBand: number;
  minMonths?: number | null;
  qualified: boolean;
  daysRemaining?: number;
}, userBandLow: number | null) {
  if (offer.qualified) {
    return { type: 'qualified', text: 'Erfüllt', color: 'green' };
  }

  const gap = userBandLow !== null ? offer.minBand - userBandLow : null;
  const needsMorePoints = gap !== null && gap > 0;
  const needsHoldingTime = !offer.qualified && !needsMorePoints && (offer.daysRemaining ?? 0) > 0;

  if (needsMorePoints) {
    return { type: 'points_gap', text: `Band ${offer.minBand}+ · noch ${gap} Pkt.`, color: 'neutral' };
  }

  if (needsHoldingTime) {
    return { type: 'holding_time', text: `Band ${offer.minBand}+ · noch ${offer.daysRemaining} Tage halten`, color: 'amber' };
  }

  return { type: 'default', text: `Band ${offer.minBand}+`, color: 'neutral' };
}

export function validateMinMonthsInput(input: string): { valid: boolean; error?: string; value?: number | null } {
  const trimmed = input.trim();
  if (trimmed === '') {
    return { valid: true, value: null };
  }
  const num = Number(trimmed);
  if (Number.isNaN(num) || !Number.isInteger(num) || num < 0 || num > 36) {
    return { valid: false, error: 'Mindesthaltedauer muss eine ganze Zahl zwischen 0 und 36 Monaten sein.' };
  }
  return { valid: true, value: num };
}

describe('Holding period UI logic (#47)', () => {
  describe('getOfferBadgeState', () => {
    it('returns qualified badge when offer is qualified', () => {
      const state = getOfferBadgeState({
        minBand: 70,
        minMonths: 3,
        qualified: true,
        daysRemaining: 0,
      }, 70);

      expect(state.type).toBe('qualified');
      expect(state.color).toBe('green');
      expect(state.text).toContain('Erfüllt');
    });

    it('returns points_gap badge when current band is below required band', () => {
      const state = getOfferBadgeState({
        minBand: 70,
        minMonths: 3,
        qualified: false,
        daysRemaining: 90,
      }, 60);

      expect(state.type).toBe('points_gap');
      expect(state.color).toBe('neutral');
      expect(state.text).toBe('Band 70+ · noch 10 Pkt.');
    });

    it('returns holding_time badge in amber when band is reached but holding period remains', () => {
      const state = getOfferBadgeState({
        minBand: 70,
        minMonths: 3,
        qualified: false,
        daysRemaining: 45,
      }, 70);

      expect(state.type).toBe('holding_time');
      expect(state.color).toBe('amber');
      expect(state.text).toBe('Band 70+ · noch 45 Tage halten');
    });
  });

  describe('validateMinMonthsInput', () => {
    it('accepts empty input as null', () => {
      expect(validateMinMonthsInput('')).toEqual({ valid: true, value: null });
      expect(validateMinMonthsInput('   ')).toEqual({ valid: true, value: null });
    });

    it('accepts valid integers between 0 and 36', () => {
      expect(validateMinMonthsInput('0')).toEqual({ valid: true, value: 0 });
      expect(validateMinMonthsInput('3')).toEqual({ valid: true, value: 3 });
      expect(validateMinMonthsInput('12')).toEqual({ valid: true, value: 12 });
      expect(validateMinMonthsInput('36')).toEqual({ valid: true, value: 36 });
    });

    it('rejects invalid inputs', () => {
      expect(validateMinMonthsInput('-1').valid).toBe(false);
      expect(validateMinMonthsInput('37').valid).toBe(false);
      expect(validateMinMonthsInput('2.5').valid).toBe(false);
      expect(validateMinMonthsInput('abc').valid).toBe(false);
    });
  });
});
