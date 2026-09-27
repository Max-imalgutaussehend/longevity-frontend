import { FlaskConical, PauseCircle } from 'lucide-react';
import { Card, Btn, Chip, Toggle } from '../../../components/ui.js';
import type { Source } from '../../../api/types.js';

interface FhirCardProps {
  src?: Source;
  isUploading: boolean;
  isDeletingSamples: boolean;
  isTogglePending: boolean;
  onUploadClick: () => void;
  onNavigateDashboard: () => void;
  onToggle: (enabled: boolean) => void;
  onDeleteSamples: () => void;
}

export function FhirCard({
  src,
  isUploading,
  isDeletingSamples,
  isTogglePending,
  onUploadClick,
  onNavigateDashboard,
  onToggle,
  onDeleteSamples,
}: FhirCardProps) {
  const sampleCount = src?.sampleCount ?? 0;
  const hasSource = !!src && (src.enabled || sampleCount > 0);
  const isEnabled = !src || src.enabled;

  return (
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 24,
        borderTop: `3px solid ${isEnabled ? '#1d9e75' : '#a8a89c'}`,
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', color: '#0f6e56' }}>
            <FlaskConical size={26} />
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {hasSource && src?.id && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: isEnabled ? '#0f6e56' : '#888780' }}>
                  {isEnabled ? 'Aktiv' : 'Pausiert'}
                </span>
                <Toggle
                  on={isEnabled}
                  onChange={() => onToggle(!isEnabled)}
                />
              </div>
            )}
            <Chip color={isEnabled ? 'teal' : 'neutral'}>
              {isEnabled
                ? sampleCount > 0
                  ? `Aktiv (${sampleCount})`
                  : 'Aktiv'
                : `Deaktiviert (${sampleCount} pausiert)`}
            </Chip>
          </div>
        </div>

        <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Manuell & Labor</div>
        <div style={{ fontSize: 13, color: '#22221f', lineHeight: 1.5, marginBottom: 16 }}>
          Laborwerte wie ApoB, HbA1c oder manuelle Blutdruckerfassungen.
        </div>

        {hasSource && !isEnabled && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(168,168,156,0.12)',
              border: '1px solid rgba(168,168,156,0.25)',
              fontSize: 12,
              color: '#55544f',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <PauseCircle size={14} /> Laborwerte sind deaktiviert und fließen aktuell nicht in deinen Score ein.
          </div>
        )}

        <div style={{ fontSize: 12, color: '#55544f' }}>
          Status:{' '}
          <strong style={{ color: isEnabled ? '#0f6e56' : '#22221f', fontWeight: 500 }}>
            {isEnabled ? 'Aktiv für individuelle Ergänzungen' : 'Pausiert'}
          </strong>
        </div>
      </div>

      <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {hasSource && src?.id && (
          <Btn
            full
            variant={isEnabled ? 'secondary' : 'primary'}
            onClick={() => onToggle(!isEnabled)}
            disabled={isTogglePending}
          >
            {isEnabled ? 'Laborwerte deaktivieren (pausieren)' : 'Laborwerte aktivieren'}
          </Btn>
        )}
        <Btn full variant="secondary" onClick={onUploadClick} disabled={isUploading}>
          {isUploading ? 'Wird verarbeitet...' : 'FHIR-Laborbefund (.json) importieren'}
        </Btn>
        <Btn full variant="secondary" onClick={onNavigateDashboard}>
          Verwaltung im Dashboard
        </Btn>
        {hasSource && src?.id && sampleCount > 0 && (
          <Btn
            full
            variant="danger"
            onClick={() => {
              if (window.confirm(`Möchtest du wirklich alle ${sampleCount} gespeicherten Laborwerte löschen?`)) {
                onDeleteSamples();
              }
            }}
            disabled={isDeletingSamples}
          >
            Laborwerte löschen ({sampleCount} Werte)
          </Btn>
        )}
      </div>
    </Card>
  );
}
