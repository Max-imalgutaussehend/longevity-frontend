import { Link } from 'react-router-dom';
import { Card, PageTitle, Chip } from '../components/ui.js';

export function Component() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 840, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <PageTitle title="Impressum" />
        <div style={{ marginBottom: 40 }}>
          <Chip color="teal">Rechtliche Hinweise</Chip>
        </div>
      </div>

      <Card style={{ display: 'flex', flexDirection: 'column', gap: 24, lineHeight: 1.6 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#22221f', margin: '0 0 8px' }}>
            Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)
          </h2>
          <p style={{ color: '#55544f', margin: 0 }}>
            LONGEVITY — Wissenschaftlich fundiertes Vitalitäts-Tracking & Langlebigkeits-Plattform<br />
            Ein studentisches Lehr- und Forschungsprojekt im Rahmen des Studiums an der<br />
            <strong>Duale Hochschule Baden-Württemberg (DHBW)</strong>.
          </p>
        </div>

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#22221f', margin: '0 0 6px' }}>
            Projektverantwortliche & Kontakt
          </h3>
          <p style={{ color: '#55544f', margin: 0 }}>
            LONGEVITY Projektteam<br />
            DHBW Baden-Württemberg<br />
            E-Mail: <a href="mailto:kontakt@longevity.app" style={{ color: '#0f6e56', textDecoration: 'none' }}>kontakt@longevity.app</a><br />
            Web: <a href="https://github.com/Max-imalgutaussehend/LONGEVITY" target="_blank" rel="noreferrer" style={{ color: '#0f6e56', textDecoration: 'none' }}>github.com/Max-imalgutaussehend/LONGEVITY</a>
          </p>
        </div>

        <div style={{
          background: 'rgba(133,79,11,0.06)',
          border: '1px solid rgba(133,79,11,0.20)',
          borderRadius: 12,
          padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 18 }}>⚕️</span>
            <strong style={{ color: '#854f0b', fontSize: 14 }}>Wichtiger Hinweis: Kein Medizinprodukt!</strong>
          </div>
          <p style={{ fontSize: 13, color: '#55544f', margin: 0, lineHeight: 1.5 }}>
            LONGEVITY ist <strong>kein Medizinprodukt</strong> im Sinne der Verordnung (EU) 2017/745 (MDR) oder des Medizinproduktegesetzes.
            Die berechneten Scores (0–100), Vitalitätsalter und simulierten Hebel basieren auf statistisch-mathematischen
            Referenzkurven aus epidemiologischen Veröffentlichungen und dienen ausschließlich der <strong>persönlichen Prävention,
            dem Lebensstil-Tracking und der Information</strong>.
            <br /><br />
            Sie ersetzen in keinem Fall eine ärztliche Diagnose, Beratung, Früherkennung oder Behandlung von Erkrankungen.
            Wende dich bei gesundheitlichen Fragen, Beschwerden oder vor gravierenden Umstellungen deiner körperlichen Aktivität
            stets an qualifiziertes medizinisches Fachpersonal.
          </p>
        </div>

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#22221f', margin: '0 0 6px' }}>
            Haftung für Inhalte und Links
          </h3>
          <p style={{ color: '#55544f', fontSize: 13, margin: '0 0 12px' }}>
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
            verantwortlich. Nach §§ 8 bis 10 DDG sind wir jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
            Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          </p>
          <p style={{ color: '#55544f', fontSize: 13, margin: 0 }}>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
            Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten
            ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
          </p>
        </div>

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#22221f', margin: '0 0 6px' }}>
            Urheberrecht & Open Source
          </h3>
          <p style={{ color: '#55544f', fontSize: 13, margin: 0 }}>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.
            Die Plattform nutzt Open-Source-Komponenten (unter anderem Node.js, Fastify, React, Drizzle ORM, Recharts).
            Die Quelltexte des Projekts stehen für akademische und Demonstrationszwecke im Rahmen des DHBW-Studiums zur Verfügung.
          </p>
        </div>

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link to="/dashboard" style={{ color: '#0f6e56', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
            ← Zurück zum Dashboard
          </Link>
          <span style={{ color: '#a3a29c' }}>·</span>
          <Link to="/datenschutz" style={{ color: '#0f6e56', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
            Zur Datenschutzerklärung →
          </Link>
        </div>
      </Card>
    </div>
  );
}
