import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, X, ExternalLink, FileText, Check } from 'lucide-react';
import { apiClient } from '../api/client.js';
import { Btn, Chip } from './ui.js';

export const CURRENT_HEALTH_DATA_CONSENT_VERSION = '2026-09-v1';

export const HEALTH_DATA_CONSENT_TEXT = `Ich willige hiermit ausdrücklich ein, dass LONGEVITY meine Gesundheitsdaten (insbesondere Herzfrequenz, Herzfrequenzvariabilität, Schlafdauer, Schritte, Trainingsminuten, Blutdruck und Laborwerte) verarbeitet.

Zweck: Berechnung des Longevity Scores und der 4 Domänen, Hebel-Simulation sowie optionale kryptografische Zero-Knowledge-Freigaben für Partner.

Widerruf: Absolut freiwillig. Der Widerruf ist jederzeit in den Kontoeinstellungen mit Wirkung für die Zukunft möglich. Bereits verarbeitete Daten können gelöscht werden.`;

export interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsented?: () => void;
  sourceLabel?: string;
}

export function ConsentModal({ isOpen, onClose, onConsented, sourceLabel }: ConsentModalProps) {
  const queryClient = useQueryClient();
  const [agreed, setAgreed] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const consentMutation = useMutation({
    mutationFn: async () => {
      return apiClient<{ ok: boolean; consentAt: string; version: string }>('/account/consent', {
        method: 'POST',
        body: JSON.stringify({ version: CURRENT_HEALTH_DATA_CONSENT_VERSION }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'consent'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      onConsented?.();
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message || 'Einwilligung konnte nicht gespeichert werden.');
    },
  });

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 400,
        background: 'rgba(12, 20, 16, 0.55)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass"
        style={{
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          borderRadius: 24,
          padding: '28px 32px',
          background: 'rgba(255, 255, 255, 0.96)',
          boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'rgba(29, 158, 117, 0.12)',
              border: '1px solid rgba(29, 158, 117, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f6e56',
              flexShrink: 0,
            }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <Chip color="teal">Art. 9 DSGVO</Chip>
                <span style={{ fontSize: 11, color: '#888780' }}>Version 2026-09-v1</span>
              </div>
              <h2 id="consent-modal-title" style={{ fontSize: 18, fontWeight: 600, color: '#22221f', margin: 0 }}>
                Einwilligung zur Verarbeitung von Gesundheitsdaten
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#888780',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {sourceLabel && (
          <div style={{
            fontSize: 12,
            color: '#0f6e56',
            background: 'rgba(29, 158, 117, 0.08)',
            padding: '8px 12px',
            borderRadius: 10,
            border: '1px solid rgba(29, 158, 117, 0.2)',
          }}>
            Erforderlich vor dem Verbinden von: <strong>{sourceLabel}</strong>
          </div>
        )}

        {/* Core explanation pillars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#55544f', lineHeight: 1.5 }}>
          <p style={{ margin: 0, color: '#22221f' }}>
            Deine Vital- und Fitnessdaten gehören zu den <strong>besonderen Kategorien personenbezogener Daten</strong> nach Art. 9 DSGVO.
            Bevor wir Wearables oder Messdaten synchronisieren, benötigen wir deine ausdrückliche Einwilligung:
          </p>

          <div style={{
            background: 'rgba(0, 0, 0, 0.02)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: 14,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            <div>
              <strong style={{ color: '#22221f' }}>1. Welche Daten?</strong> Vitalwerte wie Puls, HRV, Schlafdauer, Schritte, Ausdauereinheiten, Blutdruck und Laborwerte.
            </div>
            <div>
              <strong style={{ color: '#22221f' }}>2. Wofür?</strong> Berechnung deines Longevity Scores, Analyse der 4 Langlebigkeits-Säulen und personalisierte Hebel. Auf deinen Wunsch: Erstellung datensparsamer, kryptografischer Nachweise (Zero Raw-Data).
            </div>
            <div>
              <strong style={{ color: '#22221f' }}>3. Freiwillig & jederzeit widerrufbar:</strong> Du kannst diese Einwilligung jederzeit mit Wirkung für die Zukunft in deinen Einstellungen widerrufen (Art. 7 Abs. 3 DSGVO).
            </div>
          </div>
        </div>

        {/* Expandable legal text */}
        <div>
          <button
            type="button"
            onClick={() => setShowFullText(!showFullText)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: 12,
              color: '#0f6e56',
              cursor: 'pointer',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <FileText size={14} />
            {showFullText ? 'Vollständigen Einwilligungstext einklappen' : 'Vollständigen Einwilligungstext anzeigen (Art. 9 DSGVO)'}
          </button>

          {showFullText && (
            <div style={{
              marginTop: 10,
              padding: '12px 14px',
              borderRadius: 12,
              background: 'rgba(0, 0, 0, 0.03)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              fontSize: 11,
              color: '#55544f',
              lineHeight: 1.6,
              maxHeight: 150,
              overflowY: 'auto',
              whiteSpace: 'pre-line',
            }}>
              {HEALTH_DATA_CONSENT_TEXT}
            </div>
          )}
        </div>

        {/* Link to Privacy Policy */}
        <div style={{ fontSize: 12, color: '#888780', display: 'flex', alignItems: 'center', gap: 4 }}>
          Ausführliche Informationen findest du in unserer{' '}
          <a
            href="/datenschutz"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#0f6e56', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 3 }}
          >
            Datenschutzerklärung <ExternalLink size={12} />
          </a>
        </div>

        {/* Checkbox confirmation */}
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: '12px 14px',
            borderRadius: 12,
            border: agreed ? '1.5px solid #0f6e56' : '1px solid rgba(0, 0, 0, 0.12)',
            background: agreed ? 'rgba(29, 158, 117, 0.06)' : 'rgba(0, 0, 0, 0.01)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{
              marginTop: 2,
              accentColor: '#0f6e56',
              width: 16,
              height: 16,
              cursor: 'pointer',
            }}
          />
          <span style={{ fontSize: 12, color: '#22221f', lineHeight: 1.45, fontWeight: 500 }}>
            Ich willige hiermit ausdrücklich in die Verarbeitung meiner Gesundheitsdaten gemäß Art. 9 Abs. 2 lit. a DSGVO zu den beschriebenen Zwecken ein.
          </span>
        </label>

        {error && (
          <div style={{ fontSize: 12, color: '#a32d2d' }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 6 }}>
          <Btn variant="secondary" onClick={onClose} disabled={consentMutation.isPending}>
            Abbrechen
          </Btn>
          <Btn
            onClick={() => consentMutation.mutate()}
            disabled={!agreed || consentMutation.isPending}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {consentMutation.isPending ? (
              'Wird gespeichert...'
            ) : (
              <>
                <Check size={14} /> Einwilligung erteilen & fortfahren
              </>
            )}
          </Btn>
        </div>
      </div>
    </div>
  );
}
