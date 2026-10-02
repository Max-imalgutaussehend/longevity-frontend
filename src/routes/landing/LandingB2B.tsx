import { Award, Lock, ShieldCheck, Handshake } from 'lucide-react';
import { Card, Btn } from '../../components/ui.js';

interface LandingB2BProps {
  onSelectTopicAndScroll: (reasonId: string) => void;
}

export function LandingB2B({ onSelectTopicAndScroll }: LandingB2BProps) {
  return (
    <section id="kassen" className="scroll-reveal" style={{ marginBottom: 110, scrollMarginTop: 110 }}>
      <div
        className="glass-deep"
        style={{
          borderRadius: 24,
          padding: 'clamp(28px, 4.5vw, 52px) clamp(20px, 4.5vw, 44px)',
          boxShadow: '0 16px 50px rgba(15, 40, 28, 0.08)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 40px' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#0f6e56', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            B2B & Kostenträger
          </span>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 500, color: '#22221f', margin: '10px 0 14px' }}>
            Prävention, die motiviert. Ohne Datenschutz-Risiko.
          </h2>
          <p style={{ fontSize: 15, color: '#55544f', lineHeight: 1.6, margin: 0 }}>
            Krankenkassen, betriebliche Gesundheitsmanagements (BGM) und Arbeitgeber stehen vor der Herausforderung,
            evidenzbasierte Präventionsboni anzubieten, ohne sensible Versichertendaten anfassen, zentral speichern
            oder dafür haften zu müssen.
          </p>
        </div>

        {/* 4 B2B Pillars Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 36,
          }}
        >
          {/* Card 1: § 65a SGB V */}
          <Card className="card-interactive" style={{ padding: '24px 22px', background: 'rgba(255, 255, 255, 0.85)' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: '#e1f5ee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
                color: '#0f6e56',
              }}
            >
              <Award size={20} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#22221f', marginBottom: 6 }}>
              Bonus nach § 65a SGB V
            </div>
            <p style={{ fontSize: 13, color: '#55544f', margin: 0, lineHeight: 1.55 }}>
              Versicherte erreichen messbare Vitalitätsgewinne durch nachgewiesene Aktivität, Schlafqualität und Biomarker.
              Kassen belohnen echte Adhärenz digital und rechtssicher.
            </p>
          </Card>

          {/* Card 2: Zero-Knowledge */}
          <Card className="card-interactive" style={{ padding: '24px 22px', background: 'rgba(255, 255, 255, 0.85)' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: '#e1f5ee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
                color: '#0f6e56',
              }}
            >
              <Lock size={20} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#22221f', marginBottom: 6 }}>
              Zero-Knowledge-Nachweise
            </div>
            <p style={{ fontSize: 13, color: '#55544f', margin: 0, lineHeight: 1.55 }}>
              Kein Rohdatenzugriff. Kassen und Arbeitgeber erhalten keine sensiblen Gesundheitsakten.
              Verifiziert wird ausschließlich die Bonuserfüllung über kryptografische Signaturen via <code>/verify/:id</code>.
            </p>
          </Card>

          {/* Card 3: Interoperabilität & Standards */}
          <Card className="card-interactive" style={{ padding: '24px 22px', background: 'rgba(255, 255, 255, 0.85)' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: '#e1f5ee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
                color: '#0f6e56',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#22221f', marginBottom: 6 }}>
              FHIR & DSGVO Art. 9
            </div>
            <p style={{ fontSize: 13, color: '#55544f', margin: 0, lineHeight: 1.55 }}>
              Entwickelt nach europäischen Datenschutzstandards und BSI-Leitlinien.
              Vorbereitet für offene Standards (HL7 FHIR) und nahtlose Einbindung in bestehende Versicherten-Apps.
            </p>
          </Card>

          {/* Card 4: Kooperation & Anbindung */}
          <Card className="card-interactive" style={{ padding: '24px 22px', background: 'rgba(255, 255, 255, 0.85)' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: '#e1f5ee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
                color: '#0f6e56',
              }}
            >
              <Handshake size={20} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#22221f', marginBottom: 6 }}>
              Kooperation & Anbindung
            </div>
            <p style={{ fontSize: 13, color: '#55544f', margin: 0, lineHeight: 1.55 }}>
              LONGEVITY wird vollständig von uns bereitgestellt und betrieben – ohne IT-Aufwand für Sie.
              Bei Kooperationen und der technischen Anbindung an Ihre Bonusprogramme oder Versicherten-Apps
              unterstützen wir Sie direkt.
            </p>
          </Card>
        </div>

        {/* CTA Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(225, 245, 238, 0.75) 0%, rgba(240, 244, 241, 0.85) 100%)',
            border: '1px solid rgba(29, 158, 117, 0.3)',
            borderRadius: 16,
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#22221f', marginBottom: 4 }}>
              Interesse an einer Kooperation oder Schnittstellen-Anbindung?
            </div>
            <div style={{ fontSize: 13, color: '#55544f' }}>
              Wir besprechen gerne gemeinsame Kooperationsmodelle und unterstützen Sie direkt bei der technischen Anbindung.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <Btn
              variant="primary"
              onClick={() => onSelectTopicAndScroll('insurer')}
              style={{ padding: '11px 22px', fontSize: 13 }}
            >
              Kooperationsanfrage stellen ↓
            </Btn>
          </div>
        </div>
      </div>
    </section>
  );
}
