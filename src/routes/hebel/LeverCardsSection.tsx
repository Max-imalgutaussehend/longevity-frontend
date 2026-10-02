import { useState } from 'react';
import { Rocket, Gem, ShieldCheck, Target, ChevronDown } from 'lucide-react';
import { Card, Chip, Skeleton, Btn } from '../../components/ui.js';
import { getMetricLabel, getMetricUnit, formatMetricValue, formatMetricUnit } from '../../lib/formatters.js';
import { getMetricEducation, METRIC_BADGE_LABELS, type MetricBadge } from '../../lib/metricEducation.js';
import { estimateBioAgeReduction, type Lever } from './hebelUtils.js';
import type { ScoreResult } from '../../api/types.js';

interface LeverCardsSectionProps {
  levers: Lever[] | undefined;
  isLoading: boolean;
  score: ScoreResult | undefined;
  focusMetric: string | null;
  onToggleFocus: (metric: string) => void;
}

const BADGE_ICON: Record<MetricBadge, typeof Rocket> = {
  'quick-win': Rocket,
  'high-impact': Gem,
  kasse: ShieldCheck,
};

const BADGE_CHIP_COLOR: Record<MetricBadge, 'amber' | 'teal' | 'green'> = {
  'quick-win': 'amber',
  'high-impact': 'teal',
  kasse: 'green',
};

export function LeverCardsSection({
  levers,
  isLoading,
  score,
  focusMetric,
  onToggleFocus,
}: LeverCardsSectionProps) {
  const [expandedLever, setExpandedLever] = useState<string | null>(null);

  return (
    <div className="responsive-grid-3">
      {isLoading ? (
        [1, 2, 3].map((i) => (
          <Card key={i}>
            <Skeleton height={140} />
          </Card>
        ))
      ) : (
        levers?.slice(0, 3).map((lever, i) => {
          const edu = getMetricEducation(lever.metric);
          const isExpanded = expandedLever === lever.metric;
          const isFocus = focusMetric === lever.metric;
          const BadgeIcon = edu ? BADGE_ICON[edu.badge] : null;
          const bioAgeReduction = score
            ? estimateBioAgeReduction(score.score, score.chronoAge, lever.delta)
            : 0;

          return (
            <Card
              key={lever.metric}
              style={{ borderTop: `3px solid ${i === 0 ? '#1d9e75' : 'rgba(0,0,0,0.08)'}` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: '#a3a29c', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Hebel {i + 1}
                </div>
                {edu && BadgeIcon && (
                  <Chip color={BADGE_CHIP_COLOR[edu.badge]}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <BadgeIcon size={11} />
                      {METRIC_BADGE_LABELS[edu.badge]}
                    </span>
                  </Chip>
                )}
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#22221f', marginBottom: 20 }}>
                {getMetricLabel(lever.metric)}
              </div>
              <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: 26, fontWeight: 500, color: '#0f6e56', letterSpacing: '-0.01em' }}>
                  +{lever.delta.toFixed(1)}
                </span>
                <span style={{ fontSize: 12, color: '#888780', marginLeft: 6 }}>
                  Punkte · {lever.horizonWeeks} Wochen
                </span>
                <div style={{ fontSize: 12, color: '#a3a29c', marginTop: 4 }}>
                  {lever.currentValue !== null ? formatMetricValue(lever.metric, lever.currentValue) : '?'} →{' '}
                  {formatMetricValue(lever.metric, lever.targetValue)}{' '}
                  {formatMetricUnit(lever.metric, getMetricUnit(lever.metric))}
                </div>
                {bioAgeReduction > 0 && (
                  <div style={{ fontSize: 12, color: '#0f6e56', marginTop: 8, fontWeight: 500 }}>
                    Potenzielle Reduktion des Vitalitätsalters: −{bioAgeReduction.toFixed(1)} Jahre
                  </div>
                )}
              </div>

              {edu && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <button
                    type="button"
                    onClick={() => setExpandedLever(isExpanded ? null : lever.metric)}
                    data-testid={`lever-action-toggle-${lever.metric}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#0f6e56',
                      fontFamily: 'inherit',
                    }}
                  >
                    Was muss ich tun?
                    <ChevronDown
                      size={14}
                      style={{ transform: isExpanded ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s' }}
                    />
                  </button>
                  {isExpanded && (
                    <p style={{ fontSize: 12, color: '#55544f', lineHeight: 1.6, marginTop: 10, marginBottom: 0 }}>
                      {edu.sampleHabit}
                    </p>
                  )}
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <Btn
                  small
                  full
                  variant={isFocus ? 'primary' : 'secondary'}
                  onClick={() => onToggleFocus(lever.metric)}
                  testId={`lever-focus-${lever.metric}`}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Target size={13} />
                    {isFocus ? 'Wochen-Fokus aktiv' : 'Als Fokus setzen'}
                  </span>
                </Btn>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
