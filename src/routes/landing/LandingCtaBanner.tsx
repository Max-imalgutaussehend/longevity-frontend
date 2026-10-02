import { Link } from 'react-router-dom';
import { Btn } from '../../components/ui.js';
import { APP_ROUTES } from '../../lib/routes.js';

export function LandingCtaBanner() {
  return (
    <section className="scroll-reveal" style={{ marginBottom: 40 }}>
      <div
        className="glass-deep"
        style={{
          borderRadius: 24,
          padding: '60px 32px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(225, 245, 238, 0.7) 0%, rgba(255, 255, 255, 0.85) 100%)',
          border: '1px solid rgba(29, 158, 117, 0.3)',
          boxShadow: '0 20px 60px rgba(20, 50, 35, 0.08)',
        }}
      >
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 500, color: '#22221f', margin: '0 0 14px' }}>
          Bereit für messbare Vitalität?
        </h2>
        <p style={{ fontSize: 16, color: '#55544f', maxWidth: 560, margin: '0 auto 32px' }}>
          Erfahre heute dein Vitalitätsalter und entdecke deine wirksamsten Langlebigkeits-Hebel.
        </p>
        <Link to={APP_ROUTES.register} style={{ textDecoration: 'none' }}>
          <Btn style={{ padding: '15px 38px', fontSize: 16 }}>
            Kostenloses Profil erstellen →
          </Btn>
        </Link>
      </div>
    </section>
  );
}
