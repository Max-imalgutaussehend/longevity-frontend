import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import { Card, PageTitle, Btn, GlassInput, GlassSelect, FieldLabel, InfoTooltip, Modal, SectionLabel, Toggle, MockBadge, Skeleton } from '../components/ui.js';
import type { ScoreResult } from '../api/types.js';

interface Source {
  id: string; kind: string; adapter: string; enabled: boolean;
  lastSyncAt: string | null; sampleCount: number;
}

const SOURCE_LABELS: Record<string, { label: string; metrics: string[] }> = {
  apple_health: { label: 'Apple Health', metrics: ['VO₂max', 'Ruhepuls', 'HRV', 'Schritte', 'Schlafdauer'] },
  oura: { label: 'Oura Ring', metrics: ['HRV', 'Schlafdauer', 'Schlafkonsistenz'] },
  lab: { label: 'Laborwerte', metrics: ['LDL', 'HDL', 'HbA1c', 'Blutdruck', 'hsCRP'] },
  questionnaire: { label: 'Fragebogen', metrics: ['Rauchen', 'Alkohol'] },
};

const LAB_FIELDS = [
  { key: 'ldl', label: 'LDL-Cholesterin', unit: 'mg/dL', placeholder: 'z. B. 110' },
  { key: 'hdl', label: 'HDL-Cholesterin', unit: 'mg/dL', placeholder: 'z. B. 52' },
  { key: 'hba1c', label: 'HbA1c', unit: '%', placeholder: 'z. B. 5,2' },
  { key: 'systolic_bp', label: 'Systolischer Blutdruck', unit: 'mmHg', placeholder: 'z. B. 118' },
  { key: 'hscrp', label: 'hsCRP', unit: 'mg/L', placeholder: 'z. B. 0,8' },
  { key: 'waist', label: 'Taillenumfang', unit: 'cm', placeholder: 'z. B. 84' },
];

const SMOKING_OPTIONS = [
  { value: '0', label: 'Nie' },
  { value: '1', label: 'Ehemalig (>1 Jahr)' },
  { value: '2', label: 'Ehemalig (<1 Jahr)' },
  { value: '3', label: 'Aktuell' },
];

const LIFESTYLE_FIELDS: Array<{
  key: 'smoking' | 'alcohol_units' | 'strength_sessions' | 'zone2_minutes';
  label: string;
  unit: string;
  kind: 'select' | 'number';
  min?: number;
  max?: number;
  tooltip?: string;
  placeholder?: string;
}> = [
  { key: 'smoking', label: 'Rauchen', unit: 'category', kind: 'select' },
  {
    key: 'alcohol_units', label: 'Alkohol-Einheiten pro Woche', unit: 'units/week', kind: 'number',
    min: 0, placeholder: 'z. B. 4',
    tooltip: '1 Einheit = 10g Alkohol ≈ 1 kleines Bier',
  },
  {
    key: 'strength_sessions', label: 'Krafteinheiten pro Woche', unit: '/week', kind: 'number',
    min: 0, max: 4, placeholder: 'z. B. 2',
  },
  {
    key: 'zone2_minutes', label: 'Zone-2-Minuten pro Woche', unit: 'min/week', kind: 'number',
    min: 0, placeholder: 'z. B. 90',
    tooltip: 'Lockeres Ausdauertraining — "könnte sich noch unterhalten"',
  },
];

function daysAgoLabel(days: number | null): string | null {
  if (days === null) return null;
  if (days < 1) return 'Heute eingetragen';
  if (days < 2) return 'Vor 1 Tag eingetragen';
  return `Vor ${Math.round(days)} Tagen eingetragen`;
}

export function Component() {
  const qc = useQueryClient();
  const [consentId, setConsentId] = useState<string | null>(null);
  const [tab, setTab] = useState<'upload' | 'webhook' | 'lab'>('upload');
  const [labVals, setLabVals] = useState<Record<string, string>>({});
  const [labDate, setLabDate] = useState('');
  const [lifestyleVals, setLifestyleVals] = useState<Record<string, string>>({});
  const [lifestyleError, setLifestyleError] = useState<string | null>(null);

  const { data: sources, isLoading } = useQuery<Source[]>({
    queryKey: ['sources'],
    queryFn: () => apiClient<Source[]>('/sources'),
  });

  const { data: score } = useQuery<ScoreResult>({
    queryKey: ['score', 'current'],
    queryFn: () => apiClient<ScoreResult>('/score/current'),
  });

  const lifestyleMetrics = score?.domains.flatMap((d) => d.metrics) ?? [];
  const lifestyleMeta = Object.fromEntries(
    LIFESTYLE_FIELDS.map((f) => [f.key, lifestyleMetrics.find((m) => m.metric === f.key)]),
  );

  const labsMut = useMutation({
    mutationFn: (values: Array<{ metric: string; value: number; unit: string; measuredAt?: string }>) =>
      apiClient('/labs', { method: 'POST', body: JSON.stringify({ values }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sources'] });
      qc.invalidateQueries({ queryKey: ['score'] });
    },
  });

  function submitLifestyle() {
    setLifestyleError(null);
    const values: Array<{ metric: string; value: number; unit: string }> = [];

    for (const f of LIFESTYLE_FIELDS) {
      const raw = lifestyleVals[f.key];
      if (raw === undefined || raw === '') continue;

      const num = Number(raw.replace(',', '.'));
      if (isNaN(num)) continue;
      if (num < (f.min ?? 0)) {
        setLifestyleError(`${f.label}: Wert darf nicht negativ sein.`);
        return;
      }
      if (f.max !== undefined && num > f.max) {
        setLifestyleError(`${f.label}: Wert darf maximal ${f.max} sein.`);
        return;
      }

      values.push({ metric: f.key, value: num, unit: f.unit });
    }

    if (values.length === 0) return;
    labsMut.mutate(values);
  }

  const patchMut = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      apiClient(`/sources/${id}`, { method: 'PATCH', body: JSON.stringify({ enabled }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sources'] }); qc.invalidateQueries({ queryKey: ['score'] }); },
  });

  const regenMut = useMutation({
    mutationFn: (id: string) => apiClient(`/sources/${id}/regenerate`, { method: 'POST' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sources'] }); qc.invalidateQueries({ queryKey: ['score'] }); },
  });

  function handleToggle(source: Source) {
    if (!source.enabled) { setConsentId(source.id); return; }
    patchMut.mutate({ id: source.id, enabled: false });
  }

  function confirmConsent() {
    if (!consentId) return;
    patchMut.mutate({ id: consentId, enabled: true });
    setConsentId(null);
  }

  const consentSource = sources?.find((s) => s.id === consentId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <PageTitle title="Datenquellen" />

            <div className="responsive-grid-2">
        {isLoading ? [1, 2, 3, 4].map((i) => <Card key={i}><Skeleton height={100} /></Card>) :
          sources?.map((s) => {
            const info = SOURCE_LABELS[s.kind] ?? { label: s.kind, metrics: [] };
            const syncAgo = s.lastSyncAt ? new Date(s.lastSyncAt).toLocaleDateString('de-DE') : 'Noch nie';
            return (
              <Card key={s.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#22221f' }}>{info.label}</span>
                      {s.adapter === 'mock' && <MockBadge />}
                    </div>
                    <div style={{ fontSize: 12, color: '#888780' }}>
                      {s.sampleCount.toLocaleString('de-DE')} Messwerte · {syncAgo}
                    </div>
                  </div>
                  <Toggle on={s.enabled} onChange={() => handleToggle(s)} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {info.metrics.map((m) => (
                    <span key={m} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'rgba(0,0,0,0.04)', color: '#55544f', border: '1px solid rgba(0,0,0,0.06)' }}>
                      {m}
                    </span>
                  ))}
                </div>
                {s.adapter === 'mock' && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <button
                      onClick={() => regenMut.mutate(s.id)}
                      style={{ fontSize: 12, color: '#0f6e56', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
                    >
                      ↻ Daten neu generieren
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
      </div>

      {consentId && consentSource && (
        <Modal onClose={() => setConsentId(null)}>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 10 }}>Datenquelle aktivieren</div>
          <p style={{ fontSize: 13, color: '#55544f', lineHeight: 1.7, marginBottom: 24 }}>
            <strong>{SOURCE_LABELS[consentSource.kind]?.label ?? consentSource.kind}</strong> liefert Metriken zu {SOURCE_LABELS[consentSource.kind]?.metrics.join(', ')}.
            Die Verarbeitung erfolgt auf Grundlage deiner ausdrücklichen Einwilligung nach Art. 9 DSGVO.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setConsentId(null)}>Abbrechen</Btn>
            <Btn onClick={confirmConsent}>Einwilligen & aktivieren</Btn>
          </div>
        </Modal>
      )}

      <Card>
        <SectionLabel>Daten importieren</SectionLabel>
        <div style={{ display: 'flex', gap: 2, marginBottom: 28, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          {(['upload', 'webhook', 'lab'] as const).map((id) => {
            const labels = { upload: 'Export-Upload', webhook: 'Webhook-URL', lab: 'Laborwerte' };
            return (
              <button key={id} onClick={() => setTab(id)} style={{
                fontSize: 13, padding: '8px 16px', background: 'none', border: 'none',
                cursor: 'pointer', fontFamily: 'inherit',
                color: tab === id ? '#0f6e56' : '#888780',
                borderBottom: `2px solid ${tab === id ? '#1d9e75' : 'transparent'}`,
                marginBottom: -1, transition: 'color 0.15s',
              }}>
                {labels[id]}
              </button>
            );
          })}
        </div>

        {tab === 'upload' && (
          <div>
            <p style={{ fontSize: 13, color: '#55544f', marginBottom: 16 }}>Lade deine Apple Health export.xml oder das ZIP-Archiv hoch.</p>
            <div style={{ border: '1px dashed rgba(0,0,0,0.12)', borderRadius: 16, padding: '48px 32px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.4 }}>↑</div>
              <div style={{ fontSize: 14, color: '#55544f' }}>Datei ablegen oder <span style={{ color: '#0f6e56', cursor: 'pointer' }}>durchsuchen</span></div>
              <div style={{ fontSize: 12, color: '#a3a29c', marginTop: 4 }}>.xml oder .zip · max. 500 MB</div>
            </div>
          </div>
        )}

        {tab === 'webhook' && (
          <div>
            <p style={{ fontSize: 13, color: '#55544f', marginBottom: 16 }}>
              Verwende <strong>Health Auto Export</strong> auf iOS und konfiguriere diese URL als Push-Ziel.
            </p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <code style={{ flex: 1, padding: '10px 14px', background: 'rgba(0,0,0,0.04)', borderRadius: 12, fontSize: 12, color: '#55544f', wordBreak: 'break-all', border: '1px solid rgba(0,0,0,0.07)' }}>
                {window.location.origin}/api/ingest/webhook/[dein-schlüssel]
              </code>
              <Btn small variant="secondary" onClick={() => navigator.clipboard?.writeText('')}>Kopieren</Btn>
            </div>
          </div>
        )}

        {tab === 'lab' && (
          <div>
            <p style={{ fontSize: 13, color: '#55544f', marginBottom: 20 }}>Laborwerte manuell erfassen. Alle Angaben sind freiwillig.</p>
      <div className="responsive-grid-2">
              {LAB_FIELDS.map((f) => (
                <div key={f.key}>
                  <FieldLabel>{f.label} <span style={{ color: '#a3a29c', fontWeight: 400 }}>({f.unit})</span></FieldLabel>
                  <GlassInput placeholder={f.placeholder} value={labVals[f.key] ?? ''} onChange={(v) => setLabVals((p) => ({ ...p, [f.key]: v }))} />
                </div>
              ))}
              <div>
                <FieldLabel>Messdatum</FieldLabel>
                <GlassInput type="date" value={labDate} onChange={setLabDate} />
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <Btn
                testId="save-lab-values"
                onClick={() => {
                  const values = LAB_FIELDS
                    .filter((f) => labVals[f.key])
                    .map((f) => ({
                      metric: f.key,
                      value: Number(labVals[f.key].replace(',', '.')),
                      unit: f.unit,
                      ...(labDate ? { measuredAt: new Date(labDate).toISOString() } : {}),
                    }))
                    .filter((v) => !isNaN(v.value));
                  if (values.length > 0) labsMut.mutate(values);
                }}
              >
                Laborwerte speichern
              </Btn>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <SectionLabel>Lebensstil & Aktivität</SectionLabel>
        <p style={{ fontSize: 13, color: '#55544f', marginBottom: 20 }}>Alle Angaben sind freiwillig und fließen in deinen Score ein.</p>
        <div className="responsive-grid-2">
          {LIFESTYLE_FIELDS.map((f) => {
            const meta = lifestyleMeta[f.key];
            const lastLabel = meta?.available ? daysAgoLabel(meta.ageDays) : null;
            return (
              <div key={f.key}>
                <FieldLabel>
                  {f.label}
                  {f.tooltip && <InfoTooltip text={f.tooltip} />}
                </FieldLabel>
                {f.kind === 'select' ? (
                  <GlassSelect
                    testId={`lifestyle-${f.key}`}
                    options={SMOKING_OPTIONS}
                    value={lifestyleVals[f.key] ?? String(meta?.value ?? '')}
                    onChange={(v) => setLifestyleVals((p) => ({ ...p, [f.key]: v }))}
                  />
                ) : (
                  <GlassInput
                    testId={`lifestyle-${f.key}`}
                    type="number"
                    placeholder={f.placeholder}
                    value={lifestyleVals[f.key] ?? ''}
                    onChange={(v) => setLifestyleVals((p) => ({ ...p, [f.key]: v }))}
                  />
                )}
                {lastLabel && (
                  <div style={{ fontSize: 11, color: '#a3a29c', marginTop: 6 }}>{lastLabel}</div>
                )}
              </div>
            );
          })}
        </div>
        {lifestyleError && (
          <div style={{ fontSize: 12, color: '#a32d2d', marginTop: 16 }}>{lifestyleError}</div>
        )}
        <div style={{ marginTop: 24 }}>
          <Btn testId="save-lifestyle-values" onClick={submitLifestyle}>Lebensstil speichern</Btn>
        </div>
      </Card>
    </div>
  );
}
