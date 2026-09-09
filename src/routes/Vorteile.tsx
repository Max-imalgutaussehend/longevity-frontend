import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client.js';
import { Card, PageTitle, Chip, Skeleton } from '../components/ui.js';
import type { ScoreResult } from '../api/types.js';

interface PartnerOffer {
  id: string; partnerName: string; title: string; description: string;
  minBand: number; valueLabel: string; isDemo: boolean; qualified: boolean;
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <PageTitle title="Vorteile" />
        {score && (
          <div style={{ marginBottom: 40 }}>
            <Chip color="teal">Band {score.band.low}–{score.band.high}</Chip>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {isLoading ? [1, 2, 3].map((i) => <Card key={i}><Skeleton height={80} /></Card>) :
          offers?.sort((a, b) => a.minBand - b.minBand).map((offer) => {
            const gap = score ? offer.minBand - score.band.low : null;
            return (
              <Card key={offer.id} style={{ opacity: offer.qualified ? 1 : 0.68 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#22221f' }}>{offer.title}</span>
                      {offer.qualified
                        ? <Chip color="green">✓ Erfüllt</Chip>
                        : gap !== null && <Chip color="neutral">Band {offer.minBand}+ · noch {gap} Pkt.</Chip>}
                    </div>
                    <div style={{ fontSize: 13, color: '#55544f' }}>{offer.description}</div>
                    <div style={{ fontSize: 11, color: '#a3a29c', marginTop: 3 }}>{offer.partnerName}</div>
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
