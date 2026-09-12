import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import { Card, PageTitle, Btn, GlassInput, FieldLabel, Modal, SectionLabel, Chip, MockBadge, Skeleton } from '../components/ui.js';

interface Source { id: string; kind: string; adapter: string; sampleCount: number; lastSyncAt: string | null; }
interface Token { id: string; bandLow: number; bandHigh: number; issuedAt: string; expiresAt: string; revokedAt: string | null; }

const SOURCE_LABELS: Record<string, string> = {
  apple_health: 'Apple Health', oura: 'Oura Ring', lab: 'Laborwerte', questionnaire: 'Fragebogen',
};

export function Component() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [validDays, setValidDays] = useState<30 | 90 | 180>(90);
  const [deletePassword, setDeletePassword] = useState('');

  const { data: sources, isLoading: srcLoading } = useQuery<Source[]>({
    queryKey: ['sources'],
    queryFn: () => apiClient<Source[]>('/sources'),
  });
  const { data: tokens, isLoading: tokLoading } = useQuery<Token[]>({
    queryKey: ['share-tokens'],
    queryFn: () => apiClient<Token[]>('/share-tokens'),
  });

  const createMut = useMutation({
    mutationFn: () => apiClient('/share-tokens', { method: 'POST', body: JSON.stringify({ validDays }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['share-tokens'] }); setShowCreate(false); },
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
            {sources?.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: i === 0 ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: '#22221f' }}>{SOURCE_LABELS[s.kind] ?? s.kind}</span>
                  {s.adapter === 'mock' && <MockBadge />}
                </div>
                <span style={{ fontSize: 12, color: '#888780' }}>
                  {s.sampleCount.toLocaleString('de-DE')} Werte · {s.lastSyncAt ? new Date(s.lastSyncAt).toLocaleDateString('de-DE') : 'Noch nie'}
                </span>
              </div>
            ))}
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
          <Btn small onClick={() => setShowCreate(true)} testId="create-token-btn">+ Neuer Nachweis</Btn>
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
                        {revoked && <Chip color="red">Widerrufen</Chip>}
                        {!revoked && expired && <Chip color="amber">Abgelaufen</Chip>}
                      </div>
                      <div style={{ fontSize: 12, color: '#888780', marginBottom: 4 }}>
                        Ausgestellt {new Date(token.issuedAt).toLocaleDateString('de-DE')} · Gültig bis {new Date(token.expiresAt).toLocaleDateString('de-DE')}
                      </div>
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
          <p style={{ fontSize: 13, color: '#55544f', lineHeight: 1.7, marginBottom: 20 }}>
            Der Nachweis zeigt ausschließlich dein Score-Band. Kein exakter Score, keine Einzelwerte.
          </p>
          <div style={{ marginBottom: 24 }}>
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
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setShowCreate(false)}>Abbrechen</Btn>
            <Btn onClick={() => createMut.mutate()} testId="confirm-create-token">Erstellen</Btn>
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
