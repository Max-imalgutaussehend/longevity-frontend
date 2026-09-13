import { Link } from 'react-router-dom';
import { Card, PageTitle, Chip } from '../components/ui.js';

export function Component() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 840, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <PageTitle title="Datenschutzerklärung" />
        <div style={{ marginBottom: 40 }}>
          <Chip color="teal">DSGVO-konform</Chip>
        </div>
      </div>

      <Card style={{ display: 'flex', flexDirection: 'column', gap: 24, lineHeight: 1.6 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#22221f', margin: '0 0 8px' }}>
            1. Datenschutz auf einen Blick & Grundsatz
          </h2>
          <p style={{ color: '#55544f', margin: 0 }}>
            Der Schutz deiner persönlichen Gesundheitsdaten hat bei <strong>LONGEVITY</strong> höchste Priorität.
            Wir verarbeiten deine Daten streng nach den Vorgaben der europäischen Datenschutz-Grundverordnung (DSGVO)
            sowie dem Bundesdatenschutzgesetz (BDSG).
          </p>
        </div>

        <div style={{
          background: 'rgba(29,158,117,0.06)',
          border: '1px solid rgba(29,158,117,0.22)',
          borderRadius: 12,
          padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 18 }}>🛡️</span>
            <strong style={{ color: '#0f6e56', fontSize: 14 }}>Kernprinzip: Privacy by Design & Zero Raw-Data Sharing</strong>
          </div>
          <p style={{ fontSize: 13, color: '#55544f', margin: 0, lineHeight: 1.5 }}>
            Deine detaillierten Vitaldaten (Schritte, Puls, Schlafdauer, Blutwerte) verbleiben ausschließlich in deinem
            persönlichen Konto. Bei einer Weitergabe an Partner, Arbeitgeber oder Versicherungen werden <strong>niemals Rohdaten</strong>
            übertragen, sondern ausschließlich ein <strong>kryptografisch signiertes Score-Band</strong> (z. B. „Band 70–79")
            mittels Ed25519-Signatur. Niemand erfährt deine konkreten Messwerte.
          </p>
        </div>

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#22221f', margin: '0 0 6px' }}>
            2. Verantwortliche Stelle
          </h3>
          <p style={{ color: '#55544f', fontSize: 13, margin: 0 }}>
            LONGEVITY Projektteam<br />
            Duale Hochschule Baden-Württemberg (DHBW)<br />
            E-Mail: <a href="mailto:datenschutz@longevity.app" style={{ color: '#0f6e56', textDecoration: 'none' }}>datenschutz@longevity.app</a>
          </p>
        </div>

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#22221f', margin: '0 0 6px' }}>
            3. Verarbeitung von Gesundheitsdaten (Art. 9 DSGVO)
          </h3>
          <p style={{ color: '#55544f', fontSize: 13, margin: '0 0 10px' }}>
            Gesundheitsdaten stellen nach Art. 9 Abs. 1 DSGVO eine besondere Kategorie personenbezogener Daten dar.
            Die Verarbeitung dieser Daten erfolgt <strong>ausschließlich auf Grundlage deiner ausdrücklichen Einwilligung
            gemäß Art. 9 Abs. 2 lit. a DSGVO</strong>.
          </p>
          <ul style={{ color: '#55544f', fontSize: 13, margin: 0, paddingLeft: 20 }}>
            <li><strong>Quellen:</strong> Google Health / Health Connect, Apple Health, Laborberichte oder freiwillige Fragebögen.</li>
            <li><strong>Zweck:</strong> Statistische Berechnung deines Vitalitäts-Scores und Vitalitätsalters sowie Ableitung von Hebeln zur Lebensstil-Optimierung.</li>
            <li><strong>Widerruf:</strong> Du kannst deine Einwilligung für jede Datenquelle jederzeit mit Wirkung für die Zukunft in den Einstellungen („Datenquelle trennen") widerrufen. Bereits verarbeitete Daten dieser Quelle werden dabei auf Wunsch gelöscht.</li>
          </ul>
        </div>

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#22221f', margin: '0 0 6px' }}>
            4. Speicherung, Sicherheit und Serverstandort
          </h3>
          <p style={{ color: '#55544f', fontSize: 13, margin: '0 0 8px' }}>
            Alle Datenbanken und Anwendungsserver werden <strong>ausschließlich in gesicherten Rechenzentren innerhalb der Europäischen Union (EU)</strong> betrieben.
          </p>
          <ul style={{ color: '#55544f', fontSize: 13, margin: 0, paddingLeft: 20 }}>
            <li><strong>Passwörter:</strong> Werden mit dem modernen, speicherharten <strong>Argon2id</strong>-Verfahren gehasht und niemals im Klartext gespeichert.</li>
            <li><strong>Cookies:</strong> Wir verwenden ausschließlich technisch notwendige Session-Cookies mit den Flags <code>HttpOnly</code>, <code>SameSite=Lax</code> und <code>Secure</code>. Wir setzen <strong>keine Werbe- oder Tracking-Cookies</strong> (wie Google Analytics) ein.</li>
            <li><strong>Log-Redaction:</strong> Sensible Gesundheitswerte und Passwörter werden in den Anwendungsprotokollen automatisch geschwärzt (Redaction).</li>
          </ul>
        </div>

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#22221f', margin: '0 0 6px' }}>
            5. Deine Rechte als betroffene Person
          </h3>
          <p style={{ color: '#55544f', fontSize: 13, margin: '0 0 10px' }}>
            Als Nutzer hast du nach der DSGVO umfassende Rechte gegenüber dem Verantwortlichen:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 8, padding: 12 }}>
              <strong style={{ fontSize: 13, color: '#22221f' }}>Auskunft & Datenportabilität</strong>
              <p style={{ fontSize: 12, color: '#55544f', margin: '4px 0 0' }}>
                (Art. 15 & 20 DSGVO) Du kannst jederzeit all deine gespeicherten Messwerte mit 1 Klick als JSON exportieren.
              </p>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 8, padding: 12 }}>
              <strong style={{ fontSize: 13, color: '#22221f' }}>Recht auf Löschung</strong>
              <p style={{ fontSize: 12, color: '#55544f', margin: '4px 0 0' }}>
                (Art. 17 DSGVO) Du kannst dein Konto vollständig und unwiderruflich löschen. Alle Datensätze werden restlos entfernt.
              </p>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 8, padding: 12 }}>
              <strong style={{ fontSize: 13, color: '#22221f' }}>Berichtigung</strong>
              <p style={{ fontSize: 12, color: '#55544f', margin: '4px 0 0' }}>
                (Art. 16 DSGVO) Unrichtige Profildaten (z. B. Geburtsdatum) können jederzeit korrigiert werden.
              </p>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 8, padding: 12 }}>
              <strong style={{ fontSize: 13, color: '#22221f' }}>Widerruf & Beschwerde</strong>
              <p style={{ fontSize: 12, color: '#55544f', margin: '4px 0 0' }}>
                (Art. 7 Abs. 3 & Art. 77 DSGVO) Einwilligungen können widerrufen werden; Beschwerderecht bei einer Aufsichtsbehörde.
              </p>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link to="/dashboard" style={{ color: '#0f6e56', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
            ← Zurück zum Dashboard
          </Link>
          <span style={{ color: '#a3a29c' }}>·</span>
          <Link to="/impressum" style={{ color: '#0f6e56', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
            Zum Impressum →
          </Link>
        </div>
      </Card>
    </div>
  );
}
