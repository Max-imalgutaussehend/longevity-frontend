import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import { Card, PageTitle, Btn, Chip, Skeleton } from '../components/ui.js';
import type { PartnerOffer, InsurerClaim } from '../api/types.js';
import { OfferFormModal, type OfferFormState } from './insurer/OfferFormModal.js';
import { ClaimDecideModal } from './insurer/ClaimDecideModal.js';
import { InsurerClaimsSection } from './insurer/InsurerClaimsSection.js';

const EMPTY_FORM: OfferFormState = {
  title: '', description: '', minBand: '', minMonths: '', valueLabel: '',
  validFrom: '', validUntil: '', membersOnly: true, benefitType: 'payout',
  voucherDelivery: 'email', voucherCode: '', voucherCodesText: '', partnerUrl: '',
};

export function Component() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<OfferFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [decideModal, setDecideModal] = useState<{ claim: InsurerClaim; decision: 'processing' | 'accepted' | 'rejected' } | null>(null);

  const { data: offers, isLoading: offersLoading } = useQuery<PartnerOffer[]>({
    queryKey: ['insurer-offers'],
    queryFn: () => apiClient<PartnerOffer[]>('/insurer/offers'),
  });

  const { data: claims, isLoading: claimsLoading } = useQuery<InsurerClaim[]>({
    queryKey: ['insurer-claims'],
    queryFn: () => apiClient<InsurerClaim[]>('/insurer/claims'),
  });

  const saveMut = useMutation({
    mutationFn: () => {
      const body = {
        title: form.title, description: form.description, minBand: Number(form.minBand),
        minMonths: form.minMonths.trim() !== '' ? Number(form.minMonths) : null,
        valueLabel: form.valueLabel, validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : null,
        validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : null,
        membersOnly: form.benefitType === 'payout' ? true : form.membersOnly, benefitType: form.benefitType,
        voucherDelivery: form.voucherDelivery, voucherCode: form.voucherCode || null,
        voucherCodesText: form.voucherCodesText || null, partnerUrl: form.partnerUrl || null,
      };
      return editingId
        ? apiClient(`/insurer/offers/${editingId}`, { method: 'PATCH', body: JSON.stringify(body) })
        : apiClient('/insurer/offers', { method: 'POST', body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['insurer-offers'] }); setShowForm(false); },
    onError: (err: unknown) => setError((err as Error).message ?? 'Fehler beim Speichern.'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiClient(`/insurer/offers/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['insurer-offers'] }),
  });

  const decideMut = useMutation({
    mutationFn: (payload: { decision: 'processing' | 'accepted' | 'rejected'; transactionRef?: string; note?: string; rejectionReason?: string }) =>
      apiClient(`/insurer/claims/${decideModal?.claim.id}/decide`, { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['insurer-claims'] }); setDecideModal(null); },
  });

  const openEdit = (o: PartnerOffer) => {
    setEditingId(o.id);
    setForm({
      title: o.title, description: o.description, minBand: String(o.minBand),
      minMonths: o.minMonths !== null && o.minMonths !== undefined ? String(o.minMonths) : '',
      valueLabel: o.valueLabel, validFrom: o.validFrom ? o.validFrom.slice(0, 10) : '',
      validUntil: o.validUntil ? o.validUntil.slice(0, 10) : '', membersOnly: o.membersOnly ?? true,
      benefitType: (o.benefitType as 'payout' | 'voucher' | 'certificate') || 'payout',
      voucherDelivery: (o.voucherDelivery as 'code_pool' | 'email') || 'email',
      voucherCode: o.voucherCode || '', voucherCodesText: '',
      partnerUrl: o.partnerUrl || '', availableCodesCount: o.availableCodesCount,
    });
    setError(null);
    setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <PageTitle title="Vorteile-Verwaltung" sub="Eigene Prämien & Nachweise für Mitglieder und Versicherte steuern" />
        <Btn onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setError(null); setShowForm(true); }} testId="offer-create-open">
          + Neues Angebot
        </Btn>
      </div>

      {offersLoading ? <Skeleton height={100} /> : (
        <div style={{ display: 'grid', gap: 12 }}>
          {offers?.map((o) => (
            <Card key={o.id} style={{ padding: 20 }} data-testid={`offer-row-${o.id}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#22221f' }}>{o.title}</span>
                    <Chip color={o.benefitType === 'voucher' ? 'amber' : o.benefitType === 'certificate' ? 'teal' : 'green'}>
                      {o.benefitType === 'voucher' ? (o.voucherDelivery === 'code_pool' ? 'Gutschein (Pool)' : 'Gutschein (E-Mail)') : o.benefitType === 'certificate' ? '§ 65a SGB V' : 'Geldprämie'}
                    </Chip>
                    <Chip color="neutral">{o.membersOnly ? 'Nur Mitglieder' : 'Für alle Nutzer'}</Chip>
                  </div>
                  <div style={{ fontSize: 13, color: '#55544f' }}>{o.description}</div>
                  <div style={{ fontSize: 12, color: '#888780', marginTop: 6 }}>
                    Ab Band {o.minBand} · {o.valueLabel}
                    {o.availableCodesCount !== undefined && ` · ${o.availableCodesCount} Codes frei`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Btn small variant="secondary" onClick={() => openEdit(o)} testId={`offer-edit-${o.id}`}>Bearbeiten</Btn>
                  <Btn small variant="danger" onClick={() => deleteMut.mutate(o.id)} testId={`offer-delete-${o.id}`}>Löschen</Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <InsurerClaimsSection
        claims={claims}
        claimsLoading={claimsLoading}
        onDecide={(claim, decision) => setDecideModal({ claim, decision })}
      />

      <OfferFormModal isOpen={showForm} onClose={() => setShowForm(false)} editingId={editingId} form={form} setForm={setForm} onSubmit={(e) => { e.preventDefault(); saveMut.mutate(); }} error={error} isPending={saveMut.isPending} />
      {decideModal && <ClaimDecideModal isOpen={Boolean(decideModal)} onClose={() => setDecideModal(null)} claim={decideModal.claim} decision={decideModal.decision} onConfirm={(payload) => decideMut.mutate(payload)} isPending={decideMut.isPending} />}
    </div>
  );
}

export { Component as InsurerOffers };
export default Component;
