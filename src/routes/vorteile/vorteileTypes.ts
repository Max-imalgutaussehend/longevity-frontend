import type { PartnerOffer, UserClaim, ClaimReceipt } from '../../api/types.js';

export type { PartnerOffer, UserClaim, ClaimReceipt };

export type BenefitTab = 'available' | 'my-claims';

export type ClaimStatus = 'submitted' | 'accepted' | 'rejected' | null;

export interface KassenInfo {
  score: number;
  bandLow: number;
}
