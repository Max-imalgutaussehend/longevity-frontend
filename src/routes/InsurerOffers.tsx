import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import { Card, PageTitle, Btn, GlassInput, FieldLabel, Modal, Skeleton } from '../components/ui.js';

interface Offer {
  id: string;
  title: string;
  description: string;
  minBand: number;
  valueLabel: string;
  validFrom: string | null;
  validUntil: string | null;
}

interface OfferFormState {
  title: string;
  description: string;
  minBand: string;
  valueLabel: string;
  validFrom: string;
  validUntil: string;
}

const EMPTY_FORM: OfferFormState = { title: '', description: '', minBand: '', valueLabel: '', validFrom: '', validUntil: '' };

function toOfferBody(form: OfferFormState) {
  return {
    title: form.title,
    description: form.description,
    minBand: Number(form.minBand),
    valueLabel: form.valueLabel,
    validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : null,
    validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : null,
  };
}

export function Component() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<OfferFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const { data: offers, isLoading } = useQuery<Offer[]>({
    queryKey: ['insurer-offers'],
    queryFn: () => apiClient('/insurer/offers'),
  });

  const createMut = useMutation({
    mutationFn: () => apiClient('/insurer/offers', { method: 'POST', body: JSON.stringify(toOfferBody(form)) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['insurer-offers'] }); closeForm(); },
    onError: (err: unknown) => setError((err as Error).message ?? 'Angebot konnte nicht erstellt werden.'),
  });

  const updateMut = useMutation({
    mutationFn: () => apiClient(`/insurer/offers/${editingId}`, { method: 'PATCH', body: JSON.stringify(toOfferBody(form)) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['insurer-offers'] }); closeForm(); },
    onError: (err: unknown) => setError((err as Error).message ?? 'Angebot konnte nicht aktualisiert werden.'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiClient(`/insurer/offers/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['insurer-offers'] }),
  });

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  }

  function openEdit(offer: Offer) {
    setEditingId(offer.id);
    setForm({
      title: offer.title,
      description: offer.description,
      minBand: String(offer.minBand),
      valueLabel: offer.valueLabel,
      validFrom: offer.validFrom ? offer.validFrom.slice(0, 10) : '',
      validUntil: offer.validUntil ? offer.validUntil.slice(0, 10) : '',
    });
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const minBandNum = Number(form.minBand);
    if (!form.title || !form.description || !form.valueLabel || form.minBand === '' || Number.isNaN(minBandNum)) {
      setError('Bitte alle Pflichtfelder ausfüllen.');
      return;
    }
    if (minBandNum < 0 || minBandNum > 100) {
      setError('Mindest-Score-Band muss zwischen 0 und 100 liegen.');
      return;
    }
    if (editingId) updateMut.mutate();
    else createMut.mutate();
  }

  const isExpired = (offer: Offer) => offer.validUntil && new Date(offer.validUntil) < new Date();

  return (
    <div>
      <PageTitle title="Vorteile" sub="Eigene Angebote für Mitglieder verwalten" />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Btn onClick={openCreate} testId="offer-create-open">+ Neues Angebot</Btn>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gap: 12 }}>
          <Skeleton height={80} />
          <Skeleton height={80} />
        </div>
      ) : offers && offers.length > 0 ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {offers.map((offer) => (
            <Card key={offer.id} style={{ padding: 20 }} data-testid={`offer-row-${offer.id}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: '#22221f' }}>
                    {offer.title}
                    {isExpired(offer) && (
                      <span style={{ marginLeft: 8, fontSize: 11, color: '#a32d2d', fontWeight: 400 }}>· abgelaufen</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: '#55544f', marginTop: 4 }}>{offer.description}</div>
                  <div style={{ fontSize: 12, color: '#888780', marginTop: 8 }}>
                    Ab Score-Band {offer.minBand} · {offer.valueLabel}
                    {offer.validUntil && ` · gültig bis ${new Date(offer.validUntil).toLocaleDateString('de-DE')}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Btn small variant="secondary" onClick={() => openEdit(offer)} testId={`offer-edit-${offer.id}`}>Bearbeiten</Btn>
                  <Btn small variant="danger" onClick={() => deleteMut.mutate(offer.id)} testId={`offer-delete-${offer.id}`}>Löschen</Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card style={{ padding: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#888780', margin: 0 }}>Noch keine Angebote angelegt.</p>
        </Card>
      )}

      {showForm && (
        <Modal onClose={closeForm}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f' }}>
                {editingId ? 'Angebot bearbeiten' : 'Neues Angebot'}
              </div>
              <div>
                <FieldLabel>Titel</FieldLabel>
                <GlassInput value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} testId="offer-title" name="title" />
              </div>
              <div>
                <FieldLabel>Beschreibung</FieldLabel>
                <GlassInput value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} testId="offer-description" name="description" />
              </div>
              <div>
                <FieldLabel>Mindest-Score-Band (0–100)</FieldLabel>
                <GlassInput type="text" value={form.minBand} onChange={(v) => setForm((f) => ({ ...f, minBand: v.replace(/[^0-9]/g, '') }))} testId="offer-min-band" name="minBand" />
              </div>
              <div>
                <FieldLabel>Vorteil (z.B. "15% Rabatt")</FieldLabel>
                <GlassInput value={form.valueLabel} onChange={(v) => setForm((f) => ({ ...f, valueLabel: v }))} testId="offer-value-label" name="valueLabel" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <FieldLabel>Gültig ab (optional)</FieldLabel>
                  <GlassInput type="date" value={form.validFrom} onChange={(v) => setForm((f) => ({ ...f, validFrom: v }))} testId="offer-valid-from" name="validFrom" />
                </div>
                <div>
                  <FieldLabel>Gültig bis (optional)</FieldLabel>
                  <GlassInput type="date" value={form.validUntil} onChange={(v) => setForm((f) => ({ ...f, validUntil: v }))} testId="offer-valid-until" name="validUntil" />
                </div>
              </div>
              {error && <p data-testid="offer-error" style={{ color: '#a32d2d', fontSize: 13, margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Btn variant="ghost" onClick={closeForm}>Abbrechen</Btn>
                <Btn type="submit" testId="offer-submit" disabled={createMut.isPending || updateMut.isPending}>
                  {createMut.isPending || updateMut.isPending ? 'Speichern…' : editingId ? 'Speichern' : 'Erstellen'}
                </Btn>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
