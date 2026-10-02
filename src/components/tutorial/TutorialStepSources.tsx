import { useState } from 'react';
import { Bot, FlaskConical, Dices, Zap, Check } from 'lucide-react';
import { AppleLogo } from '../BrandLogos.js';
import { Btn, Chip } from '../ui.js';

interface TutorialStepSourcesProps {
  mockSuccess: boolean;
  isPending: boolean;
  onTriggerMock: () => void;
}

export function TutorialStepSources({
  mockSuccess,
  isPending,
  onTriggerMock,
}: TutorialStepSourcesProps) {
  const [activeSourceHighlight, setActiveSourceHighlight] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ textAlign: 'center' }}>
        <Chip color="teal">Schritt 2 von 5 · Datenquellen verbinden</Chip>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: '#22221f', margin: '10px 0 4px', letterSpacing: '-0.02em' }}>
          So kommen deine Daten in das System
        </h2>
        <p style={{ fontSize: 13, color: '#55544f', maxWidth: 520, margin: '0 auto', lineHeight: 1.45 }}>
          Klicke auf eine Datenquelle, um Details zu sehen. Du kannst auch direkt hier mit
          einem Klick <strong>90 Tage synthetische Testdaten</strong> laden.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Google Health Tile */}
        <div
          className="card-interactive"
          onClick={() => setActiveSourceHighlight('google')}
          style={{
            padding: 14,
            borderRadius: 16,
            border: activeSourceHighlight === 'google' ? '2px solid #0f6e56' : '1px solid rgba(0,0,0,0.08)',
            background: 'rgba(255,255,255,0.75)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', color: '#0f6e56' }}><Bot size={22} /></span>
            <strong style={{ fontSize: 13, color: '#22221f' }}>Google Health & Fit</strong>
          </div>
          <p style={{ fontSize: 11, color: '#55544f', margin: 0, lineHeight: 1.4 }}>
            Health Connect Cloud: Synchronisiert bis zu 365 Tage Historie (Schritte, Ruhepuls, Schlaf & Zone 2).
          </p>
        </div>

        {/* Apple Health Tile */}
        <div
          className="card-interactive"
          onClick={() => setActiveSourceHighlight('apple')}
          style={{
            padding: 14,
            borderRadius: 16,
            border: activeSourceHighlight === 'apple' ? '2px solid #0f6e56' : '1px solid rgba(0,0,0,0.08)',
            background: 'rgba(255,255,255,0.75)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', color: '#0f6e56' }}><AppleLogo size={22} color="#0f6e56" /></span>
            <strong style={{ fontSize: 13, color: '#22221f' }}>Apple Health</strong>
          </div>
          <p style={{ fontSize: 11, color: '#55544f', margin: 0, lineHeight: 1.4 }}>
            Importiere deine <code>export.xml</code>-Datei oder nutze den Health Auto Export Webhook für automatischen Push.
          </p>
        </div>

        {/* Labor & Lifestyle Tile */}
        <div
          className="card-interactive"
          onClick={() => setActiveSourceHighlight('manual')}
          style={{
            padding: 14,
            borderRadius: 16,
            border: activeSourceHighlight === 'manual' ? '2px solid #0f6e56' : '1px solid rgba(0,0,0,0.08)',
            background: 'rgba(255,255,255,0.75)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', color: '#0f6e56' }}><FlaskConical size={22} /></span>
            <strong style={{ fontSize: 13, color: '#22221f' }}>Laborwerte & Lifestyle</strong>
          </div>
          <p style={{ fontSize: 11, color: '#55544f', margin: 0, lineHeight: 1.4 }}>
            Ergänze Cholesterin (LDL/HDL), Blutzucker (HbA1c) und deinen Lifestyle-Fragebogen mit wenigen Klicks.
          </p>
        </div>

        {/* Mock Data Generator with interactive trigger */}
        <div style={{
          padding: 14,
          borderRadius: 16,
          border: '1px solid rgba(29,158,117,0.3)',
          background: 'rgba(29,158,117,0.06)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 8,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', color: '#0f6e56' }}><Dices size={22} /></span>
              <strong style={{ fontSize: 13, color: '#0f6e56' }}>90 Tage Sofort-Testdaten</strong>
            </div>
            <p style={{ fontSize: 11, color: '#55544f', margin: 0, lineHeight: 1.4 }}>
              Ideal zum Testen: Erzeugt sofort realistische Messreihen für deinen Account.
            </p>
          </div>

          <Btn
            small
            variant={mockSuccess ? 'ghost' : 'secondary'}
            disabled={isPending || mockSuccess}
            onClick={onTriggerMock}
            style={{ marginTop: 4 }}
          >
            {isPending ? (
              'Wird generiert...'
            ) : mockSuccess ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Check size={14} /> 90 Tage Daten aktiv!
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Zap size={14} /> Testdaten jetzt laden
              </span>
            )}
          </Btn>
        </div>
      </div>

      <div style={{
        padding: '10px 14px',
        borderRadius: 12,
        background: 'rgba(0,0,0,0.02)',
        fontSize: 12,
        color: '#55544f',
        textAlign: 'center',
      }}>
        Alle Quellen lassen sich jederzeit im Menü unter <strong>Daten</strong> verbinden, synchronisieren oder trennen.
      </div>
    </div>
  );
}
