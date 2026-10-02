export interface Token {
  id: string;
  bandLow: number;
  bandHigh: number;
  issuedAt: string;
  expiresAt: string;
  revokedAt: string | null;
  partnerRef?: string | null;
  verifiedOnly?: boolean;
  trustLevel?: 'unverified' | 'cloud_verified' | 'certified_medical';
  verifiedSources?: string[];
  certificateType?: string;
}

export const VERIFIED_ADAPTERS: string[] = ['withings', 'oura', 'strava', 'google-fit', 'google-health', 'fhir'];
