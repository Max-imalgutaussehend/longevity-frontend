import type { PartnerOffer } from '../../api/types.js';

export function calculatePointsGap(minBand: number, score: number | null | undefined): string | null {
  if (score === null || score === undefined) return null;
  const diff = minBand - score;
  return diff <= 0 ? null : diff.toFixed(1);
}

export type ClaimAction =
  | { kind: 'none' }
  | { kind: 'share-link' }
  | { kind: 'submit'; label: string }
  | { kind: 'status'; label: string };

export function getClaimAction(offer: Pick<PartnerOffer, 'qualified' | 'organizationId' | 'claimStatus'>): ClaimAction {
  if (!offer.qualified) return { kind: 'none' };
  if (!offer.organizationId) return { kind: 'share-link' };
  if (offer.claimStatus === 'submitted') return { kind: 'status', label: 'submitted' };
  if (offer.claimStatus === 'processing') return { kind: 'status', label: 'processing' };
  if (offer.claimStatus === 'accepted') return { kind: 'status', label: 'accepted' };
  if (offer.claimStatus === 'rejected') return { kind: 'submit', label: 'Erneut einreichen' };
  return { kind: 'submit', label: 'Bei Krankenkasse einreichen' };
}

