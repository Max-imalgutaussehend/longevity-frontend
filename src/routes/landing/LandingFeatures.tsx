import { Card } from '../../components/ui.js';

export function LandingFeatures() {
  return (
    <section id="funktionen" style={{ marginBottom: 110, scrollMarginTop: 110 }}>
      <div style={{ textAlign: 'center', marginBottom: 50 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: '#0f6e56', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Wie LONGEVITY funktioniert
        </span>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 500, color: '#22221f', margin: '8px 0 12px' }}>
          Vom Datenchaos zu messbaren Lebensjahren
        </h2>
        <p style={{ fontSize: 15, color: '#55544f', maxWidth: 640, margin: '0 auto' }}>
          Fitness-Apps werfen Millionen Datenpunkte auf dich. LONGEVITY bringt Ordnung, Sinn und konkrete Hebel hinein.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
        }}
      >
        {/* Säule 1 */}
        <Card className="card-interactive" style={{ padding: '36px 32px' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(29, 158, 117, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: '#0f6e56',
              marginBottom: 20,
            }}
          >
            1
          </div>
          <h3 style={{ fontSize: 19, fontWeight: 500, color: '#22221f', margin: '0 0 10px' }}>
            Messen (Aggregate)
          </h3>
          <p style={{ fontSize: 14, color: '#55544f', lineHeight: 1.6, margin: 0 }}>
            Verbinde Apple Health, Google Fit oder Wearables. LONGEVITY aggregiert 16 evidenzbasierte Biomarker
            über 90 Tage – von Ruhepuls und HRV über Tiefschlaf bis zu Laborwerten.
          </p>
        </Card>

        {/* Säule 2 */}
        <Card className="card-interactive" style={{ padding: '36px 32px' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(29, 158, 117, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: '#0f6e56',
              marginBottom: 20,
            }}
          >
            2
          </div>
          <h3 style={{ fontSize: 19, fontWeight: 500, color: '#22221f', margin: '0 0 10px' }}>
            Verstehen (Score 0–100)
          </h3>
          <p style={{ fontSize: 14, color: '#55544f', lineHeight: 1.6, margin: 0 }}>
            Vier transparente Domänen: Herzgesundheit, Regeneration, Aktivität und Risiko-Faktoren.
            Sie fließen in deinen Vitalitätsscore und dein biologisches Alter ein.
          </p>
        </Card>

        {/* Säule 3 */}
        <Card className="card-interactive" style={{ padding: '36px 32px' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(29, 158, 117, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: '#0f6e56',
              marginBottom: 20,
            }}
          >
            3
          </div>
          <h3 style={{ fontSize: 19, fontWeight: 500, color: '#22221f', margin: '0 0 10px' }}>
            Steuern (Hebel)
          </h3>
          <p style={{ fontSize: 14, color: '#55544f', lineHeight: 1.6, margin: 0 }}>
            Welche Veränderung bringt dir den größten biologischen Gewinn? Unser Hebel-Simulator
            zeigt dir sofort, ob 30 Minuten mehr Schlaf oder 4 Schläge weniger Ruhepuls deinen Score weiter nach oben bringen.
          </p>
        </Card>
      </div>
    </section>
  );
}
