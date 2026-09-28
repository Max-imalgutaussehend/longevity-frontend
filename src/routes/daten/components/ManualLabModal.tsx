import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FlaskConical, Calendar } from 'lucide-react';
import { Modal, Btn, GlassInput, FieldLabel, InfoTooltip } from '../../../components/ui.js';
import { apiClient } from '../../../api/client.js';
import { MANUAL_LAB_FIELDS } from '../datenTypes.js';

export interface ManualLabModalProps {
  isOpen: boolean;
  initialMetric?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function validateManualLabInput(
  sampledAt: string,
  labValues: Record<string, string>,
): {
  isValid: boolean;
  error?: string;
  payload?: Array<{ metric: string; value: number; unit: string; measuredAt: string }>;
} {
  if (!sampledAt || sampledAt.trim() === '') {
    return { isValid: false, error: 'Bitte ein Abnahmedatum angeben.' };
  }

  const dateObj = new Date(sampledAt);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Ungültiges Abnahmedatum.' };
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (dateObj > today) {
    return { isValid: false, error: 'Das Abnahmedatum darf nicht in der Zukunft liegen.' };
  }

  const payload: Array<{ metric: string; value: number; unit: string; measuredAt: string }> = [];

  for (const field of MANUAL_LAB_FIELDS) {
    const raw = labValues[field.key];
    if (raw === undefined || raw === null || raw.trim() === '') {
      continue;
    }

    const num = Number(raw.replace(',', '.'));
    if (isNaN(num)) {
      return { isValid: false, error: `${field.label}: Bitte eine gültige Zahl eingeben.` };
    }

    if (num < field.min || num > field.max) {
      return {
        isValid: false,
        error: `${field.label}: Wert muss zwischen ${field.min} und ${field.max} ${field.unit} liegen.`,
      };
    }

    payload.push({
      metric: field.key,
      value: num,
      unit: field.unit,
      measuredAt: dateObj.toISOString(),
    });
  }

  if (payload.length === 0) {
    return { isValid: false, error: 'Bitte mindestens einen Laborwert eingeben.' };
  }

  return { isValid: true, payload };
}

export function ManualLabModal({
  isOpen,
  initialMetric,
  onClose,
  onSuccess,
}: ManualLabModalProps) {
  const queryClient = useQueryClient();
  const [sampledAt, setSampledAt] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [labValues, setLabValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (initialMetric) {
        // focus field after modal renders
        setTimeout(() => {
          const el = document.querySelector<HTMLInputElement>(`[data-testid="manual-lab-${initialMetric}"]`);
          el?.focus();
        }, 100);
      }
    }
  }, [isOpen, initialMetric]);

  if (!isOpen) return null;

  const handleValueChange = (metricKey: string, val: string) => {
    setLabValues((prev) => ({ ...prev, [metricKey]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = validateManualLabInput(sampledAt, labValues);
    if (!result.isValid || !result.payload) {
      setError(result.error ?? 'Ungültige Eingaben.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient('/labs', {
        method: 'POST',
        body: JSON.stringify({ values: result.payload }),
      });
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      queryClient.invalidateQueries({ queryKey: ['score'] });
      queryClient.invalidateQueries({ queryKey: ['samples'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      setLabValues({});
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Fehler beim Speichern der Laborwerte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ color: '#0f6e56' }}>
              <FlaskConical size={24} />
            </span>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#22221f' }}>
              Laborwerte manuell eintragen
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#55544f', margin: 0, lineHeight: 1.5 }}>
            Trage Messwerte aus deinem Laborbericht oder deiner Blutdruckmessung ein.
            Alle Werte fließen direkt in deinen Longevity-Score ein.
          </p>
        </div>

        <div>
          <FieldLabel>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={14} color="#0f6e56" />
              Abnahmedatum / Messdatum (Pflicht)
            </span>
          </FieldLabel>
          <GlassInput
            testId="manual-lab-date"
            type="date"
            value={sampledAt}
            onChange={setSampledAt}
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0f6e56', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            Messwerte
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {MANUAL_LAB_FIELDS.map((f) => {
              const isHighlighted = initialMetric === f.key;
              return (
                <div
                  key={f.key}
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    background: isHighlighted ? 'rgba(29,158,117,0.06)' : 'transparent',
                    border: isHighlighted ? '1px solid rgba(29,158,117,0.25)' : '1px solid transparent',
                  }}
                >
                  <FieldLabel>
                    {f.label} ({f.unit})
                    {f.tooltip && <InfoTooltip text={f.tooltip} />}
                  </FieldLabel>
                  <GlassInput
                    testId={`manual-lab-${f.key}`}
                    type="number"
                    step={f.step || 'any'}
                    placeholder={f.placeholder}
                    value={labValues[f.key] ?? ''}
                    onChange={(v) => handleValueChange(f.key, v)}
                  />
                  <div style={{ fontSize: 11, color: '#888780', marginTop: 4 }}>
                    Bereich: {f.min} – {f.max} {f.unit}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div
            data-testid="manual-lab-error"
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(163,45,45,0.08)',
              border: '1px solid rgba(163,45,45,0.25)',
              color: '#a32d2d',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <Btn variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Abbrechen
          </Btn>
          <Btn type="submit" testId="submit-manual-lab" disabled={isSubmitting}>
            {isSubmitting ? 'Wird gespeichert...' : 'Laborwerte speichern'}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
