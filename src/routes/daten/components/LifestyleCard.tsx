import {
  Card,
  Btn,
  GlassInput,
  GlassSelect,
  FieldLabel,
  InfoTooltip,
  SectionLabel,
} from '../../../components/ui.js';
import type { MetricResult } from '../../../api/types.js';
import { LIFESTYLE_FIELDS, SMOKING_OPTIONS } from '../datenTypes.js';
import { daysAgoLabel } from '../datenUtils.js';

interface LifestyleCardProps {
  lifestyleMeta: Record<string, MetricResult | undefined>;
  lifestyleVals: Record<string, string>;
  lifestyleError: string | null;
  isSaving: boolean;
  onValueChange: (key: string, value: string) => void;
  onSave: () => void;
}

export function LifestyleCard({
  lifestyleMeta,
  lifestyleVals,
  lifestyleError,
  isSaving,
  onValueChange,
  onSave,
}: LifestyleCardProps) {
  return (
    <Card id="lifestyle-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
        <SectionLabel>Lebensstil &amp; Aktivität</SectionLabel>
        <span style={{
          fontSize: 11,
          padding: '2px 8px',
          borderRadius: 999,
          background: 'rgba(0,0,0,0.05)',
          color: '#55544f',
          border: '1px solid rgba(0,0,0,0.1)',
          fontWeight: 500,
        }}>
          Selbstauskunft · Nicht kassenfähig
        </span>
      </div>
      <p style={{ fontSize: 13, color: '#22221f', marginBottom: 20 }}>
        Alle Angaben sind freiwillig und fließen in deinen Standard-Score ein (für Kassenrabatte ausgeschlossen).
      </p>
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
                  onChange={(v) => onValueChange(f.key, v)}
                />
              ) : (
                <GlassInput
                  testId={`lifestyle-${f.key}`}
                  type="number"
                  placeholder={f.placeholder}
                  value={lifestyleVals[f.key] ?? ''}
                  onChange={(v) => onValueChange(f.key, v)}
                />
              )}
              {lastLabel && (
                <div style={{ fontSize: 11, color: '#55544f', marginTop: 6 }}>{lastLabel}</div>
              )}
            </div>
          );
        })}
      </div>
      {lifestyleError && (
        <div style={{ fontSize: 12, color: '#a32d2d', marginTop: 16 }}>{lifestyleError}</div>
      )}
      <div style={{ marginTop: 24 }}>
        <Btn testId="save-lifestyle-values" onClick={onSave} disabled={isSaving}>
          {isSaving ? 'Wird gespeichert...' : 'Lebensstil speichern'}
        </Btn>
      </div>
    </Card>
  );
}
