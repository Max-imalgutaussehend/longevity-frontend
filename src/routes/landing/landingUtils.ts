import { useEffect } from 'react';

export interface SimulatedScoreResult {
  score: number;
  vitalityAge: number;
  chronoAge: number;
  yearsGained: number;
  band: string;
  bandColor: string;
}

/**
 * Calculates a simulated vitality score and biological age projection based on
 * key health biomarkers (resting HR, sleep duration, VO2max, Zone 2 training).
 * Shared across the landing page live simulator and automated test assertions (DRY).
 */
export function calculateSimulatedScore(
  restingHr: number,
  sleepHours: number,
  vo2max: number,
  zone2Min: number,
): SimulatedScoreResult {
  const hrImpact = (65 - restingHr) * 0.45;
  const sleepImpact = (Math.min(sleepHours, 8.2) - 6.5) * 4.2;
  const vo2Impact = (vo2max - 38) * 0.85;
  const zone2Impact = (Math.min(zone2Min, 240) - 90) * 0.08;

  const rawScore = 60 + hrImpact + sleepImpact + vo2Impact + zone2Impact;
  const score = Math.max(15, Math.min(98, Math.round(rawScore)));

  const chronoAge = 34;
  const ageDelta = ((score - 50) / 10) * -1.2;
  const vitalityAge = Math.max(20, Math.round((chronoAge + ageDelta) * 10) / 10);

  const bandLow = Math.min(90, Math.floor(score / 10) * 10);
  const band = `Band ${bandLow}–${bandLow + 9}`;
  const bandColor = score >= 80 ? '#0f6e56' : score >= 65 ? '#1d9e75' : score >= 50 ? '#55544f' : '#854f0b';

  return {
    score,
    vitalityAge,
    chronoAge,
    yearsGained: Math.round((chronoAge - vitalityAge) * 10) / 10,
    band,
    bandColor,
  };
}

/**
 * Utility to reliably copy text to the system clipboard across modern and legacy browsers.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback to execCommand below
    }
  }

  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Hook to progressively reveal elements with the .scroll-reveal class on scroll.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' },
    );
    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}
