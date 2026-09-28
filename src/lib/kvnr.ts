/**
 * Validiert eine Krankenversichertennummer (KVNR) nach dem offiziellen
 * Modulo-10-Prüfziffernverfahren der Spitzenverbände der Krankenkassen (§ 290 SGB V).
 *
 * Struktur:
 * - 10-stellig: 1 Großbuchstabe (A–Z) + 9 Ziffern.
 * - Buchstabe wird zu zweistelliger Zahl (A=01, ..., Z=26).
 * - Alternierende Gewichtung der 10 Ziffern mit [1, 2, 1, 2, 1, 2, 1, 2, 1, 2].
 * - Zweistellige Produkte werden quersummiert.
 * - Prüfziffer = (10 - (Summe % 10)) % 10.
 */
export function validateKvnr(kvnr: string | null | undefined): {
  valid: boolean;
  error?: string;
  normalized?: string;
} {
  if (!kvnr || typeof kvnr !== 'string') {
    return { valid: false, error: 'Bitte Krankenversichertennummer eingeben.' };
  }

  const clean = kvnr.trim().toUpperCase();
  if (!clean) {
    return { valid: false, error: 'Bitte Krankenversichertennummer eingeben.' };
  }

  if (clean.length < 10) {
    return { valid: false, error: `Noch ${10 - clean.length} Zeichen fehlen (Format: A123456789).` };
  }

  if (!/^[A-Z]\d{9}$/.test(clean)) {
    return {
      valid: false,
      error: 'Format ungültig: 1 Buchstabe gefolgt von 9 Ziffern (z. B. A123456789).',
    };
  }

  const letterNum = (clean.charCodeAt(0) - 64).toString().padStart(2, '0');
  const digits = (letterNum + clean.slice(1, 9)).split('').map(Number);
  const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const prod = digits[i] * weights[i];
    sum += prod >= 10 ? Math.floor(prod / 10) + (prod % 10) : prod;
  }

  const expectedCheckDigit = (10 - (sum % 10)) % 10;
  const actualCheckDigit = Number(clean[9]);

  if (expectedCheckDigit !== actualCheckDigit) {
    return {
      valid: false,
      error: 'Prüfziffer ist ungültig. Bitte Nummer auf deiner Gesundheitskarte (eGK) prüfen.',
    };
  }

  return { valid: true, normalized: clean };
}

/**
 * Hilfsfunktion zum Bereinigen und Formatieren während der Tastatureingabe.
 */
export function formatKvnrInput(val: string): string {
  if (!val) return '';
  const trimmed = val.trim();
  const first = trimmed.slice(0, 1).toUpperCase().replace(/[^A-Z]/g, '');
  const rest = trimmed.slice(1, 10).replace(/\D/g, '');
  return (first + rest).slice(0, 10);
}
