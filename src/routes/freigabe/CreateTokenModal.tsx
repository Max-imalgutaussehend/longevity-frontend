import { useState } from 'react';
import { ShieldCheck, Check, AlertTriangle, XCircle, Info } from 'lucide-react';
import { Modal, FieldLabel, Chip, Btn } from '../../components/ui.js';
import { getSourceLabel } from '../../lib/formatters.js';
import type { Source, ScoreResult } from '../../api/types.js';
import { VERIFIED_ADAPTERS } from './freigabeTypes.js';

interface CreateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  sources: Source[] | undefined;
  score: ScoreResult | undefined;
  hasVerifiedSources: boolean;
  isPending: boolean;
  createError: string | null;
  onCreate: (days: 30 | 90 | 180, verifiedOnly: boolean) => void;
}

export function CreateTokenModal({
  isOpen,
  onClose,
  sources,
  score,
  hasVerifiedSources,
  isPending,
  createError,
  onCreate,
}: CreateTokenModalProps) {
  const [validDays, setValidDays] = useState<30 | 90 | 180>(90);
  const [verifiedOnly, setVerifiedOnly] = useState(hasVerifiedSources);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Compute a preview Kassen-Score from sources data (mirrors backend Bayesian shrinkage)
  const kassenScore = (() => {
    if (!score || !sources) return null;
    const totalSamples = sources.reduce((s, src) => s + src.sampleCount, 0);
    const verifiedSamples = sources
      .filter((s) => (VERIFIED_ADAPTERS as readonly string[]).includes(s.adapter) && s.enabled)
      .reduce((s, src) => s + src.sampleCount, 0);
    if (totalSamples === 0) return null;
    const verifiedCoverage = verifiedSamples / totalSamples;
    const rawScore = score.score;
    const shrunk = 50 + verifiedCoverage * (rawScore - 50);
    const bandLow = Math.floor(shrunk / 10) * 10;
    return { score: shrunk, bandLow, bandHigh: bandLow + 9, coverage: verifiedCoverage };
  })();

  const excludedSources = sources
    ? sources.filter((s) => ['upload', 'manual', 'questionnaire', 'mock'].includes(s.adapter) && s.sampleCount > 0)
    : [];

  const handleSelectVerified = (value: boolean) => {
    setVerifiedOnly(value);
    setLocalError(null);
  };

  const handleConfirm = () => {
    onCreate(validDays, verifiedOnly);
  };

  const displayError = localError ?? createError;

  return (
    <Modal onClose={onClose}>
      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Neuen Nachweis erstellen</div>
      <p style={{ fontSize: 13, color: '#55544f', lineHeight: 1.7, marginBottom: 16 }}>
        Der Nachweis zeigt ausschließlich dein Score-Band und das Ausstelldatum — kein exakter Score, keine Einzelwerte.
      </p>

      <FieldLabel>Nachweis-Art</FieldLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {/* Standard Mode Card */}
        <div
          onClick={() => handleSelectVerified(false)}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            cursor: 'pointer',
            background: !verifiedOnly ? 'rgba(29,158,117,0.08)' : 'rgba(0,0,0,0.02)',
            border: `1.5px solid ${!verifiedOnly ? 'rgba(29,158,117,0.35)' : 'rgba(0,0,0,0.08)'}`,
            transition: 'all 0.15s ease',
          }}
          data-testid="mode-standard"
        >
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!verifiedOnly}
              onChange={(e) => handleSelectVerified(!e.target.checked)}
              style={{ marginTop: 2, accentColor: '#1d9e75' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: !verifiedOnly ? '#0f6e56' : '#22221f' }}>
                  Allgemeiner Score-Nachweis
                </span>
                <Chip color="neutral">Sofort ausstellbar</Chip>
              </div>
              <div style={{ fontSize: 11, color: '#55544f', marginTop: 3, lineHeight: 1.4 }}>
                Nutzt alle Messdaten (inkl. Mock- und Labordaten). Sofort ausstellbar für Arbeitgeber oder Fitnessanbieter. Nicht kassenfähig.
              </div>
            </div>
          </label>
        </div>

        {/* Official Insurance Mode Card */}
        <div
          onClick={() => handleSelectVerified(true)}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            cursor: 'pointer',
            background: verifiedOnly ? 'rgba(29,158,117,0.08)' : 'rgba(0,0,0,0.02)',
            border: `1.5px solid ${verifiedOnly ? 'rgba(29,158,117,0.35)' : 'rgba(0,0,0,0.08)'}`,
            transition: 'all 0.15s ease',
          }}
          data-testid="mode-verified"
        >
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => handleSelectVerified(e.target.checked)}
              data-testid="verified-only-checkbox"
              style={{ marginTop: 2, accentColor: '#1d9e75' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: verifiedOnly ? '#0f6e56' : '#22221f' }}>
                  Offizieller Krankenkassen-Nachweis (GKV / PKV)
                </span>
                <Chip color="teal">Kassen-Rabatt</Chip>
              </div>
              <div style={{ fontSize: 11, color: '#55544f', marginTop: 3, lineHeight: 1.4 }}>
                Verwendet ausschließlich verifizierte Cloud-Quellen (Withings, Oura, Strava, Google Fit) und Labore. Mock- und manuelle Daten werden 100% ausgeschlossen.
              </div>
            </div>
          </label>

          {verifiedOnly && (
            <div style={{
              marginTop: 10,
              padding: '8px 10px',
              background: 'rgba(255,255,255,0.65)',
              borderRadius: 8,
              fontSize: 11,
              border: '1px solid rgba(0,0,0,0.06)',
              lineHeight: 1.4,
            }}>
              <div style={{ fontWeight: 600, color: '#22221f', marginBottom: 2 }}>
                Quellen-Prüfung für Kassenrabatt:
              </div>
              {sources?.some((s) => s.adapter === 'mock' && s.sampleCount > 0) && (
                <div style={{ color: '#854f0b', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <XCircle size={13} color="#a32d2d" style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Mock-Daten:</strong> {sources.find((s) => s.adapter === 'mock')?.sampleCount.toLocaleString('de-DE')} Werte <u>ausgeschlossen</u>.
                  </span>
                </div>
              )}
              {sources?.some((s) => ['upload', 'manual', 'questionnaire'].includes(s.adapter) && s.sampleCount > 0) && (
                <div style={{ color: '#55544f', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <XCircle size={13} color="#888780" style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Manuelle Uploads / Labor:</strong> Nicht-verifizierte Werte ausgeschlossen.
                  </span>
                </div>
              )}
              {hasVerifiedSources ? (
                <div style={{ color: '#0f6e56', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <Check size={13} color="#0f6e56" style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Verifizierte Cloud-Quellen:</strong>{' '}
                    {sources?.filter((s) => (VERIFIED_ADAPTERS as readonly string[]).includes(s.adapter) && s.enabled && s.sampleCount > 0).map((s) => getSourceLabel(s.kind)).join(', ')}.
                  </span>
                </div>
              ) : (
                <div style={{ color: '#a32d2d', display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, fontWeight: 500 }}>
                  <AlertTriangle size={13} color="#a32d2d" style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Keine verifizierte Quelle vorhanden:</strong> Erstellung als Kassen-Nachweis deaktiviert.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Standard-Score Preview */}
      {!verifiedOnly && score && (
        <div style={{
          marginBottom: 14,
          padding: '10px 14px',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.70)',
          border: '1px solid rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#22221f', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Info size={13} color="#55544f" />
            Score-Vorschau für diesen Standard-Nachweis
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)' }}>
              <div style={{ fontSize: 9, color: '#a3a29c', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gesamt-Score</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: '#22221f' }}>{score.score.toFixed(1)}</div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f6e56' }}>Band {score.band.low}–{score.band.high}</div>
              <div style={{ fontSize: 11, color: '#55544f', marginTop: 1 }}>
                Alle aktiven Datenquellen fließen vollständig ein.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Score preview: Gesamt vs. Kassen */}
      {verifiedOnly && score && kassenScore && (
        <div style={{
          marginBottom: 14,
          padding: '10px 14px',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.70)',
          border: '1px solid rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#22221f', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Info size={13} color="#55544f" />
            Score-Vorschau für diesen Nachweis
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {/* Gesamt-Score */}
            <div style={{ flex: 1, minWidth: 100, padding: '6px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)' }}>
              <div style={{ fontSize: 9, color: '#a3a29c', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gesamt-Score</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: '#22221f' }}>{score.score.toFixed(1)}</div>
              <div style={{ fontSize: 10, color: '#55544f', marginTop: 1 }}>Band {score.band.low}–{score.band.high}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#a3a29c', fontSize: 16, flexShrink: 0 }}>→</div>
            {/* Kassen-Score */}
            <div style={{
              flex: 1, minWidth: 100, padding: '6px 10px', borderRadius: 8,
              background: kassenScore.bandLow < score.band.low ? 'rgba(238,108,43,0.07)' : 'rgba(29,158,117,0.07)',
              border: kassenScore.bandLow < score.band.low ? '1px solid rgba(238,108,43,0.25)' : '1px solid rgba(29,158,117,0.25)',
            }}>
              <div style={{ fontSize: 9, color: '#a3a29c', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={10} color="#0f6e56" />
                Kassen-Nachweis
              </div>
              <div style={{ fontSize: 18, fontWeight: 500, color: kassenScore.bandLow < score.band.low ? '#c2410c' : '#0f6e56' }}>
                {kassenScore.score.toFixed(1)}
              </div>
              <div style={{ fontSize: 10, color: '#55544f', marginTop: 1 }}>Band {kassenScore.bandLow}–{kassenScore.bandHigh}</div>
            </div>
          </div>
          {excludedSources.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 10, color: '#55544f', lineHeight: 1.4 }}>
              ℹ️ {excludedSources.length} nicht-kassenfähige {excludedSources.length === 1 ? 'Quelle' : 'Quellen'} fließen nicht in das Zertifikat ein.
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <FieldLabel>Gültigkeit</FieldLabel>
        <div style={{ display: 'flex', gap: 8 }}>
          {([30, 90, 180] as const).map((d) => (
            <button
              key={d}
              onClick={() => setValidDays(d)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 10,
                border: `1px solid ${validDays === d ? 'rgba(29,158,117,0.4)' : 'rgba(0,0,0,0.1)'}`,
                background: validDays === d ? 'rgba(29,158,117,0.10)' : 'rgba(255,255,255,0.4)',
                color: validDays === d ? '#0f6e56' : '#55544f',
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {d} Tage
            </button>
          ))}
        </div>
      </div>

      {displayError && (
        <div style={{
          fontSize: 12,
          color: '#a32d2d',
          marginBottom: 16,
          padding: '10px 14px',
          borderRadius: 8,
          background: 'rgba(163,45,45,0.08)',
          border: '1px solid rgba(163,45,45,0.2)',
          lineHeight: 1.5,
        }}>
          {displayError}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
        {verifiedOnly && !hasVerifiedSources && (
          <div style={{ fontSize: 12, color: '#a32d2d', display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertTriangle size={13} color="#a32d2d" />
            Kassen-Nachweis erfordert mindestens eine verifizierte Datenquelle.
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', width: '100%' }}>
          <Btn variant="ghost" onClick={onClose}>Abbrechen</Btn>
          <Btn
            onClick={handleConfirm}
            testId="confirm-create-token"
            disabled={isPending || (verifiedOnly && !hasVerifiedSources)}
            title={verifiedOnly && !hasVerifiedSources ? 'Erfordert eine verifizierte Datenquelle' : undefined}
          >
            {isPending ? 'Erstelle…' : 'Erstellen'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
