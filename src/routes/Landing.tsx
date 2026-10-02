import { useState } from 'react';
import { useScrollReveal } from './landing/landingUtils.js';
import { CursorSpotlight } from './landing/CursorSpotlight.js';
import { LandingHero } from './landing/LandingHero.js';
import { LandingProduct } from './landing/LandingProduct.js';
import { LandingFeatures } from './landing/LandingFeatures.js';
import { LandingSimulator } from './landing/LandingSimulator.js';
import { LandingDataPrivacy } from './landing/LandingDataPrivacy.js';
import { LandingB2B } from './landing/LandingB2B.js';
import { LandingTeamAndContact } from './landing/LandingTeamAndContact.js';
import { LandingCtaBanner } from './landing/LandingCtaBanner.js';

/**
 * Top-level Landing page orchestrator.
 * Decomposed into self-contained section components under `./landing/`.
 */
export function Component() {
  useScrollReveal();
  const [selectedReasonId, setSelectedReasonId] = useState<string>('insurer');

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectTopicAndScroll = (reasonId: string) => {
    setSelectedReasonId(reasonId);
    scrollTo('kontakt');
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <CursorSpotlight />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
        <LandingHero onExploreClick={() => scrollTo('produkt')} />
        <LandingProduct />
        <LandingFeatures />
        <LandingSimulator />
        <LandingDataPrivacy />
        <LandingB2B onSelectTopicAndScroll={handleSelectTopicAndScroll} />
        <LandingTeamAndContact
          selectedReasonId={selectedReasonId}
          onSelectReasonId={setSelectedReasonId}
        />
        <LandingCtaBanner />
      </div>
    </div>
  );
}

export { Component as Landing };
export default Component;
