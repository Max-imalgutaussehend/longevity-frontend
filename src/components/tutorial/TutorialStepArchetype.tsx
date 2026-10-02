import { useState, useEffect } from 'react';
import { Activity, Sparkles, Briefcase, Heart, Moon, Zap, Shield } from 'lucide-react';
import { Chip } from '../ui.js';
import { ARCHETYPES, type Archetype } from './tutorialTypes.js';

export function TutorialStepArchetype() {
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype>('athletic');
  const [userAge, setUserAge] = useState<number>(30);
  const [displayScore, setDisplayScore] = useState<number>(84);

  const activeProfile = ARCHETYPES.find((a) => a.id === selectedArchetype) ?? ARCHETYPES[0];
  const targetScore = activeProfile.targetScore;

  // Smooth score count-up animation when archetype changes
  useEffect(() => {
    let current = displayScore;
    const stepDiff = targetScore - current;
    if (stepDiff === 0) return;

    const interval = setInterval(() => {
      current += stepDiff > 0 ? 1 : -1;
      setDisplayScore(current);
      if (current === targetScore) clearInterval(interval);
    }, 18);

    return () => clearInterval(interval);
  }, [targetScore, displayScore]);

  const bioAgeDelta = Number(((displayScore - 50) / 10).toFixed(1));
  const calculatedBioAge = Number((userAge - bioAgeDelta).toFixed(1));

  // SVG Gauge calculations
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  const renderArchetypeIcon = (iconName: string) => {
    switch (iconName) {
      case 'activity':
        return <Activity size={24} color="#0f6e56" />;
      case 'sparkles':
        return <Sparkles size={24} color="#0f6e56" />;
      case 'briefcase':
        return <Briefcase size={24} color="#0f6e56" />;
      default:
        return <Activity size={24} color="#0f6e56" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ textAlign: 'center' }}>
        <Chip color="teal">Schritt 1 von 5 · Interaktiver Einstieg</Chip>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: '#22221f', margin: '10px 0 4px', letterSpacing: '-0.02em' }}>
          Dein Pass kennt dein Alter. Dein Körper deine Vitalität.
        </h2>
        <p style={{ fontSize: 13, color: '#55544f', maxWidth: 540, margin: '0 auto', lineHeight: 1.45 }}>
          Wähle unten dein typisches Lebensstil-Profil und dein Alter, um live zu sehen,
          wie die 4 wissenschaftlichen Säulen deinen <strong>Score</strong> und dein <strong>Vitalitätsalter</strong> formen.
        </p>
      </div>

      {/* Interactive Archetype Cards */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8, textAlign: 'center' }}>
          Klicke auf ein Profil zum Ausprobieren:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {ARCHETYPES.map((arch) => {
            const isSelected = selectedArchetype === arch.id;
            return (
              <button
                key={arch.id}
                type="button"
                className="archetype-btn"
                onClick={() => setSelectedArchetype(arch.id)}
                style={{
                  padding: '12px 10px',
                  borderRadius: 16,
                  border: isSelected ? '2px solid #0f6e56' : '1px solid rgba(0,0,0,0.08)',
                  background: isSelected ? 'rgba(15,110,86,0.08)' : 'rgba(255,255,255,0.75)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: isSelected ? '0 4px 16px rgba(15,110,86,0.18)' : 'none',
                }}
              >
                <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'center' }}>
                  {renderArchetypeIcon(arch.iconName)}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: isSelected ? '#0f6e56' : '#22221f' }}>
                  {arch.label}
                </div>
                <div style={{ fontSize: 10, color: '#55544f', marginTop: 3, lineHeight: 1.3 }}>
                  {arch.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Animated Visual Showcase */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(240,248,244,0.85) 0%, rgba(230,244,238,0.65) 100%)',
        border: '1px solid rgba(29,158,117,0.22)',
        borderRadius: 20,
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        boxShadow: '0 8px 24px rgba(29,158,117,0.12)',
      }}>
        {/* Left: Circular SVG Gauge with animated stroke */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative', width: 108, height: 108 }}>
            <svg width="108" height="108" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="54"
                cy="54"
                r={radius}
                stroke="rgba(0,0,0,0.06)"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="54"
                cy="54"
                r={radius}
                stroke="#1d9e75"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: '#0f6e56', lineHeight: 1 }}>
                {displayScore}
              </span>
              <span style={{ fontSize: 9, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>
                Score
              </span>
            </div>
          </div>

          <div>
            <Chip color={displayScore >= 75 ? 'teal' : displayScore >= 60 ? 'amber' : 'neutral'}>
              {`Band ${Math.floor(displayScore / 10) * 10}–${Math.floor(displayScore / 10) * 10 + 9}`}
            </Chip>
            <div style={{ fontSize: 13, color: '#55544f', marginTop: 6 }}>
              Pass-Alter: <strong>{userAge} Jahre</strong>
            </div>
            <div style={{
              fontSize: 20,
              fontWeight: 700,
              color: bioAgeDelta > 0 ? '#0f6e56' : '#22221f',
              marginTop: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              {calculatedBioAge} Jahre
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 99,
                background: bioAgeDelta > 0 ? 'rgba(29,158,117,0.15)' : 'rgba(168,168,156,0.18)',
                color: bioAgeDelta > 0 ? '#0f6e56' : '#55544f',
              }}>
                {bioAgeDelta > 0 ? `-${bioAgeDelta} J. jünger!` : `+${Math.abs(bioAgeDelta)} J.`}
              </span>
            </div>
          </div>
        </div>

        {/* Right: 4 Animated Domain Bars */}
        <div style={{ flex: 1, maxWidth: 220, display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#55544f', marginBottom: 2 }}>
            4 Säulen der Langlebigkeit:
          </div>
          {[
            { label: 'Kardiometabolik', icon: <Heart size={12} color="#0f6e56" />, val: activeProfile.domains.cardio },
            { label: 'Regeneration', icon: <Moon size={12} color="#0f6e56" />, val: activeProfile.domains.regen },
            { label: 'Aktivität', icon: <Zap size={12} color="#0f6e56" />, val: activeProfile.domains.activity },
            { label: 'Risiko-Faktoren', icon: <Shield size={12} color="#0f6e56" />, val: activeProfile.domains.risk },
          ].map((d) => (
            <div key={d.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: '#55544f', marginBottom: 2 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{d.icon} {d.label}</span>
                <strong style={{ color: '#0f6e56' }}>{d.val}%</strong>
              </div>
              <div style={{ height: 4, borderRadius: 99, background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  borderRadius: 99,
                  background: 'linear-gradient(90deg, #1d9e75, #0f6e56)',
                  width: `${d.val}%`,
                  transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Age selector pills */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12 }}>
        <span style={{ color: '#888780' }}>Pass-Alter ändern:</span>
        {[24, 30, 42, 55].map((age) => (
          <button
            key={age}
            type="button"
            onClick={() => setUserAge(age)}
            style={{
              padding: '4px 10px',
              borderRadius: 99,
              border: userAge === age ? '1px solid #0f6e56' : '1px solid rgba(0,0,0,0.1)',
              background: userAge === age ? '#0f6e56' : 'transparent',
              color: userAge === age ? '#fff' : '#55544f',
              fontSize: 11,
              fontWeight: userAge === age ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {age} Jahre
          </button>
        ))}
      </div>
    </div>
  );
}
