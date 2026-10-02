import { Check, X } from 'lucide-react';
import { Card } from '../../components/ui.js';

export function LandingDataPrivacy() {
  return (
    <section id="datenschutz" className="scroll-reveal" style={{ marginBottom: 110, scrollMarginTop: 110 }}>
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: '#0f6e56', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Privatsphäre by Design
        </span>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 500, color: '#22221f', margin: '8px 0 12px' }}>
          Deine Rohdaten gehören dir. Punkt.
        </h2>
        <p style={{ fontSize: 15, color: '#55544f', maxWidth: 650, margin: '0 auto' }}>
          Warum solltest du für Vergünstigungen bei deiner Krankenkasse deine intimsten biometrischen Messwerte preisgeben?
          LONGEVITY trennt Nachweis von Rohdaten.
        </p>
      </div>

      {/* Side-by-side comparison */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 20,
        }}
      >
        {/* Left: What traditional apps do */}
        <Card
          className="card-interactive"
          style={{
            padding: 'clamp(24px, 3.5vw, 36px) clamp(16px, 3.5vw, 32px)',
            background: 'rgba(255, 240, 240, 0.45)',
            border: '1px solid rgba(163, 45, 45, 0.2)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#a32d2d', textTransform: 'uppercase', marginBottom: 12 }}>
            Herkömmliche Gesundheits-Apps
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 500, color: '#22221f', margin: '0 0 14px' }}>
            Volle Rohdatenübertragung
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#55544f' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <X size={16} color="#a32d2d" style={{ flexShrink: 0 }} />
              <span>Partner und Werbenetzwerke erhalten jede Herzfrequenz & Schlafminute</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <X size={16} color="#a32d2d" style={{ flexShrink: 0 }} />
              <span>Hohes Missbrauchs- und Datenleck-Risiko</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <X size={16} color="#a32d2d" style={{ flexShrink: 0 }} />
              <span>Keine Kontrolle über spätere Profilbildung</span>
            </li>
          </ul>
        </Card>

        {/* Right: What LONGEVITY does */}
        <Card
          className="card-interactive"
          style={{
            padding: 'clamp(24px, 3.5vw, 36px) clamp(16px, 3.5vw, 32px)',
            background: 'rgba(225, 245, 238, 0.55)',
            border: '1px solid rgba(29, 158, 117, 0.35)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0f6e56', textTransform: 'uppercase', marginBottom: 12 }}>
            Der LONGEVITY-Ansatz
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 500, color: '#22221f', margin: '0 0 14px' }}>
            Kryptographische Zero-Knowledge-Bänder
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#55544f' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Check size={16} color="#0f6e56" style={{ flexShrink: 0 }} />
              <span>Deine Rohdaten bleiben verschlüsselt in deiner Hand</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Check size={16} color="#0f6e56" style={{ flexShrink: 0 }} />
              <span>Partner verifizieren ausschließlich das erreichte Band (z.B. Band 80)</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Check size={16} color="#0f6e56" style={{ flexShrink: 0 }} />
              <span>Jederzeit per Mausklick widerrufbar via Ed25519-Signatur</span>
            </li>
          </ul>
        </Card>
      </div>
    </section>
  );
}
