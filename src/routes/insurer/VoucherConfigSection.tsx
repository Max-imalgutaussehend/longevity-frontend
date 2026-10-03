import { FieldLabel, GlassInput } from '../../components/ui.js';

interface VoucherConfigSectionProps {
  voucherDelivery: 'code_pool' | 'email';
  onChangeDelivery: (d: 'code_pool' | 'email') => void;
  voucherCode: string;
  onChangeVoucherCode: (code: string) => void;
  voucherCodesText: string;
  onChangeVoucherCodesText: (text: string) => void;
  partnerUrl: string;
  onChangePartnerUrl: (url: string) => void;
  availableCodesCount?: number;
}

export function VoucherConfigSection({
  voucherDelivery,
  onChangeDelivery,
  voucherCode,
  onChangeVoucherCode,
  voucherCodesText,
  onChangeVoucherCodesText,
  partnerUrl,
  onChangePartnerUrl,
  availableCodesCount,
}: VoucherConfigSectionProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 14px', borderRadius: 12, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)' }}>
      <div>
        <FieldLabel>Bereitstellung des Gutscheins</FieldLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', background: voucherDelivery === 'code_pool' ? 'rgba(29,158,117,0.08)' : 'rgba(255,255,255,0.4)', fontSize: 12 }}>
            <input type="radio" name="voucherDelivery" checked={voucherDelivery === 'code_pool'} onChange={() => onChangeDelivery('code_pool')} data-testid="delivery-code-pool-radio" />
            <div>
              <strong>Code-Pool (Sofort)</strong>
              <div style={{ color: '#888780', fontSize: 11 }}>Automatische Zuteilung</div>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', background: voucherDelivery === 'email' ? 'rgba(29,158,117,0.08)' : 'rgba(255,255,255,0.4)', fontSize: 12 }}>
            <input type="radio" name="voucherDelivery" checked={voucherDelivery === 'email'} onChange={() => onChangeDelivery('email')} data-testid="delivery-email-radio" />
            <div>
              <strong>Per E-Mail</strong>
              <div style={{ color: '#888780', fontSize: 11 }}>Partner / Kasse versendet</div>
            </div>
          </label>
        </div>
      </div>

      {voucherDelivery === 'code_pool' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {availableCodesCount !== undefined && (
            <div style={{ fontSize: 11, color: '#0f6e56' }}>
              Aktuell verfügbarer Pool: <strong>{availableCodesCount} Codes</strong>
            </div>
          )}
          <div>
            <FieldLabel htmlFor="offer-voucher-codes-text">Gutscheincodes importieren (Mehrfach-Upload)</FieldLabel>
            <textarea
              id="offer-voucher-codes-text"
              data-testid="offer-voucher-codes-input"
              rows={3}
              placeholder="PROMO-001&#10;PROMO-002&#10;oder kommagetrennt"
              value={voucherCodesText}
              onChange={(e) => onChangeVoucherCodesText(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', background: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'monospace' }}
            />
          </div>
          <div>
            <FieldLabel htmlFor="offer-voucher-code">Fallback Promo-Code (optional)</FieldLabel>
            <GlassInput id="offer-voucher-code" placeholder="z. B. GENERAL-2026" value={voucherCode} onChange={onChangeVoucherCode} testId="offer-voucher-code" />
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 11, color: '#55544f', background: 'rgba(29,158,117,0.05)', padding: '8px 10px', borderRadius: 8 }}>
          Nutzer fordern den Gutschein mit ihrer E-Mail an. Anträge erscheinen in Ihrer Prüfungsliste, wo Sie die Zustellung steuern und bestätigen können.
        </div>
      )}

      <div>
        <FieldLabel htmlFor="offer-partner-url">Partnershop-URL (optional)</FieldLabel>
        <GlassInput id="offer-partner-url" placeholder="https://..." value={partnerUrl} onChange={onChangePartnerUrl} testId="offer-partner-url" />
      </div>
    </div>
  );
}
