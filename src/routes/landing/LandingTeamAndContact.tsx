import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import {
  GraduationCap,
  MapPin,
  Code,
  Briefcase,
  Users,
  Sparkles,
  Mail,
  Check,
  Send,
  Copy,
  ExternalLink,
} from 'lucide-react';
import teamImage from '../../assets/team.png';
import { Card, Btn } from '../../components/ui.js';
import { apiClient } from '../../api/client.js';
import { EXTERNAL_LINKS } from '../../lib/routes.js';
import { CONTACT_REASONS } from './landingTypes.js';
import { copyToClipboard } from './landingUtils.js';

interface LandingTeamAndContactProps {
  selectedReasonId: string;
  onSelectReasonId: (id: string) => void;
}

export function LandingTeamAndContact({ selectedReasonId, onSelectReasonId }: LandingTeamAndContactProps) {
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

  const handleCopyEmail = async () => {
    const success = await copyToClipboard(EXTERNAL_LINKS.contactEmail);
    if (success) {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    setContactError(null);

    const effectiveCompany =
      contactForm.company.trim() ||
      (selectedReason.id === 'feedback'
        ? 'Community / Feedback'
        : selectedReason.id === 'research'
        ? 'Forschung & DHBW'
        : 'Privatperson / Allgemein');

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

  return (
    <section id="ueber-uns" className="scroll-reveal" style={{ marginBottom: 120, scrollMarginTop: 110 }}>
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

        {/* Right Column: Unified Contact Form */}
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
                {selectedReason.id === 'insurer' ? 'Vielen Dank für Ihre Anfrage!' : 'Vielen Dank für deine Nachricht!'}
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
                        onClick={() => onSelectReasonId(reason.id)}
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
                    placeholder={selectedReason.id === 'insurer' ? 'Dr. Vorname Nachname' : 'Vorname Nachname'}
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

                {/* Team Email Box */}
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
                      href={`mailto:${EXTERNAL_LINKS.contactEmail}?subject=${encodeURIComponent(selectedReason.subject)}`}
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: '#0f6e56',
                        textDecoration: 'none',
                        fontFamily: 'monospace',
                      }}
                    >
                      {EXTERNAL_LINKS.contactEmail}
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
                      href={`mailto:${EXTERNAL_LINKS.contactEmail}?subject=${encodeURIComponent(selectedReason.subject)}`}
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
                    href={EXTERNAL_LINKS.github}
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
  );
}

const inputStyle: CSSProperties = {
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
