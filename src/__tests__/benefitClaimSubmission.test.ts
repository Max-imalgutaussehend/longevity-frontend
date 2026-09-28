import { describe, it, expect } from 'vitest';
import { getClaimAction } from '../routes/Vorteile.js';

describe('Issue #87: direct benefit claim submission (getClaimAction)', () => {
  it('shows nothing for an unqualified offer', () => {
    expect(getClaimAction({ qualified: false, organizationId: 'org-1', claimStatus: null })).toEqual({ kind: 'none' });
  });

  it('falls back to the share-link flow for offers without an organization', () => {
    expect(getClaimAction({ qualified: true, organizationId: null, claimStatus: null })).toEqual({ kind: 'share-link' });
    expect(getClaimAction({ qualified: true, organizationId: undefined, claimStatus: null })).toEqual({ kind: 'share-link' });
  });

  it('offers a submit button when qualified, org-backed, and never claimed', () => {
    expect(getClaimAction({ qualified: true, organizationId: 'org-1', claimStatus: null })).toEqual({
      kind: 'submit',
      label: 'Bei Krankenkasse einreichen',
    });
    expect(getClaimAction({ qualified: true, organizationId: 'org-1', claimStatus: undefined })).toEqual({
      kind: 'submit',
      label: 'Bei Krankenkasse einreichen',
    });
  });

  it('shows a submitted status while the claim is pending review', () => {
    expect(getClaimAction({ qualified: true, organizationId: 'org-1', claimStatus: 'submitted' })).toEqual({
      kind: 'status',
      label: 'submitted',
    });
  });

  it('shows an accepted status once the insurer approves the claim', () => {
    expect(getClaimAction({ qualified: true, organizationId: 'org-1', claimStatus: 'accepted' })).toEqual({
      kind: 'status',
      label: 'accepted',
    });
  });

  it('allows resubmission after a claim was rejected', () => {
    expect(getClaimAction({ qualified: true, organizationId: 'org-1', claimStatus: 'rejected' })).toEqual({
      kind: 'submit',
      label: 'Erneut einreichen',
    });
  });
});
