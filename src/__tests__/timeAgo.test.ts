import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { timeAgo } from '../routes/Daten';

describe('timeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-13T16:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Heute" for timestamps in the future (e.g. UTC end-of-day)', () => {
    expect(timeAgo('2026-09-13T23:59:59.000Z')).toBe('Heute');
  });

  it('returns "Heute" for timestamps within the last minute', () => {
    expect(timeAgo('2026-09-13T15:59:45.000Z')).toBe('Heute');
  });

  it('returns minutes ago for timestamps under an hour ago', () => {
    expect(timeAgo('2026-09-13T15:45:00.000Z')).toBe('Vor 15 Min.');
  });

  it('returns hours ago for timestamps earlier today', () => {
    expect(timeAgo('2026-09-13T14:00:00.000Z')).toBe('Vor 2 Std.');
    expect(timeAgo('2026-09-13T15:00:00.000Z')).toBe('Vor 1 Std.');
  });

  it('returns "Gestern" for 1 day ago', () => {
    expect(timeAgo('2026-09-12T12:00:00.000Z')).toBe('Gestern');
  });

  it('returns "Vor X Tagen" for 2-6 days ago', () => {
    expect(timeAgo('2026-09-10T12:00:00.000Z')).toBe('Vor 3 Tagen');
  });

  it('returns localized date for 7+ days ago', () => {
    expect(timeAgo('2026-09-01T12:00:00.000Z')).toBe('01.09.');
  });
});
