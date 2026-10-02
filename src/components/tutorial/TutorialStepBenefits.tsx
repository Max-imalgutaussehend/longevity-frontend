import { Sparkles, Watch, Dices, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { Btn, Chip } from '../ui.js';
import { APP_ROUTES } from '../../lib/routes.js';

interface TutorialStepBenefitsProps {
  mockSuccess: boolean;
  isPending: boolean;
  onTriggerMock: () => void;
  onNavigate: (route: string) => void;
  dontShowAgain: boolean;
  onToggleDontShowAgain: (value: boolean) => void;
}

export function TutorialStepBenefits({
  mockSuccess,
  isPending,
  onTriggerMock,
  onNavigate,
  dontShowAgain,
  onToggleDontShowAgain,
}: TutorialStepBenefitsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ textAlign: 'center' }}>
        <Chip color="green">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            Schritt 5 von 5 · Einführung abgeschlossen <Sparkles size={12} />
          </span>
        </Chip>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: '#22221f', margin: '10px 0 4px', letterSpacing: '-0.02em' }}>
          Nahtloser Übergang zum Onboarding
        </h2>
        <p style={{ fontSize: 13, color: '#55544f', maxWidth: 540, margin: '0 auto', lineHeight: 1.5 }}>
          Du hast die Grundlagen kennengelernt! Wähle jetzt deinen ersten Schritt, um dein Cockpit mit echten Vitalitätsdaten zu beleben:
        </p>
      </div>

      {/* 2 Primary Action Cards for Onboarding */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Card 1: Connect Tracker */}
        <div
          style={{
            padding: 16,
            borderRadius: 16,
            border: '1.5px solid rgba(29,158,117,0.3)',
            background: 'rgba(255,255,255,0.9)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 12,
            boxShadow: '0 4px 16px -4px rgba(15,110,86,0.08)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(29,158,117,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f6e56' }}>
                <Watch size={18} />
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#0f6e56', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Empfohlen</span>
                <strong style={{ fontSize: 13, color: '#22221f', display: 'block' }}>1. Tracker verbinden</strong>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#55544f', margin: 0, lineHeight: 1.45 }}>
              Apple Health, Google Health / Fit, Garmin oder Oura verbinden für kontinuierliches Tracking.
            </p>
          </div>
          <Btn
            small
            full
            onClick={() => onNavigate(APP_ROUTES.app.daten())}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            Tracker verbinden <ArrowRight size={13} />
          </Btn>
        </div>

        {/* Card 2: 90 Days Mock Data */}
        <div
          style={{
            padding: 16,
            borderRadius: 16,
            border: mockSuccess ? '1.5px solid rgba(29,158,117,0.4)' : '1px solid rgba(0,0,0,0.08)',
            background: mockSuccess ? 'rgba(29,158,117,0.06)' : 'rgba(255,255,255,0.9)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 12,
            boxShadow: '0 4px 16px -4px rgba(0,0,0,0.04)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                <Dices size={18} />
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#888780', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sofort testen</span>
                <strong style={{ fontSize: 13, color: '#22221f', display: 'block' }}>2. 90 Tage Beispieldaten</strong>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#55544f', margin: 0, lineHeight: 1.45 }}>
              {mockSuccess ? (
                <span style={{ color: '#0f6e56', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={15} /> Beispieldaten erfolgreich generiert! Dein Dashboard ist jetzt befüllt.
                </span>
              ) : (
                'Erkunde das Cockpit sofort mit realistischen Schritten, Schlaf- und Ruhepulskurven.'
              )}
            </p>
          </div>
          {mockSuccess ? (
            <Btn
              small
              full
              variant="secondary"
              onClick={() => onNavigate(APP_ROUTES.app.dashboard())}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              Dashboard öffnen <ArrowRight size={13} />
            </Btn>
          ) : (
            <Btn
              small
              full
              variant="secondary"
              onClick={onTriggerMock}
              disabled={isPending}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              {isPending ? (
                'Wird geladen...'
              ) : (
                <>
                  <Zap size={13} /> Testdaten laden
                </>
              )}
            </Btn>
          )}
        </div>
      </div>

      {/* Quick links to cockpit features */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, fontSize: 12, color: '#55544f' }}>
        <span>Oder direkt zu:</span>
        <button
          type="button"
          onClick={() => onNavigate(APP_ROUTES.app.dashboard())}
          style={{ background: 'none', border: 'none', color: '#0f6e56', fontWeight: 500, cursor: 'pointer', padding: 0, fontSize: 12 }}
        >
          Dashboard
        </button>
        <span>·</span>
        <button
          type="button"
          onClick={() => onNavigate(APP_ROUTES.app.hebel())}
          style={{ background: 'none', border: 'none', color: '#0f6e56', fontWeight: 500, cursor: 'pointer', padding: 0, fontSize: 12 }}
        >
          Hebel-Simulator
        </button>
        <span>·</span>
        <button
          type="button"
          onClick={() => onNavigate(APP_ROUTES.app.freigabe())}
          style={{ background: 'none', border: 'none', color: '#0f6e56', fontWeight: 500, cursor: 'pointer', padding: 0, fontSize: 12 }}
        >
          Freigaben
        </button>
      </div>

      {/* Dont show again checkbox */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 }}>
        <input
          type="checkbox"
          id="dontShowAgain"
          checked={dontShowAgain}
          onChange={(e) => onToggleDontShowAgain(e.target.checked)}
          style={{ accentColor: '#0f6e56', cursor: 'pointer' }}
        />
        <label htmlFor="dontShowAgain" style={{ fontSize: 12, color: '#55544f', cursor: 'pointer' }}>
          Dieses Tutorial beim Start nicht mehr automatisch anzeigen (jederzeit im Profil und Onboarding abrufbar)
        </label>
      </div>
    </div>
  );
}
