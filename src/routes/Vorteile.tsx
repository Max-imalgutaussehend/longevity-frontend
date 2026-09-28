import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Check, ShieldCheck } from 'lucide-react';
import { apiClient } from '../api/client.js';
import { Card, PageTitle, Chip, Skeleton } from '../components/ui.js';
import type { ScoreResult, Source } from '../api/types.js';

interface PartnerOffer {
  id: string; partnerName: string; title: string; description: string;
  minBand: number; minMonths?: number | null; valueLabel: string; isDemo: boolean;
  qualified: boolean; daysHeld?: number; daysRemaining?: number;
  verifiedOnly?: boolean;
}

export function Component() {
  const navigate = useNavigate();
  const { data: offers, isLoading } = useQuery<PartnerOffer[]>({
    queryKey: ['offers'],
    queryFn: () => apiClient<PartnerOffer[]>('/offers'),
  });
  const { data: score } = useQuery<ScoreResult>({
    queryKey: ['score', 'current'],
    queryFn: () => apiClient<ScoreResult>('/score/current'),
  });
  const { data: sources } = useQuery<Source[]>({
    queryKey: ['sources'],
    queryFn: () => apiClient<Source[]>('/sources'),
  });

  // Compute Kassen-Score (same Bayesian shrinkage as backend & Freigabe.tsx)
  const kassenBandLow = (() => {
    if (!score || !sources) return null;
    const verifiedAdapters = ['withings', 'oura', 'strava', 'google-fit', 'google-health', 'fhir'];
    const totalSamples = sources.reduce((s, src) => s + src.sampleCount, 0);
    const verifiedSamples = sources
      .filter((s) => verifiedAdapters.includes(s.adapter) && s.enabled)
      .reduce((s, src) => s + src.sampleCount, 0);
    if (totalSamples === 0) return score.band.low;
    const verifiedCoverage = verifiedSamples / totalSamples;
    const shrunk = 50 + verifiedCoverage * (score.score - 50);
    return Math.floor(shrunk / 10) * 10;
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <PageTitle title="Vorteile" />
        {score && (
          <div style={{ marginBottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <Chip color="teal">Gesamt Band {score.band.low}–{score.band.high}</Chip>
            {kassenBandLow !== null && kassenBandLow !== score.band.low && (
              <span style={{ fontSize: 11, color: '#55544f', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={11} color="#0f6e56" />
                Kassen-Band {kassenBandLow}–{kassenBandLow + 9}
              </span>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {isLoading ? [1, 2, 3].map((i) => <Card key={i}><Skeleton height={80} /></Card>) :
          offers?.sort((a, b) => a.minBand - b.minBand).map((offer) => {
            // For verifiedOnly insurer offers, qualify against kassenfähig band; otherwise personal band
            const activeBandLow = offer.verifiedOnly && kassenBandLow !== null ? kassenBandLow : score?.band.low ?? null;
            const gap = activeBandLow !== null ? offer.minBand - activeBandLow : null;
            const needsMorePoints = gap !== null && gap > 0;
            const needsHoldingTime = !offer.qualified && !needsMorePoints && (offer.daysRemaining ?? 0) > 0;

            return (
              <Card key={offer.id} style={{ opacity: offer.qualified ? 1 : 0.68 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#22221f' }}>{offer.title}</span>
                      {offer.qualified ? (
                        <Chip color="green"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Check size={12} /> Erfüllt</span></Chip>
                      ) : needsMorePoints ? (
                        <Chip color="neutral">Band {offer.minBand}+ · noch {gap} Pkt.</Chip>
                      ) : needsHoldingTime ? (
                        <Chip color="amber">Band {offer.minBand}+ · noch {offer.daysRemaining} Tage halten</Chip>
                      ) : (
                        gap !== null && <Chip color="neutral">Band {offer.minBand}+</Chip>
                      )}
                      {offer.verifiedOnly && (
                        <Chip color="teal">
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <ShieldCheck size={11} />
                            Kassen-Nachweis erforderlich
                          </span>
                        </Chip>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: '#55544f' }}>{offer.description}</div>
                    <div style={{ fontSize: 11, color: '#a3a29c', marginTop: 3 }}>
                      {offer.partnerName}
                      {offer.minMonths && offer.minMonths > 0 ? ` · Mindesthaltedauer: ${offer.minMonths} Monate` : ''}
                    </div>
                    {offer.verifiedOnly && !offer.qualified && kassenBandLow !== null && kassenBandLow < offer.minBand && (
                      <div style={{ fontSize: 11, color: '#55544f', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ShieldCheck size={11} color="#888780" />
                        Dein Kassen-Band ({kassenBandLow}–{kassenBandLow + 9}) reicht noch nicht für dieses Angebot. Verbinde mehr verifizierte Quellen.
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: 24, flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: offer.qualified ? '#0f6e56' : '#888780' }}>{offer.valueLabel}</div>
                    {offer.qualified && (
                      <button
                        onClick={() => navigate('/freigabe')}
                        style={{ fontSize: 12, color: '#0f6e56', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginTop: 4, display: 'block' }}
                      >
                        Nachweis erstellen →
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
      </div>

      {offers?.some((o) => o.isDemo) && (
        <div style={{ fontSize: 12, color: '#a3a29c', padding: '14px 18px', background: 'rgba(0,0,0,0.03)', borderRadius: 12, border: '1px solid rgba(0,0,0,0.05)' }}>
          Diese Konditionen sind Demo-Daten. Sie stellen kein verbindliches Angebot dar.
        </div>
      )}
    </div>
  );
}
