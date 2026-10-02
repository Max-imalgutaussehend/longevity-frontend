import { useState } from 'react';
import { Lock, Check, ShieldCheck, Gift, Building2, Dumbbell, Watch } from 'lucide-react';
import { Btn, Chip } from '../ui.js';

export function TutorialStepLevers() {
  const [isSigningToken, setIsSigningToken] = useState(false);
  const [hasSignedToken, setHasSignedToken] = useState(false);

  const handleSimulateSign = () => {
    setIsSigningToken(true);
    setTimeout(() => {
      setIsSigningToken(false);
      setHasSignedToken(true);
    }, 700);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ textAlign: 'center' }}>
        <Chip color="teal">Schritt 4 von 5 · Privatsphäre & Vorteile</Chip>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: '#22221f', margin: '10px 0 4px', letterSpacing: '-0.02em' }}>
          Gesundheit belohnen ohne Datenpreisgabe
        </h2>
        <p style={{ fontSize: 13, color: '#55544f', maxWidth: 520, margin: '0 auto', lineHeight: 1.45 }}>
          Partner belohnen deinen Lebensstil. Mit unserer <strong>Zero-Knowledge Signatur</strong>
          überträgst du ausschließlich das Score-Band — keine Rohdaten.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Left: Interactive Privacy Token Box */}
        <div style={{
          padding: 16,
          borderRadius: 18,
          border: '1px solid rgba(29,158,117,0.3)',
          background: 'rgba(29,158,117,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', color: '#0f6e56' }}><Lock size={20} /></span>
            <strong style={{ fontSize: 13, color: '#0f6e56' }}>Kryptografischer Nachweis</strong>
          </div>

          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '12px 14px',
            border: '1px dashed rgba(29,158,117,0.4)',
            fontSize: 12,
            color: '#22221f',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}>
            <div>Freigabe: <strong>Band 70–79</strong></div>
            <div style={{ fontSize: 11, color: '#888780' }}>
              Signatur: {hasSignedToken ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Check size={13} color="#0f6e56" /> Ed25519 (Gültig)
                </span>
              ) : (
                'Nicht signiert'
              )}
            </div>
            <div style={{ fontSize: 10, color: '#a3a29c', wordBreak: 'break-all', fontFamily: 'monospace' }}>
              {hasSignedToken
                ? 'hash: 9f82c...e4b1 (Verifizierbar)'
                : 'Klicke unten, um Signatur zu testen'}
            </div>
          </div>

          <Btn
            small
            variant={hasSignedToken ? 'ghost' : 'secondary'}
            disabled={isSigningToken}
            onClick={handleSimulateSign}
          >
            {isSigningToken ? (
              'Signiere...'
            ) : hasSignedToken ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Check size={14} /> Signatur erfolgreich!
              </span>
            ) : (
              'Signatur jetzt testen'
            )}
          </Btn>

          <div style={{ fontSize: 11, color: '#55544f', lineHeight: 1.35, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={16} color="#0f6e56" style={{ flexShrink: 0 }} />
            <span><strong>Zero Raw-Data:</strong> Dein Puls, deine Schritte oder Schlafdauer verlassen niemals dein Gerät!</span>
          </div>
        </div>

        {/* Right: Partner Benefits Box */}
        <div style={{
          padding: 16,
          borderRadius: 18,
          border: '1px solid rgba(0,0,0,0.08)',
          background: 'rgba(255,255,255,0.75)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', color: '#0f6e56' }}><Gift size={20} /></span>
            <strong style={{ fontSize: 13, color: '#22221f' }}>Freischaltbare Vorteile</strong>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
            <div style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(29,158,117,0.08)', color: '#0f6e56' }}>
              <Building2 size={15} style={{ verticalAlign: 'middle', marginRight: 6, color: '#0f6e56' }} />
              <strong>Bis zu 15% Rabatt</strong> auf private Krankenversicherungen
            </div>
            <div style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(29,158,117,0.08)', color: '#0f6e56' }}>
              <Dumbbell size={15} style={{ verticalAlign: 'middle', marginRight: 6, color: '#0f6e56' }} />
              <strong>40 € monatlich</strong> Zuschuss für Fitness & Wellness
            </div>
            <div style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(29,158,117,0.08)', color: '#0f6e56' }}>
              <Watch size={15} style={{ verticalAlign: 'middle', marginRight: 6, color: '#0f6e56' }} />
              <strong>Wearable-Boni</strong> auf Oura, Garmin & Whoop
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
