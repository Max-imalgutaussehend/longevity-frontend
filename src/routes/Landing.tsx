import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Check, X, Mail, Copy, Send, MapPin, Users, GraduationCap, Sparkles, ExternalLink, ShieldCheck, Lock, Award, Handshake, Code, Briefcase } from 'lucide-react';
import heroVideo from '../assets/hero-video.mp4';
import teamImage from '../assets/team.png';
import { Card, Btn } from '../components/ui.js';
import { BrandLogosRibbon } from '../components/BrandLogos.js';
import { apiClient } from '../api/client.js';

interface ContactReason {
  id: string;
  label: string;
  shortLabel: string;
  badge: string;
  subject: string;
  companyLabel: string;
  companyPlaceholder: string;
  companyRequired: boolean;
  emailLabel: string;
  messagePlaceholder: string;
  btnText: string;
}

const CONTACT_REASONS: ContactReason[] = [
  {
    id: 'insurer',
    label: '🏥 Krankenkasse / Kooperation',
    shortLabel: 'Krankenkasse',
    badge: 'B2B & Kassen',
    subject: 'Kooperationsanfrage Krankenkasse / Partner',
    companyLabel: 'Krankenkasse / Organisation *',
    companyPlaceholder: 'z.B. Techniker Krankenkasse, Barmer, BKK...',
    companyRequired: true,
    emailLabel: 'Geschäftliche E-Mail-Adresse *',
    messagePlaceholder: 'Beschreiben Sie kurz Ihre Organisation sowie Kooperations- oder Anbindungswünsche...',
    btnText: 'Kooperationsanfrage absenden →',
  },
  {
    id: 'feedback',
    label: '💡 Allgemein & Score-Feedback',
    shortLabel: 'Feedback & Hebel',
    badge: 'Community',
    subject: 'Feedback zu den Score-Hebel-Berechnungen & Biomarkern',
    companyLabel: 'Organisation / Firma (optional)',
    companyPlaceholder: 'Optional: Unternehmen, Hochschule oder privat',
    companyRequired: false,
    emailLabel: 'Deine E-Mail-Adresse *',
    messagePlaceholder: 'Dein Feedback, Anmerkungen zum Algorithmus oder Feature-Ideen...',
    btnText: 'Feedback absenden →',
  },
  {
    id: 'research',
    label: '🎓 DHBW-Forschung & Wissenschaft',
    shortLabel: 'Forschung',
    badge: 'Wissenschaft',
    subject: 'Frage zum DHBW-Forschungsprojekt & wissenschaftlichen Kurven',
    companyLabel: 'Hochschule / Institut (optional)',
    companyPlaceholder: 'z.B. DHBW Mannheim, Universität...',
    companyRequired: false,
    emailLabel: 'Deine E-Mail-Adresse *',
    messagePlaceholder: 'Deine Fragen zur Methodik oder wissenschaftlichen Zusammenarbeit...',
    btnText: 'Forschungsanfrage absenden →',
  },
  {
    id: 'general',
    label: '💬 Sonstiges / Hallo',
    shortLabel: 'Allgemein',
    badge: 'Kennenlernen',
    subject: 'Hallo an das LONGEVITY-Team',
    companyLabel: 'Organisation (optional)',
    companyPlaceholder: 'Optional',
    companyRequired: false,
    emailLabel: 'Deine E-Mail-Adresse *',
    messagePlaceholder: 'Deine Nachricht an das Team...',
    btnText: 'Nachricht absenden →',
  },
];

function useScrollReveal() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function CursorSpotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = spotlightRef.current;
    if (!el) return;

    let rafId: number;
    const handleMove = (e: MouseEvent) => {
      rafId = requestAnimationFrame(() => {
        if (el) {
          el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
          el.style.opacity = '1';
        }
      });
    };

    const handleLeave = () => {
      if (el) {
        el.style.opacity = '0';
      }
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseleave', handleLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <div
      ref={spotlightRef}
      className="cursor-light-spotlight"
      aria-hidden="true"
    />
  );
}

export function Component() {
  useScrollReveal();
  const { user } = useOutletContext<{ user?: { id: string } | null }>() ?? {};
  const videoRef = useRef<HTMLVideoElement>(null);

  // Interactive Live Simulator State
  const [restingHr, setRestingHr] = useState(62);
  const [sleepHours, setSleepHours] = useState(7.2);
  const [vo2max, setVo2max] = useState(44);
  const [zone2Min, setZone2Min] = useState(120);

  // Compute simulated score in real time based on epidemiologic curves
  const simResult = useMemo(() => {
    const hrImpact = (65 - restingHr) * 0.45;
    const sleepImpact = (Math.min(sleepHours, 8.2) - 6.5) * 4.2;
    const vo2Impact = (vo2max - 38) * 0.85;
    const zone2Impact = (Math.min(zone2Min, 240) - 90) * 0.08;

    const rawScore = 60 + hrImpact + sleepImpact + vo2Impact + zone2Impact;
    const score = Math.max(15, Math.min(98, Math.round(rawScore)));

    const chronoAge = 34;
    const ageDelta = ((score - 50) / 10) * -1.2;
    const vitalityAge = Math.max(20, Math.round((chronoAge + ageDelta) * 10) / 10);

    // Band label reflects the same 10-point banding used by the real score
    // engine (Math.floor(score / 10) * 10), not an invented scale.
    const bandLow = Math.min(90, Math.floor(score / 10) * 10);
    const band = `Band ${bandLow}–${bandLow + 9}`;
    const bandColor = score >= 80 ? '#0f6e56' : score >= 65 ? '#1d9e75' : score >= 50 ? '#55544f' : '#854f0b';

    return {
      score,
      vitalityAge,
      chronoAge,
      yearsGained: Math.round((chronoAge - vitalityAge) * 10) / 10,
      band,
      bandColor,
    };
  }, [restingHr, sleepHours, vo2max, zone2Min]);

  // Contact form state with reason selection
  const [selectedReasonId, setSelectedReasonId] = useState<string>('insurer');
  const selectedReason = CONTACT_REASONS.find((r) => r.id === selectedReasonId) ?? CONTACT_REASONS[0];

  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    company: '',
    name: '',
    email: '',
    message: '',
  });

  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    const text = 'kontakt@longevity.app';
    const setCopied = () => {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    };

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(setCopied).catch(() => {
        try {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          setCopied();
        } catch {
          setCopied();
        }
      });
    } else {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        // ignore
      }
      setCopied();
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    setContactError(null);

    const effectiveCompany = contactForm.company.trim() || (
      selectedReason.id === 'feedback' ? 'Community / Feedback' :
      selectedReason.id === 'research' ? 'Forschung & DHBW' :
      'Privatperson / Allgemein'
    );

    const enrichedMessage = `[Anliegen: ${selectedReason.label}]\n\n${contactForm.message.trim()}`;

    try {
      await apiClient('/contact/insurer', {
        method: 'POST',
        body: JSON.stringify({
          company: effectiveCompany,
          name: contactForm.name,
          email: contactForm.email,
          message: enrichedMessage,
        }),
      });
      setContactSubmitted(true);
    } catch (err) {
      setContactError((err as Error).message ?? 'Anfrage konnte nicht gesendet werden.');
    } finally {
      setContactLoading(false);
    }
  };

  const handleSelectTopicAndScrollToForm = (reasonId: string) => {
    setSelectedReasonId(reasonId);
    scrollTo('kontakt');
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Subtle Ambient Cursor Light Spotlight */}
      <CursorSpotlight />

      {/* ── 1. FULLSCREEN CLEAN VIDEO HERO (100vh) ────────────────── */}
      <section
        id="hero"
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          minHeight: 650,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          overflow: 'hidden',
          background: '#091510',
        }}
      >
        {/* Fullscreen Video Background (Default Muted, No Controls, Pure Atmosphere) */}
        <video
          ref={videoRef}
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scale(1.18)',
            transformOrigin: 'center center',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        {/* Soft Center Vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 50%, rgba(7, 18, 14, 0.45) 0%, rgba(7, 18, 14, 0.75) 70%, rgba(7, 18, 14, 0.90) 100%)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />

        {/* Bottom Transition Gradient */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 160,
            background:
              'linear-gradient(to bottom, transparent 0%, rgba(240, 244, 241, 0.8) 75%, #f0f4f1 100%)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />

        {/* Minimalist Hero Content on Video: Pure LONGEVITY & Direct Dashboard Access */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            padding: '0 24px',
            maxWidth: 900,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(36px, 10vw, 120px)',
              fontWeight: 500,
              color: '#ffffff',
              letterSpacing: '0.04em',
              margin: '0 0 28px',
              lineHeight: 0.95,
              textShadow: '0 4px 40px rgba(0, 0, 0, 0.65)',
            }}
          >
            LONGEVITY
          </h1>

          {/* Action CTA: Zum Dashboard */}
          <Link
            to={user ? '/dashboard' : '/login?returnTo=%2Fdashboard'}
            style={{ textDecoration: 'none' }}
          >
            <Btn
              style={{
                padding: '16px 42px',
                fontSize: 16,
                fontWeight: 600,
                boxShadow: '0 6px 30px rgba(29, 158, 117, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
              }}
            >
              Zum Dashboard →
            </Btn>
          </Link>
        </div>

        {/* Bottom Scroll Cue */}
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: 0,
            right: 0,
            zIndex: 10,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => scrollTo('produkt')}
            style={{
              background: 'rgba(255, 255, 255, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: '8px 20px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 500,
              color: '#22221f',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'inherit',
              boxShadow: '0 2px 14px rgba(0, 0, 0, 0.08)',
            }}
          >
            <span>Produkt entdecken</span>
            <span>↓</span>
          </button>
        </div>
      </section>

      {/* ── BRAND LOGOS & PLATFORM INTEGRATIONS RIBBON ─────────────── */}
      <BrandLogosRibbon />

      {/* ── 2. PRODUCT VALUE PROPOSITION & BIOMETRICS HUD ─────────── */}
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '32px 20px 0' }}>
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

        {/* ── 3. FUNKTIONSWEISE: DAS 3-SÄULEN-PRINZIP ───────────────── */}
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

        {/* ── 4. INTERAKTIVER SIMULATOR (DER PITCH!) ─────────────────── */}
        <section
          id="simulator"
          className="scroll-reveal"
          style={{
            marginBottom: 110,
            scrollMarginTop: 110,
          }}
        >
          <div
            className="glass-deep"
            style={{
              borderRadius: 24,
              padding: 'clamp(20px, 4vw, 44px) clamp(16px, 4vw, 40px)',
              boxShadow: '0 16px 50px rgba(15, 40, 28, 0.08), 0 1px 0 rgba(255, 255, 255, 1) inset',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '3px 12px',
                  borderRadius: 999,
                  background: '#e1f5ee',
                  color: '#0f6e56',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Interaktive Demo
              </span>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 500, color: '#22221f', margin: '10px 0 8px' }}>
                Erlebe die LONGEVITY-Hebel-Engine interaktiv
              </h2>
              <p style={{ fontSize: 15, color: '#55544f', maxWidth: 620, margin: '0 auto' }}>
                Bewege die Regler und beobachte, wie sich kleine Lebensstil-Anpassungen direkt auf deinen
                Score und dein biologisches Vitalitätsalter auswirken.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                gap: 'clamp(24px, 4vw, 40px)',
                alignItems: 'center',
              }}
            >
              {/* Sliders Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Slider 1: Ruhepuls */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#22221f' }}>Ruhepuls</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f6e56' }}>{restingHr} bpm</span>
                  </div>
                  <input
                    type="range"
                    min="45"
                    max="85"
                    value={restingHr}
                    onChange={(e) => setRestingHr(Number(e.target.value))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888780', marginTop: 4, flexWrap: 'wrap', gap: 4 }}>
                    <span>45 (Athlet)</span>
                    <span>65 (Schnitt)</span>
                    <span>85 bpm</span>
                  </div>
                </div>

                {/* Slider 2: Schlafdauer */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#22221f' }}>Schlafdauer</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f6e56' }}>{sleepHours.toFixed(1)} h / Nacht</span>
                  </div>
                  <input
                    type="range"
                    min="5.0"
                    max="9.5"
                    step="0.1"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(Number(e.target.value))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888780', marginTop: 4, flexWrap: 'wrap', gap: 4 }}>
                    <span>5,0 h (Mangel)</span>
                    <span>7,5–8,0 h (Optimum)</span>
                    <span>9,5 h</span>
                  </div>
                </div>

                {/* Slider 3: VO2max */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#22221f' }}>Kardiovaskuläre Fitness (VO₂max)</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f6e56' }}>{vo2max} ml/kg/min</span>
                  </div>
                  <input
                    type="range"
                    min="26"
                    max="58"
                    value={vo2max}
                    onChange={(e) => setVo2max(Number(e.target.value))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888780', marginTop: 4, flexWrap: 'wrap', gap: 4 }}>
                    <span>26 (Niedrig)</span>
                    <span>42 (Gut)</span>
                    <span>58 (Spitze)</span>
                  </div>
                </div>

                {/* Slider 4: Zone 2 Training */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#22221f' }}>Zone-2 Ausdauerminuten / Woche</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f6e56' }}>{zone2Min} Min</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="300"
                    step="10"
                    value={zone2Min}
                    onChange={(e) => setZone2Min(Number(e.target.value))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888780', marginTop: 4, flexWrap: 'wrap', gap: 4 }}>
                    <span>0 Min</span>
                    <span>150 Min (WHO)</span>
                    <span>300 Min</span>
                  </div>
                </div>
              </div>

              {/* Result Score Card */}
              <div
                className="glass card-interactive"
                style={{
                  borderRadius: 20,
                  padding: 'clamp(24px, 3.5vw, 36px) clamp(16px, 3.5vw, 32px)',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.95)',
                  background: 'rgba(255, 255, 255, 0.78)',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 500, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Beispielhafter Score
                </div>

                {/* Huge animated score number */}
                <div
                  style={{
                    fontSize: 68,
                    fontWeight: 500,
                    color: '#0f6e56',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    marginBottom: 10,
                  }}
                >
                  {simResult.score}
                </div>

                {/* Band Chip */}
                <div style={{ marginBottom: 24 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '4px 14px',
                      borderRadius: 999,
                      background: '#e1f5ee',
                      color: simResult.bandColor,
                      border: '1px solid rgba(29, 158, 117, 0.25)',
                    }}
                  >
                    {simResult.band}
                  </span>
                </div>

                {/* Vitality Age Delta Box */}
                <div
                  style={{
                    background: 'rgba(240, 244, 241, 0.8)',
                    borderRadius: 14,
                    padding: '16px 20px',
                    marginBottom: 24,
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#55544f' }}>Chronologisches Alter:</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{simResult.chronoAge} Jahre</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#55544f' }}>Biologisches Vitalitätsalter:</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0f6e56' }}>{simResult.vitalityAge} Jahre</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#22221f' }}>Gewonnene Vitalitätsjahre:</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: simResult.yearsGained >= 0 ? '#0f6e56' : '#a32d2d' }}>
                      {simResult.yearsGained >= 0 ? `+${simResult.yearsGained} J.` : `${simResult.yearsGained} J.`}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Btn full style={{ padding: '12px 20px', fontSize: 14 }}>
                    Deine echten Werte ermitteln →
                  </Btn>
                </Link>

                <p style={{ fontSize: 11, color: '#a3a29c', marginTop: 14, lineHeight: 1.5 }}>
                  Vereinfachte Beispielrechnung zur Veranschaulichung — keine echte Score-Berechnung.
                  Dein tatsächlicher Score basiert auf 4 wissenschaftlichen Domänen und echten Messdaten.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. DATENSCHUTZ & ZERO-KNOWLEDGE SHARING ──────────────── */}
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
            <Card className="card-interactive" style={{ padding: 'clamp(24px, 3.5vw, 36px) clamp(16px, 3.5vw, 32px)', background: 'rgba(255, 240, 240, 0.45)', border: '1px solid rgba(163, 45, 45, 0.2)' }}>
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
            <Card className="card-interactive" style={{ padding: 'clamp(24px, 3.5vw, 36px) clamp(16px, 3.5vw, 32px)', background: 'rgba(225, 245, 238, 0.55)', border: '1px solid rgba(29, 158, 117, 0.35)' }}>
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

        {/* ── 6. FÜR KRANKENKASSEN & B2B-PARTNER ──────────────────────── */}
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

            {/* CTA Banner: Connect directly to the form below */}
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
                  onClick={() => handleSelectTopicAndScrollToForm('insurer')}
                  style={{ padding: '11px 22px', fontSize: 13 }}
                >
                  Kooperationsanfrage stellen ↓
                </Btn>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. DAS TEAM & DIREKTER EMAIL-KONTAKT ───────────────── */}
        <section
          id="ueber-uns"
          className="scroll-reveal"
          style={{ marginBottom: 120, scrollMarginTop: 110 }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', maxWidth: 840, margin: '0 auto 48px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '4px 14px',
                  borderRadius: 999,
                  background: 'rgba(29, 158, 117, 0.12)',
                  color: '#0f6e56',
                  border: '1px solid rgba(29, 158, 117, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <GraduationCap size={14} />
                DHBW Mannheim · Duale Hochschule Baden-Württemberg
              </span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 500,
                color: '#22221f',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                margin: '0 0 16px',
              }}
            >
              Von Studierenden entwickelt.{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #1d9e75 0%, #0f6e56 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Direkt als Team ansprechbar.
              </span>
            </h2>

            <p
              style={{
                fontSize: 'clamp(15px, 2vw, 17px)',
                color: '#55544f',
                lineHeight: 1.65,
                margin: '0 auto',
                maxWidth: 760,
              }}
            >
              Hinter LONGEVITY steht kein anonymer Großkonzern, sondern ein 5-köpfiges Team der DHBW Mannheim:
              Drei Software-Entwickler und zwei BWL-Expertinnen verbinden modernste Software-Architektur und
              Datensouveränität mit fundierter Produktführung und verlässlicher Kooperation. Schreib uns direkt &ndash;
              wir freuen uns auf jeden Austausch und antworten persönlich!
            </p>
          </div>

          {/* 2-Column Showcase: Left Image & Ethos, Right Direct Contact Hub */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
              gap: 32,
              alignItems: 'start',
            }}
          >
            {/* Left Column: Team Photo & Real-World Presence */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="team-image-card">
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={teamImage}
                    alt="Das LONGEVITY Entwickler-Team in Mannheim vor dem Wasserturm"
                    style={{
                      width: '100%',
                      aspectRatio: '1024 / 879',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />

                  {/* Top-Right Badge: Team Indicator */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      background: 'rgba(7, 18, 14, 0.75)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      padding: '6px 14px',
                      borderRadius: 999,
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                    }}
                  >
                    <span className="pulse-emerald-dot" />
                    <span>5 Köpfe · DHBW Team</span>
                  </div>

                  {/* Bottom Gradient Overlay with Location */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '36px 20px 16px',
                      background:
                        'linear-gradient(to top, rgba(7, 18, 14, 0.90) 0%, rgba(7, 18, 14, 0.45) 60%, transparent 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '0.01em' }}>
                        LONGEVITY Kernteam
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: 'rgba(255, 255, 255, 0.88)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          marginTop: 3,
                        }}
                      >
                        <MapPin size={13} color="#5dcaa5" />
                        <span>Mannheim (Blick auf Wasserturm & Fernmeldeturm)</span>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        background: 'rgba(255, 255, 255, 0.16)',
                        border: '1px solid rgba(255, 255, 255, 0.28)',
                        borderRadius: 999,
                        padding: '3px 10px',
                        backdropFilter: 'blur(8px)',
                        color: '#ffffff',
                        fontWeight: 500,
                      }}
                    >
                      Baden-Württemberg
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Roles: 3 Tech + 2 Business */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 14,
                  padding: '12px 18px',
                  border: '1px solid rgba(29, 158, 117, 0.22)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 12,
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: '#e1f5ee',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0f6e56',
                      flexShrink: 0,
                    }}
                  >
                    <Code size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Tech & Engineering</div>
                    <div style={{ fontSize: 12, color: '#55544f' }}>Max, Victor & Till</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: '#e1f5ee',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0f6e56',
                      flexShrink: 0,
                    }}
                  >
                    <Briefcase size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Business & Strategie</div>
                    <div style={{ fontSize: 12, color: '#55544f' }}>Lea & Christina</div>
                  </div>
                </div>
              </div>

              {/* 3 Value Pillars beneath photo */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: 12,
                }}
              >
                <div
                  className="glass card-interactive"
                  style={{
                    borderRadius: 14,
                    padding: '14px 16px',
                    border: '1px solid rgba(255, 255, 255, 0.9)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#0f6e56',
                      textTransform: 'uppercase',
                      marginBottom: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <Users size={13} /> 3 Tech · 2 BWL
                  </div>
                  <div style={{ fontSize: 12, color: '#55544f', lineHeight: 1.4 }}>
                    Code, Architektur, Finanzen & Partnerschaften vereint
                  </div>
                </div>

                <div
                  className="glass card-interactive"
                  style={{
                    borderRadius: 14,
                    padding: '14px 16px',
                    border: '1px solid rgba(255, 255, 255, 0.9)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#0f6e56',
                      textTransform: 'uppercase',
                      marginBottom: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <Sparkles size={13} /> 100% Inhouse
                  </div>
                  <div style={{ fontSize: 12, color: '#55544f', lineHeight: 1.4 }}>
                    Vom Score-Algorithmus über FHIR bis zum Partnermodell
                  </div>
                </div>

                <div
                  className="glass card-interactive"
                  style={{
                    borderRadius: 14,
                    padding: '14px 16px',
                    border: '1px solid rgba(255, 255, 255, 0.9)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#0f6e56',
                      textTransform: 'uppercase',
                      marginBottom: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <Mail size={13} /> Direktkontakt
                  </div>
                  <div style={{ fontSize: 12, color: '#55544f', lineHeight: 1.4 }}>
                    Echte Antworten vom Team &ndash; werktags in 24h
                  </div>
                </div>
              </div>

              {/* Mission Statement */}
              <div
                style={{
                  background: 'rgba(240, 244, 241, 0.85)',
                  borderRadius: 14,
                  padding: '16px 20px',
                  border: '1px solid rgba(29, 158, 117, 0.22)',
                  fontSize: 13,
                  color: '#44433e',
                  lineHeight: 1.6,
                }}
              >
                <em>
                  &bdquo;Unser Anspruch: Medizinische Evidenz, modernste Software-Architektur und verlässliche
                  Partnerschaften so zu vereinen, dass Nutzer die Kontrolle über ihre Gesundheitsdaten behalten &ndash;
                  und Partner messbare Mehrwerte erzielen.&ldquo;
                </em>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#0f6e56', marginTop: 8, textAlign: 'right' }}>
                  &mdash; Max, Victor, Till (Tech) &middot; Lea & Christina (Business)
                </div>
              </div>
            </div>

            {/* Right Column: Unified Contact Form directly next to the picture (#kontakt) */}
            <Card
              id="kontakt"
              className="card-interactive"
              style={{
                padding: 'clamp(24px, 3.5vw, 36px) clamp(18px, 3.5vw, 32px)',
                background: 'rgba(255, 255, 255, 0.92)',
                boxShadow: '0 16px 45px rgba(15, 40, 28, 0.08)',
                borderRadius: 20,
                scrollMarginTop: 110,
              }}
            >
              {contactSubmitted ? (
                <div style={{ textAlign: 'center', padding: '36px 16px' }}>
                  <Check size={44} color="#0f6e56" style={{ margin: '0 auto 14px', display: 'block' }} />
                  <h3 style={{ fontSize: 20, fontWeight: 600, color: '#0f6e56', margin: '0 0 10px' }}>
                    Vielen Dank für deine Nachricht!
                  </h3>
                  <p style={{ fontSize: 14, color: '#55544f', margin: '0 auto 20px', maxWidth: 420, lineHeight: 1.55 }}>
                    Wir haben dein Anliegen erhalten. Ein Mitglied unseres Entwicklerteams wird sich
                    innerhalb von 24 Stunden persönlich bei dir melden.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setContactSubmitted(false);
                      setContactForm({ company: '', name: '', email: '', message: '' });
                    }}
                    style={{
                      background: 'none',
                      border: '1px solid #0f6e56',
                      color: '#0f6e56',
                      padding: '8px 18px',
                      borderRadius: 999,
                      fontSize: 12,
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    Weitere Nachricht verfassen
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit}>
                  {/* Card Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 8,
                      marginBottom: 16,
                      borderBottom: '1px solid rgba(0,0,0,0.06)',
                      paddingBottom: 14,
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: 19, fontWeight: 600, color: '#22221f', margin: 0 }}>
                        Kontaktformular & Direktanfrage
                      </h3>
                      <div style={{ fontSize: 12, color: '#888780', marginTop: 2 }}>
                        Direkt an das DHBW-Entwicklerteam
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 11,
                        fontWeight: 500,
                        color: '#0f6e56',
                        background: '#e1f5ee',
                        padding: '4px 12px',
                        borderRadius: 999,
                        border: '1px solid rgba(29, 158, 117, 0.25)',
                      }}
                    >
                      <span className="pulse-emerald-dot" />
                      <span>Team erreichbar</span>
                    </div>
                  </div>

                  {/* Reason Selector Chips */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#22221f', marginBottom: 8 }}>
                      Anliegen auswählen:
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {CONTACT_REASONS.map((reason) => {
                        const isActive = selectedReasonId === reason.id;
                        return (
                          <button
                            key={reason.id}
                            type="button"
                            onClick={() => setSelectedReasonId(reason.id)}
                            className={`team-topic-chip ${isActive ? 'is-active' : ''}`}
                            style={{ fontSize: 11.5, padding: '6px 12px' }}
                          >
                            <span>{reason.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Form Inputs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#55544f', marginBottom: 4 }}>
                        {selectedReason.companyLabel}
                      </label>
                      <input
                        required={selectedReason.companyRequired}
                        type="text"
                        placeholder={selectedReason.companyPlaceholder}
                        value={contactForm.company}
                        onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#55544f', marginBottom: 4 }}>
                        Ansprechpartner / Name *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Vorname Nachname"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#55544f', marginBottom: 4 }}>
                        {selectedReason.emailLabel}
                      </label>
                      <input
                        required
                        type="email"
                        placeholder={selectedReason.id === 'insurer' ? 'name@organisation.de' : 'deine.mail@beispiel.de'}
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#55544f', marginBottom: 4 }}>
                        Nachricht oder Anliegen
                      </label>
                      <textarea
                        rows={3}
                        placeholder={selectedReason.messagePlaceholder}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        style={{ ...inputStyle, resize: 'vertical' }}
                      />
                    </div>

                    {contactError && (
                      <p style={{ color: '#a32d2d', fontSize: 13, margin: 0 }}>{contactError}</p>
                    )}

                    <Btn type="submit" full disabled={contactLoading} style={{ marginTop: 2, padding: '12px 20px', fontSize: 14 }}>
                      {contactLoading ? 'Wird übermittelt…' : selectedReason.btnText}
                    </Btn>

                    {/* Prominent Team Email Box with 1-Click Copy & Direct Mail App Launch */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, rgba(225, 245, 238, 0.7) 0%, rgba(240, 244, 241, 0.75) 100%)',
                        border: '1px solid rgba(29, 158, 117, 0.32)',
                        borderRadius: 12,
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 10,
                        marginTop: 4,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 10.5, fontWeight: 500, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
                          Offizielle Team-Adresse
                        </div>
                        <a
                          href={`mailto:kontakt@longevity.app?subject=${encodeURIComponent(selectedReason.subject)}`}
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: '#0f6e56',
                            textDecoration: 'none',
                            fontFamily: 'monospace',
                          }}
                        >
                          kontakt@longevity.app
                        </a>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          type="button"
                          onClick={handleCopyEmail}
                          title="E-Mail-Adresse in die Zwischenablage kopieren"
                          style={{
                            background: copiedEmail ? '#0f6e56' : '#ffffff',
                            color: copiedEmail ? '#ffffff' : '#22221f',
                            border: copiedEmail ? '1px solid #0f6e56' : '1px solid rgba(168, 168, 156, 0.35)',
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            transition: 'all 0.15s ease',
                            fontFamily: 'inherit',
                          }}
                        >
                          {copiedEmail ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedEmail ? 'Kopiert!' : 'Kopieren'}</span>
                        </button>

                        <a
                          href={`mailto:kontakt@longevity.app?subject=${encodeURIComponent(selectedReason.subject)}`}
                          style={{
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            background: 'linear-gradient(135deg, #1d9e75 0%, #0f6e56 100%)',
                            color: '#ffffff',
                            border: '1px solid rgba(15,110,86,0.4)',
                            boxShadow: '0 2px 10px rgba(29,158,117,0.25)',
                            padding: '6px 13px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 500,
                            fontFamily: 'inherit',
                            cursor: 'pointer',
                          }}
                        >
                          <Send size={12} style={{ marginRight: 2 }} />
                          Mail öffnen
                        </a>
                      </div>
                    </div>

                    {/* Footer Row: Guarantee & GitHub Link */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 11,
                        color: '#888780',
                        borderTop: '1px solid rgba(0,0,0,0.06)',
                        paddingTop: 10,
                        marginTop: 2,
                        flexWrap: 'wrap',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Check size={12} color="#1d9e75" />
                        <span>Antwort in der Regel binnen 24 Stunden</span>
                      </div>

                      <a
                        href="https://github.com/Max-imalgutaussehend/LONGEVITY"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: '#0f6e56',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontWeight: 500,
                        }}
                      >
                        <ExternalLink size={12} />
                        GitHub Repository ↗
                      </a>
                    </div>
                  </div>
                </form>
              )}
            </Card>
          </div>
        </section>

        {/* ── 8. FINAL CALL TO ACTION BANNER ────────────────────────── */}
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
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Btn style={{ padding: '15px 38px', fontSize: 16 }}>
                Kostenloses Profil erstellen →
              </Btn>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid rgba(168, 168, 156, 0.3)',
  background: 'rgba(255, 255, 255, 0.7)',
  fontSize: 13,
  fontFamily: 'inherit',
  color: '#22221f',
  outline: 'none',
  transition: 'border-color 0.15s',
};
