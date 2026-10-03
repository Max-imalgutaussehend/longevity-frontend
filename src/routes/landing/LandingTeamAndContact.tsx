import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import {
  MapPin,
  Code,
  Briefcase,
  Users,
  Mail,
  Check,
} from 'lucide-react';
import teamImage from '../../assets/team.png';
import { Card, Btn } from '../../components/ui.js';
import { apiClient } from '../../api/client.js';
import { EXTERNAL_LINKS } from '../../lib/routes.js';
import { CONTACT_REASONS } from './landingTypes.js';

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

    const enrichedMessage = `[Thema: ${selectedReason.label}]\n\n${contactForm.message.trim()}`;

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
            <Mail size={14} />
            Direktkontakt & Austausch
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
          Gerne direkt mit uns austauschen.{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #1d9e75 0%, #0f6e56 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Per Kontaktformular oder direkt per Mail.
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
          Ob Fragen zur Plattform, Kooperationen oder technisches Feedback: Du erreichst unser
          5-köpfiges Team jederzeit direkt &ndash; nutze einfach das Kontaktformular oder
          schreib uns direkt per E-Mail an{' '}
          <a
            href={`mailto:${EXTERNAL_LINKS.contactEmail}`}
            style={{ color: '#0f6e56', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2 }}
          >
            {EXTERNAL_LINKS.contactEmail}
          </a>
          . Wir antworten persönlich und zeitnah!
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
                <Users size={13} color="#5dcaa5" />
                <span>5 Köpfe · Kernteam</span>
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
                {selectedReason.id === 'insurer' ? 'Vielen Dank für Ihre Anfrage!' : 'Danke für deine Nachricht!'}
              </h3>
              <p style={{ fontSize: 14, color: '#55544f', margin: '0 auto 20px', maxWidth: 420, lineHeight: 1.55 }}>
                {selectedReason.id === 'insurer'
                  ? 'Wir haben Ihre Anfrage erhalten und melden uns in Kürze persönlich bei Ihnen.'
                  : 'Wir haben deine Nachricht erhalten und melden uns zeitnah bei dir.'}
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
                Weitere Nachricht senden
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit}>
              {/* Card Header */}
              <div
                style={{
                  marginBottom: 20,
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                  paddingBottom: 14,
                }}
              >
                <h3 style={{ fontSize: 19, fontWeight: 600, color: '#22221f', margin: 0 }}>
                  Nachricht an das Team
                </h3>
                <p style={{ fontSize: 13, color: '#55544f', margin: '4px 0 0', lineHeight: 1.4 }}>
                  Fragen, Anregungen oder Interesse an einer Zusammenarbeit? Schreib uns direkt.
                </p>
              </div>

              {/* Form Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Topic Select */}
                <div>
                  <label htmlFor="contact-reason" style={labelStyle}>
                    Thema
                  </label>
                  <select
                    id="contact-reason"
                    name="reason"
                    value={selectedReasonId}
                    onChange={(e) => onSelectReasonId(e.target.value)}
                    style={selectStyle}
                  >
                    {CONTACT_REASONS.map((reason) => (
                      <option key={reason.id} value={reason.id}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-company" style={labelStyle}>
                    {selectedReason.companyLabel}
                  </label>
                  <input
                    id="contact-company"
                    name="company"
                    required={selectedReason.companyRequired}
                    type="text"
                    placeholder={selectedReason.companyPlaceholder}
                    value={contactForm.company}
                    onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label htmlFor="contact-name" style={labelStyle}>
                    Name *
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    required
                    type="text"
                    autoComplete="name"
                    placeholder={selectedReason.id === 'insurer' ? 'Dr. Vorname Nachname' : 'Vorname Nachname'}
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" style={labelStyle}>
                    {selectedReason.emailLabel}
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    required
                    type="email"
                    autoComplete="email"
                    placeholder={selectedReason.id === 'insurer' ? 'name@organisation.de' : 'name@beispiel.de'}
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" style={labelStyle}>
                    Nachricht
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    placeholder={selectedReason.messagePlaceholder}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>

                {contactError && (
                  <p role="alert" style={{ color: '#a32d2d', fontSize: 13, margin: 0 }}>
                    {contactError}
                  </p>
                )}

                <Btn
                  type="submit"
                  full
                  disabled={contactLoading}
                  style={{ marginTop: 4, padding: '12px 20px', fontSize: 14 }}
                >
                  {contactLoading
                    ? 'Wird gesendet…'
                    : selectedReason.id === 'insurer'
                    ? 'Anfrage senden'
                    : 'Nachricht senden'}
                </Btn>

                {/* Direct email link */}
                <p
                  style={{
                    fontSize: 12.5,
                    color: '#666560',
                    margin: '10px 0 0',
                    textAlign: 'center',
                    lineHeight: 1.5,
                  }}
                >
                  Alternativ erreichst du uns direkt per E-Mail unter{' '}
                  <a
                    href={`mailto:${EXTERNAL_LINKS.contactEmail}?subject=${encodeURIComponent(selectedReason.subject)}`}
                    style={{
                      color: '#0f6e56',
                      fontWeight: 600,
                      textDecoration: 'underline',
                      textUnderlineOffset: 2,
                    }}
                  >
                    {EXTERNAL_LINKS.contactEmail}
                  </a>
                </p>
              </div>
            </form>
          )}
        </Card>
      </div>
    </section>
  );
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: '#55544f',
  marginBottom: 4,
};

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
  boxSizing: 'border-box',
};

const selectStyle: CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'auto',
};
