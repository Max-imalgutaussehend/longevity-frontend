import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Check, AlertTriangle, XCircle, Info } from 'lucide-react';
import { apiClient } from '../api/client.js';
import { Card, PageTitle, Btn, GlassInput, FieldLabel, Modal, SectionLabel, Chip, Skeleton } from '../components/ui.js';

import type { Source, ScoreResult } from '../api/types.js';
interface Token {
  id: string;
  bandLow: number;
  bandHigh: number;
  issuedAt: string;
  expiresAt: string;
  revokedAt: string | null;
  partnerRef?: string | null;
  verifiedOnly?: boolean;
  trustLevel?: 'unverified' | 'cloud_verified' | 'certified_medical';
  verifiedSources?: string[];
  certificateType?: string;
}

import { getSourceLabel } from '../lib/formatters.js';

export const VERIFIED_ADAPTERS = ['withings', 'oura', 'strava', 'google-fit', 'google-health', 'fhir'];

export function Component() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [validDays, setValidDays] = useState<30 | 90 | 180>(90);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [hasInitializedDefault, setHasInitializedDefault] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');

  const { data: sources, isLoading: srcLoading } = useQuery<Source[]>({
    queryKey: ['sources'],
    queryFn: () => apiClient<Source[]>('/sources'),
  });
  const { data: tokens, isLoading: tokLoading } = useQuery<Token[]>({
    queryKey: ['share-tokens'],
    queryFn: () => apiClient<Token[]>('/share-tokens'),
  });
  const { data: score } = useQuery<ScoreResult>({
    queryKey: ['score', 'current'],
    queryFn: () => apiClient<ScoreResult>('/score/current'),
  });

  const hasVerifiedSources = Boolean(
    sources?.some((s) => VERIFIED_ADAPTERS.includes(s.adapter) && s.enabled && s.sampleCount > 0)
  );

  // Initialize verifiedOnly state once sources data is available
  useEffect(() => {
    if (sources && !hasInitializedDefault) {
      setVerifiedOnly(hasVerifiedSources);
      setHasInitializedDefault(true);
    }
  }, [sources, hasVerifiedSources, hasInitializedDefault]);

  const openCreateModal = () => {
    // Intelligently default to verified mode ONLY if the user has active verified sources
    setVerifiedOnly(hasVerifiedSources);
    setCreateError(null);
    setShowCreate(true);
  };

  // Compute a preview Kassen-Score from sources data (mirrors backend Bayesian shrinkage)
  // finalScore = 50 + coverage * (rawScore - 50) where coverage = verifiedSampleCount / totalSampleCount
  const kassenScore = (() => {
    if (!score || !sources) return null;
    const totalSamples = sources.reduce((s, src) => s + src.sampleCount, 0);
    const verifiedSamples = sources
      .filter((s) => VERIFIED_ADAPTERS.includes(s.adapter) && s.enabled)
      .reduce((s, src) => s + src.sampleCount, 0);
    if (totalSamples === 0) return null;
    const verifiedCoverage = verifiedSamples / totalSamples;
    const rawScore = score.score;
    const shrunk = 50 + verifiedCoverage * (rawScore - 50);
    const bandLow = Math.floor(shrunk / 10) * 10;
    return { score: shrunk, bandLow, bandHigh: bandLow + 9, coverage: verifiedCoverage };
  })();

  // Sources excluded from Kassen-Score for the explanation line
  const excludedSources = sources
    ? sources.filter((s) => ['upload', 'manual', 'questionnaire', 'mock'].includes(s.adapter) && s.sampleCount > 0)
    : [];

  const createMut = useMutation({
    mutationFn: () => apiClient('/share-tokens', {
      method: 'POST',
      body: JSON.stringify({ days: validDays, verifiedOnly }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['share-tokens'] });
      setShowCreate(false);
      setCreateError(null);
    },
    onError: (err: unknown) => {
      const e = err as { detail?: string; title?: string; message?: string };
      setCreateError(e?.detail ?? e?.title ?? e?.message ?? 'Fehler beim Erstellen des Nachweises.');
    },
  });

  const revokeMut = useMutation({
    mutationFn: (id: string) => apiClient(`/share-tokens/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['share-tokens'] }),
  });

  const deleteMut = useMutation({
    mutationFn: () => apiClient('/account', { method: 'DELETE', body: JSON.stringify({ password: deletePassword }) }),
    onSuccess: () => { window.location.href = '/login'; },
  });

  const exportMut = useMutation({
    mutationFn: async () => {
      const base = import.meta.env.VITE_API_BASE_URL ?? '/api';
      const res = await fetch(`${base}/account/export`, { credentials: 'include' });
      if (!res.ok) throw new Error('Export fehlgeschlagen.');

      const disposition = res.headers.get('Content-Disposition') ?? '';
      const filenameMatch = /filename="([^"]+)"/.exec(disposition);
      const filename = filenameMatch?.[1] ?? `longevity-export-${new Date().toISOString().slice(0, 10)}.json`;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <PageTitle title="Datenhoheit & Freigabe" />

      {/* What's stored */}
      <Card>
        <SectionLabel>Was gespeichert ist</SectionLabel>
        {srcLoading ? <Skeleton height={120} /> : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {sources?.filter((s) => s.enabled || s.sampleCount > 0).map((s, i) => {
              const isMock = s.adapter === 'mock';
              const isUnverified = ['upload', 'manual', 'questionnaire'].includes(s.adapter);
              const isVerified = ['withings', 'oura', 'strava', 'google-fit', 'google-health', 'fhir'].includes(s.adapter) && s.enabled;

              return (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: i === 0 ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: '#22221f', fontWeight: 500 }}>{getSourceLabel(s.kind)}</span>
                    {isMock && <Chip color="amber">Mock · Für Kassenrabatte ausgeschlossen</Chip>}
                    {isUnverified && <Chip color="neutral">Manuell · Nicht kassenfähig</Chip>}
                    {isVerified && (
                      <Chip color="teal">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <ShieldCheck size={12} />
                          Kassen-verifiziert
                        </span>
                      </Chip>
                    )}
                    {!s.enabled && !isMock && <Chip color="neutral">Deaktiviert</Chip>}
                  </div>
                  <span style={{ fontSize: 12, color: '#888780' }}>
                    {s.sampleCount.toLocaleString('de-DE')} Werte · {s.lastSyncAt ? new Date(s.lastSyncAt).toLocaleDateString('de-DE') : 'Noch nie'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <Btn variant="secondary" small onClick={() => exportMut.mutate()} testId="export-account-btn">
            {exportMut.isPending ? 'Exportiere…' : 'Alle Daten exportieren'}
          </Btn>
          <Btn variant="danger" small onClick={() => setShowDelete(true)}>Konto löschen</Btn>
        </div>
        {exportMut.isError && (
          <div style={{ fontSize: 12, color: '#a32d2d', marginTop: 10 }}>Export fehlgeschlagen. Bitte erneut versuchen.</div>
        )}
      </Card>

      {/* Tokens */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <SectionLabel>Aktive Nachweise</SectionLabel>
          <Btn small onClick={openCreateModal} testId="create-token-btn">+ Neuer Nachweis</Btn>
        </div>
        <p style={{ fontSize: 12, color: '#888780', marginBottom: 24 }}>
          Übertragen wird ausschließlich das Score-Band und das Ausstelldatum — kein exakter Score, keine Einzelwerte.
        </p>
        {tokLoading ? <Skeleton height={80} /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tokens?.map((token) => {
              const revoked = !!token.revokedAt;
              const expired = new Date() > new Date(token.expiresAt);
              return (
                <div key={token.id} className="glass" style={{ borderRadius: 14, padding: '20px 24px', opacity: revoked ? 0.5 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{
                          padding: '5px 16px', borderRadius: 999,
                          background: revoked ? 'rgba(0,0,0,0.05)' : 'rgba(29,158,117,0.10)',
                          color: revoked ? '#888780' : '#0f6e56',
                          fontSize: 15, fontWeight: 500,
                          border: revoked ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(29,158,117,0.2)',
                        }}>
                          Band {token.bandLow}–{token.bandHigh}
                        </span>
                        {token.verifiedOnly ? (
                          <Chip color="teal">GKV / PKV Verifiziert</Chip>
                        ) : (
                          <Chip color="neutral">Standard Score-Nachweis</Chip>
                        )}
                        {revoked && <Chip color="red">Widerrufen</Chip>}
                        {!revoked && expired && <Chip color="amber">Abgelaufen</Chip>}
                      </div>
                      <div style={{ fontSize: 12, color: '#888780', marginBottom: 4 }}>
                        Ausgestellt {new Date(token.issuedAt).toLocaleDateString('de-DE')} · Gültig bis {new Date(token.expiresAt).toLocaleDateString('de-DE')}
                      </div>
                      {token.verifiedSources && token.verifiedSources.length > 0 && (
                        <div style={{ fontSize: 11, color: '#0f6e56', marginBottom: 4 }}>
                          Verifizierte Quellen: {token.verifiedSources.map((s) => getSourceLabel(s)).join(', ')}
                        </div>
                      )}
                      <code data-testid="token-verify-url" style={{ fontSize: 11, color: '#a3a29c' }}>{window.location.origin}/verify/{token.id}</code>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Btn small variant="secondary" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/verify/${token.id}`)}>
                        Link kopieren
                      </Btn>
                      {!revoked && (
                        <Btn small variant="danger" onClick={() => revokeMut.mutate(token.id)} testId="revoke-token-btn">Widerrufen</Btn>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {tokens?.length === 0 && (
              <p style={{ color: '#a3a29c', fontSize: 13 }}>Noch keine Nachweise erstellt.</p>
            )}
          </div>
        )}
      </Card>

      {showCreate && (
        <Modal onClose={() => setShowCreate(false)}>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Neuen Nachweis erstellen</div>
          <p style={{ fontSize: 13, color: '#55544f', lineHeight: 1.7, marginBottom: 16 }}>
            Der Nachweis zeigt ausschließlich dein Score-Band und das Ausstelldatum — kein exakter Score, keine Einzelwerte.
          </p>

          <FieldLabel>Nachweis-Art</FieldLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {/* Standard Mode Card */}
            <div
              onClick={() => { setVerifiedOnly(false); setCreateError(null); }}
              style={{
                padding: '14px 16px',
                borderRadius: 12,
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
                  onChange={(e) => { setVerifiedOnly(!e.target.checked); setCreateError(null); }}
                  style={{ marginTop: 3, accentColor: '#1d9e75' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: !verifiedOnly ? '#0f6e56' : '#22221f' }}>
                      Allgemeiner Score-Nachweis
                    </span>
                    <Chip color="neutral">Sofort ausstellbar</Chip>
                  </div>
                  <div style={{ fontSize: 12, color: '#55544f', marginTop: 4, lineHeight: 1.5 }}>
                    Nutzt alle vorliegenden Messdaten (inkl. manueller Eingaben, Mock- und Labordaten). Sofort ausstellbar für Arbeitgeber, Fitness-Anbieter (z. B. Urban Sports Club) oder den persönlichen Nachweis. Nicht kassenfähig.
                  </div>
                </div>
              </label>
            </div>

            {/* Official Insurance Mode Card */}
            <div
              onClick={() => { setVerifiedOnly(true); setCreateError(null); }}
              style={{
                padding: '14px 16px',
                borderRadius: 12,
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
                  onChange={(e) => {
                    setVerifiedOnly(e.target.checked);
                    setCreateError(null);
                  }}
                  data-testid="verified-only-checkbox"
                  style={{ marginTop: 3, accentColor: '#1d9e75' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: verifiedOnly ? '#0f6e56' : '#22221f' }}>
                      Offizieller Krankenkassen-Nachweis (GKV / PKV)
                    </span>
                    <Chip color="teal">Kassen-Rabatt</Chip>
                  </div>
                  <div style={{ fontSize: 12, color: '#55544f', marginTop: 4, lineHeight: 1.5 }}>
                    Verwendet ausschließlich verifizierte Cloud-Quellen (Withings, Oura, Strava, Google Fit) und medizinische Labore. Mock- und manuelle Daten werden automatisch ausgeschlossen.
                  </div>
                </div>
              </label>

              {verifiedOnly && (
                <div style={{
                  marginTop: 12,
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.65)',
                  borderRadius: 8,
                  fontSize: 12,
                  border: '1px solid rgba(0,0,0,0.06)',
                  lineHeight: 1.5,
                }}>
                  <div style={{ fontWeight: 600, color: '#22221f', marginBottom: 4 }}>
                    Quellen-Prüfung für Kassenrabatt:
                  </div>
                  {sources?.some((s) => s.adapter === 'mock' && s.sampleCount > 0) && (
                    <div style={{ color: '#854f0b', display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                      <XCircle size={14} color="#a32d2d" style={{ flexShrink: 0 }} />
                      <span>
                        <strong>Mock-Daten:</strong> {sources.find((s) => s.adapter === 'mock')?.sampleCount.toLocaleString('de-DE')} generierte Werte werden <u>vollständig ausgeschlossen</u>.
                      </span>
                    </div>
                  )}
                  {sources?.some((s) => ['upload', 'manual', 'questionnaire'].includes(s.adapter) && s.sampleCount > 0) && (
                    <div style={{ color: '#55544f', display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                      <XCircle size={14} color="#888780" style={{ flexShrink: 0 }} />
                      <span>
                        <strong>Manuelle Uploads / Labor:</strong> Nicht-verifizierte Werte werden ausgeschlossen.
                      </span>
                    </div>
                  )}
                  {hasVerifiedSources ? (
                    <div style={{ color: '#0f6e56', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <Check size={14} color="#0f6e56" style={{ flexShrink: 0 }} />
                      <span>
                        <strong>Verifizierte Cloud-Quellen:</strong> {sources?.filter((s) => VERIFIED_ADAPTERS.includes(s.adapter) && s.enabled && s.sampleCount > 0).map((s) => getSourceLabel(s.kind)).join(', ')} (fließen in den Score ein).
                      </span>
                    </div>
                  ) : (
                    <div style={{ color: '#a32d2d', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontWeight: 500 }}>
                      <AlertTriangle size={14} color="#a32d2d" style={{ flexShrink: 0 }} />
                      <span>
                        <strong>Keine verifizierte Quelle vorhanden:</strong> Erstellung als Kassen-Nachweis ist deaktiviert. Bitte wähle den allgemeinen Score-Nachweis oder binde zuerst einen echten Tracker unter Datenquellen an.
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
              marginBottom: 20,
              padding: '14px 16px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.70)',
              border: '1px solid rgba(0,0,0,0.08)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#22221f', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Info size={14} color="#55544f" />
                Score-Vorschau für diesen Standard-Nachweis
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)' }}>
                  <div style={{ fontSize: 10, color: '#a3a29c', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gesamt-Score</div>
                  <div style={{ fontSize: 22, fontWeight: 500, color: '#22221f', letterSpacing: '-0.02em' }}>{score.score.toFixed(1)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f6e56' }}>Band {score.band.low}–{score.band.high}</div>
                  <div style={{ fontSize: 12, color: '#55544f', marginTop: 2 }}>
                    Alle aktiven Datenquellen (inkl. manueller Eingaben) fließen vollständig in diesen Nachweis ein.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Score preview: Gesamt vs. Kassen */}
          {verifiedOnly && score && kassenScore && (
            <div style={{
              marginBottom: 20,
              padding: '14px 16px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.70)',
              border: '1px solid rgba(0,0,0,0.08)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#22221f', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Info size={14} color="#55544f" />
                Score-Vorschau für diesen Nachweis
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {/* Gesamt-Score */}
                <div style={{ flex: 1, minWidth: 120, padding: '10px 14px', borderRadius: 10, background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)' }}>
                  <div style={{ fontSize: 10, color: '#a3a29c', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dein Gesamt-Score</div>
                  <div style={{ fontSize: 22, fontWeight: 500, color: '#22221f', letterSpacing: '-0.02em' }}>{score.score.toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: '#55544f', marginTop: 2 }}>Band {score.band.low}–{score.band.high}</div>
                </div>
                {/* Arrow */}
                <div style={{ display: 'flex', alignItems: 'center', color: '#a3a29c', fontSize: 18, flexShrink: 0 }}>→</div>
                {/* Kassen-Score */}
                <div style={{
                  flex: 1, minWidth: 120, padding: '10px 14px', borderRadius: 10,
                  background: kassenScore.bandLow < score.band.low ? 'rgba(238,108,43,0.07)' : 'rgba(29,158,117,0.07)',
                  border: kassenScore.bandLow < score.band.low ? '1px solid rgba(238,108,43,0.25)' : '1px solid rgba(29,158,117,0.25)',
                }}>
                  <div style={{ fontSize: 10, color: '#a3a29c', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ShieldCheck size={11} color="#0f6e56" />
                    Kassen-Nachweis
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: kassenScore.bandLow < score.band.low ? '#c2410c' : '#0f6e56' }}>
                    {kassenScore.score.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 11, color: '#55544f', marginTop: 2 }}>Band {kassenScore.bandLow}–{kassenScore.bandHigh}</div>
                </div>
              </div>
              {excludedSources.length > 0 && (
                <div style={{ marginTop: 10, fontSize: 11, color: '#55544f', lineHeight: 1.5 }}>
                  <span style={{ color: '#888780' }}>ℹ️ </span>
                  <strong>{excludedSources.length} {excludedSources.length === 1 ? 'Quelle ist' : 'Quellen sind'} nicht kassenfähig</strong>{' '}
                  (z. B. {excludedSources.map((s) => getSourceLabel(s.kind)).join(', ')}) und fließen nicht in das offizielle Zertifikat ein.
                  {kassenScore.bandLow < score.band.low && (
                    <span> Durch die geringere Datenabdeckung zieht der Score in Richtung Kohortenmittelwert (50 Pkt.).</span>
                  )}
                </div>
              )}
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <FieldLabel>Gültigkeit</FieldLabel>

            <div style={{ display: 'flex', gap: 8 }}>
              {([30, 90, 180] as const).map((d) => (
                <button key={d} onClick={() => setValidDays(d)} style={{
                  flex: 1, padding: '8px', borderRadius: 10,
                  border: `1px solid ${validDays === d ? 'rgba(29,158,117,0.4)' : 'rgba(0,0,0,0.1)'}`,
                  background: validDays === d ? 'rgba(29,158,117,0.10)' : 'rgba(255,255,255,0.4)',
                  color: validDays === d ? '#0f6e56' : '#55544f',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  {d} Tage
                </button>
              ))}
            </div>
          </div>

          {createError && (
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
              {createError}
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
              <Btn variant="ghost" onClick={() => setShowCreate(false)}>Abbrechen</Btn>
              <Btn
                onClick={() => createMut.mutate()}
                testId="confirm-create-token"
                disabled={createMut.isPending || (verifiedOnly && !hasVerifiedSources)}
                title={verifiedOnly && !hasVerifiedSources ? 'Erfordert eine verifizierte Datenquelle' : undefined}
              >
                {createMut.isPending ? 'Erstelle…' : 'Erstellen'}
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {showDelete && (
        <Modal onClose={() => setShowDelete(false)}>
          <div style={{ fontSize: 16, fontWeight: 500, color: '#a32d2d', marginBottom: 8 }}>Konto unwiderruflich löschen</div>
          <p style={{ fontSize: 13, color: '#55544f', lineHeight: 1.7, marginBottom: 16 }}>
            Gelöscht werden: alle Messwerte, Score-Snapshots, Nachweise und dein Konto. Diese Aktion ist nicht umkehrbar.
          </p>
          <div style={{ marginBottom: 20 }}>
            <FieldLabel>Passwort zur Bestätigung</FieldLabel>
            <GlassInput type="password" placeholder="Dein Passwort" value={deletePassword} onChange={setDeletePassword} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setShowDelete(false)}>Abbrechen</Btn>
            <Btn variant="danger" onClick={() => deleteMut.mutate()}>Konto löschen</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
