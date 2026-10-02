import { Check } from 'lucide-react';
import { Card } from '../../components/ui.js';

export function LandingProduct() {
  return (
    <section id="produkt" className="scroll-reveal" style={{ marginBottom: 96, scrollMarginTop: 110 }}>
      <div style={{ textAlign: 'center', maxWidth: 840, margin: '0 auto 56px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: '4px 14px',
              borderRadius: 999,
              background: 'rgba(29, 158, 117, 0.12)',
              color: '#0f6e56',
              border: '1px solid rgba(29, 158, 117, 0.25)',
            }}
          >
            Das Prinzip LONGEVITY
          </span>
        </div>

        <h2
          style={{
            fontSize: 'clamp(32px, 4.5vw, 48px)',
            fontWeight: 500,
            color: '#22221f',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            margin: '0 0 20px',
          }}
        >
          Messbare Vitalität.{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #1d9e75 0%, #0f6e56 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Dein biologisches Alter
          </span>{' '}
          in deiner Hand.
        </h2>

        <p
          style={{
            fontSize: 'clamp(16px, 2vw, 19px)',
            color: '#55544f',
            lineHeight: 1.6,
            margin: '0 auto',
            fontWeight: 400,
          }}
        >
          LONGEVITY aggregiert deine Wearables und Laborwerte zu einem transparenten
          Vitalitäts-Score (0–100). Erkenne deine wirksamsten Hebel für gesunde Lebensjahre –
          mathematisch nachvollziehbar, DSGVO-sicher und ohne Weitergabe deiner Rohdaten.
        </p>
      </div>

      {/* Biometrics Showcase Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 20,
          marginBottom: 56,
        }}
      >
        {/* Card 1: Herz & Erholung */}
        <Card className="card-interactive" style={{ padding: 'clamp(20px, 3vw, 28px) clamp(16px, 3vw, 30px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: '#1d9e75',
                  boxShadow: '0 0 8px rgba(29, 158, 117, 0.6)',
                }}
              />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#0f6e56', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Herz & Erholung
              </span>
            </div>
            <span style={{ fontSize: 12, color: '#888780' }}>Wearable-Synchronisation</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 500, color: '#22221f', marginBottom: 6 }}>
            Ruhepuls: 52 bpm · HRV: 78 ms
          </div>
          <p style={{ fontSize: 13, color: '#55544f', margin: 0, lineHeight: 1.5 }}>
            Automatisch aggregiert aus deinen Ruhedaten. Hohe Herzfrequenzvariabilität (HRV) spiegelt Vitalität und Langlebigkeit wider.
          </p>
        </Card>

        {/* Card 2: Biologisches Vitalitätsalter */}
        <Card className="card-interactive" style={{ padding: 'clamp(20px, 3vw, 28px) clamp(16px, 3vw, 30px)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            Biologisches Alter
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontSize: 32, fontWeight: 500, color: '#22221f', lineHeight: 1 }}>
              26,8 <span style={{ fontSize: 15, color: '#888780', fontWeight: 400 }}>Jahre</span>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '3px 12px',
                borderRadius: 999,
                background: '#e1f5ee',
                color: '#0f6e56',
                border: '1px solid rgba(29, 158, 117, 0.3)',
              }}
            >
              −5,2 Jahre jünger
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#55544f', margin: 0, lineHeight: 1.5 }}>
            Berechnet aus deinen Vitaldaten im Abgleich mit Referenzkohorten.
          </p>
        </Card>

        {/* Card 3: LONGEVITY Score & Band */}
        <Card className="card-interactive" style={{ padding: 'clamp(20px, 3vw, 28px) clamp(16px, 3vw, 30px)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            LONGEVITY Score
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 36, fontWeight: 500, color: '#0f6e56', lineHeight: 1 }}>88</span>
              <span style={{ fontSize: 15, color: '#888780' }}>/ 100</span>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: 999,
                background: '#e1f5ee',
                color: '#0f6e56',
                border: '1px solid rgba(29, 158, 117, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Check size={12} /> Band 80 Verifiziert
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#55544f', margin: 0, lineHeight: 1.5 }}>
            Herzgesundheit: 91 · Regeneration: 92 · Aktivität: 82.
          </p>
        </Card>
      </div>

      {/* 3 Core Trust Badges */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}
      >
        <Card className="card-interactive" style={{ padding: '24px 28px', textAlign: 'left' }}>
          <div style={{ fontSize: 28, fontWeight: 500, color: '#0f6e56', marginBottom: 6 }}>
            0 Rohdaten
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#22221f', marginBottom: 4 }}>
            Vollständige Datensouveränität
          </div>
          <p style={{ fontSize: 13, color: '#55544f', margin: 0, lineHeight: 1.5 }}>
            Kein Datenhandel, kein Tracking. Nur du entscheidest, welches Score-Band du mit
            deiner Krankenkasse oder deinem Arbeitgeber teilst.
          </p>
        </Card>

        <Card className="card-interactive" style={{ padding: '24px 28px', textAlign: 'left' }}>
          <div style={{ fontSize: 28, fontWeight: 500, color: '#0f6e56', marginBottom: 6 }}>
            0 – 100
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#22221f', marginBottom: 4 }}>
            Evidenzbasierter Vitalitäts-Score
          </div>
          <p style={{ fontSize: 13, color: '#55544f', margin: 0, lineHeight: 1.5 }}>
            Keine intransparente Blackbox. Gewichtete mathematische Referenzkurven aus
            großen epidemiologischen Langzeitstudien.
          </p>
        </Card>

        <Card className="card-interactive" style={{ padding: '24px 28px', textAlign: 'left' }}>
          <div style={{ fontSize: 28, fontWeight: 500, color: '#0f6e56', marginBottom: 6 }}>
            100% DSGVO
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#22221f', marginBottom: 4 }}>
            Gehostet in Deutschland
          </div>
          <p style={{ fontSize: 13, color: '#55544f', margin: 0, lineHeight: 1.5 }}>
            Verschlüsselt nach modernsten Sicherheitsstandards mit Ed25519-Signierung
            für verifizierbare Nachweise.
          </p>
        </Card>
      </div>
    </section>
  );
}
