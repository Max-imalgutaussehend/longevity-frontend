import { Modal, Btn, GlassInput, FieldLabel, Toggle } from '../../components/ui.js';
import { VoucherConfigSection } from './VoucherConfigSection.js';

export interface OfferFormState {
  title: string;
  description: string;
  minBand: string;
  minMonths: string;
  valueLabel: string;
  validFrom: string;
  validUntil: string;
  membersOnly: boolean;
  benefitType: 'payout' | 'voucher' | 'certificate';
  voucherDelivery: 'code_pool' | 'email';
  voucherCode: string;
  voucherCodesText: string;
  partnerUrl: string;
  availableCodesCount?: number;
}

interface OfferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingId: string | null;
  form: OfferFormState;
  setForm: React.Dispatch<React.SetStateAction<OfferFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
  isPending: boolean;
}

export function OfferFormModal({
  isOpen,
  onClose,
  editingId,
  form,
  setForm,
  onSubmit,
  error,
  isPending,
}: OfferFormModalProps) {
  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <form onSubmit={onSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f' }}>
            {editingId ? 'Angebot bearbeiten' : 'Neues Angebot anlegen'}
          </div>

          <div>
            <FieldLabel htmlFor="offer-title">Titel</FieldLabel>
            <GlassInput id="offer-title" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} testId="offer-title" name="title" />
          </div>

          <div>
            <FieldLabel htmlFor="offer-description">Beschreibung</FieldLabel>
            <GlassInput id="offer-description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} testId="offer-description" name="description" />
          </div>

          <div>
            <FieldLabel htmlFor="offer-benefit-type">Art des Vorteils (Entscheidungshoheit der Kasse)</FieldLabel>
            <select
              id="offer-benefit-type"
              data-testid="offer-benefit-type-select"
              value={form.benefitType}
              onChange={(e) => setForm((f) => ({ ...f, benefitType: e.target.value as 'payout' | 'voucher' | 'certificate' }))}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.12)',
                background: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'inherit', color: '#22221f',
              }}
            >
              <option value="payout">Geldprämie / Auszahlung (Girokonto / Beitragsverrechnung)</option>
              <option value="voucher">Gutscheincode / Rabatt (Pool-Sofortanzeige oder E-Mail)</option>
              <option value="certificate">Kassenfähiger Nachweis (§ 65a SGB V)</option>
            </select>
          </div>

          {form.benefitType === 'voucher' && (
            <VoucherConfigSection
              voucherDelivery={form.voucherDelivery}
              onChangeDelivery={(d) => setForm((f) => ({ ...f, voucherDelivery: d }))}
              voucherCode={form.voucherCode}
              onChangeVoucherCode={(c) => setForm((f) => ({ ...f, voucherCode: c }))}
              voucherCodesText={form.voucherCodesText}
              onChangeVoucherCodesText={(t) => setForm((f) => ({ ...f, voucherCodesText: t }))}
              partnerUrl={form.partnerUrl}
              onChangePartnerUrl={(u) => setForm((f) => ({ ...f, partnerUrl: u }))}
              availableCodesCount={form.availableCodesCount}
            />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <FieldLabel htmlFor="offer-min-band">Mindest-Score-Band (0–100)</FieldLabel>
              <GlassInput id="offer-min-band" type="text" value={form.minBand} onChange={(v) => setForm((f) => ({ ...f, minBand: v.replace(/[^0-9]/g, '') }))} testId="offer-min-band" name="minBand" />
            </div>
            <div>
              <FieldLabel htmlFor="offer-min-months">Mindesthaltedauer (Monate)</FieldLabel>
              <GlassInput id="offer-min-months" type="text" value={form.minMonths} onChange={(v) => setForm((f) => ({ ...f, minMonths: v.replace(/[^0-9]/g, '') }))} placeholder="leer = 0" testId="offer-min-months" name="minMonths" />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="offer-value-label">Vorteils-Label (z. B. "100 € Prämie", "15 % Rabatt")</FieldLabel>
            <GlassInput id="offer-value-label" value={form.valueLabel} onChange={(v) => setForm((f) => ({ ...f, valueLabel: v }))} testId="offer-value-label" name="valueLabel" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <FieldLabel htmlFor="offer-valid-from">Gültig ab (optional)</FieldLabel>
              <GlassInput id="offer-valid-from" type="date" value={form.validFrom} onChange={(v) => setForm((f) => ({ ...f, validFrom: v }))} testId="offer-valid-from" name="validFrom" />
            </div>
            <div>
              <FieldLabel htmlFor="offer-valid-until">Gültig bis (optional)</FieldLabel>
              <GlassInput id="offer-valid-until" type="date" value={form.validUntil} onChange={(v) => setForm((f) => ({ ...f, validUntil: v }))} testId="offer-valid-until" name="validUntil" />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: 'rgba(0,0,0,0.03)' }}>
            <div>
              <FieldLabel htmlFor="offer-members-only">Nur für Mitglieder</FieldLabel>
              <div style={{ fontSize: 12, color: '#888780' }}>
                {form.membersOnly
                  ? 'Nur verifizierte Mitglieder Ihrer Kasse können diesen Vorteil beanspruchen.'
                  : 'Offen für alle Plattform-Nutzer (auch Nicht-Mitglieder erhalten Prämie per Girokonto / Gutschein).'}
              </div>
            </div>
            <Toggle id="offer-members-only" aria-label="Nur für Mitglieder" on={form.membersOnly} onChange={() => setForm((f) => ({ ...f, membersOnly: !f.membersOnly }))} />
          </div>

          {error && <p data-testid="offer-error" style={{ color: '#a32d2d', fontSize: 13, margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
            <Btn variant="ghost" onClick={onClose}>Abbrechen</Btn>
            <Btn type="submit" testId="offer-submit" disabled={isPending}>
              {isPending ? 'Speichern…' : editingId ? 'Speichern' : 'Angebot erstellen'}
            </Btn>
          </div>
        </div>
      </form>
    </Modal>
  );
}
