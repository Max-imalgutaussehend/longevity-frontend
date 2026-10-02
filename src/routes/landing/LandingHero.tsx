import { useRef } from 'react';
import { Link } from 'react-router-dom';
import heroVideo from '../../assets/hero-video.mp4';
import { Btn } from '../../components/ui.js';
import { BrandLogosRibbon } from '../../components/BrandLogos.js';
import { APP_ROUTES } from '../../lib/routes.js';

interface LandingHeroProps {
  user?: { id: string } | null;
  onExploreClick: () => void;
}

export function LandingHero({ user, onExploreClick }: LandingHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <>
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

          <Link
            to={user ? APP_ROUTES.dashboard : APP_ROUTES.login(APP_ROUTES.dashboard)}
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
            onClick={onExploreClick}
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

      <BrandLogosRibbon />
    </>
  );
}
