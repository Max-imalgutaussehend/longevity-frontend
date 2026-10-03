import type { CertificatePdfParams } from './certificatePdfBuilder.js';

export function printCleanCertificate(params: CertificatePdfParams): void {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const dateStr = new Date().toLocaleDateString('de-DE');
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="utf-8">
      <title>Kassen-Nachweis § 65a SGB V</title>
      <style>
        @page { size: A4 portrait; margin: 16mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #22221f; margin: 0; padding: 20px; line-height: 1.5; background: #fff; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f6e56; padding-bottom: 16px; margin-bottom: 24px; }
        .logo { font-size: 20px; font-weight: 700; color: #0f6e56; letter-spacing: 0.05em; }
        .sublogo { font-size: 11px; color: #55544f; }
        .badge { background: rgba(29,158,117,0.1); color: #0f6e56; border: 1px solid rgba(29,158,117,0.3); padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 600; }
        .title { font-size: 24px; font-weight: 700; margin: 0 0 6px 0; color: #1d2c25; }
        .subtitle { font-size: 13px; color: #55544f; margin-bottom: 24px; }
        .card { border: 1px solid #1d9e75; background: rgba(29,158,117,0.03); border-radius: 12px; padding: 24px; margin-bottom: 24px; }
        .score-band { font-size: 32px; font-weight: 700; color: #0f6e56; margin-bottom: 12px; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; }
        .verification { display: flex; gap: 20px; align-items: center; border: 1px dashed rgba(0,0,0,0.2); padding: 16px; border-radius: 10px; margin-bottom: 24px; }
        .qr { width: 100px; height: 100px; border: 1px solid #eee; padding: 4px; border-radius: 8px; }
        .token-info { font-size: 11px; color: #55544f; font-family: monospace; }
        .legal { font-size: 10px; color: #888780; border-top: 1px solid #eee; padding-top: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">LONGEVITY HEALTH INTERMEDIARY</div>
          <div class="sublogo">Offizieller Nachweis gemäß § 65a SGB V</div>
        </div>
        <div class="badge">Kryptografisch Verifiziert ✓</div>
      </div>
      <h1 class="title">VITALITÄTSNACHWEIS</h1>
      <div class="subtitle">Bestätigung gesundheitsbewussten Verhaltens für Krankenkassen-Bonusprogramme</div>
      <div class="card">
        <div class="score-band">Band ${params.bandLow} – ${params.bandHigh}</div>
        <div class="details-grid">
          <div><strong>Krankenkasse:</strong> ${params.partnerName}</div>
          <div><strong>Programm:</strong> ${params.title}</div>
          <div><strong>Haltedauer:</strong> Mind. 90 Tage erfüllt</div>
          <div><strong>Validierung:</strong> 100% verifizierte Sensordaten</div>
          <div><strong>Ausstellungsdatum:</strong> ${dateStr}</div>
          <div><strong>Ausschluss:</strong> Mock- und manuelle Daten ausgeschlossen</div>
        </div>
      </div>
      <div class="verification">
        <img src="${params.qrUrl}" alt="QR-Code" class="qr">
        <div>
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 4px;">Kryptografische Token-Verifikation</div>
          <div class="token-info">Token-ID: ${params.tokenId}</div>
          <div class="token-info" style="margin-top: 4px;">Prüf-URL: ${params.verifyUrl}</div>
          <div style="font-size: 11px; color: #0f6e56; margin-top: 6px;">Signatur: Ed25519-Siegel von LONGEVITY autorisiert</div>
        </div>
      </div>
      <div class="legal">
        Dieser Nachweis dient zur Vorlage bei der zuständigen Krankenkasse zur Erlangung von Bonuszahlungen und Wahltarifen gemäß § 65a SGB V. LONGEVITY übermittelt keinerlei medizinische Rohdaten, sondern bestätigt ausschließlich das erreichte Qualitätsband auf Basis fälschungssicherer Wearable- und Labormessungen.
      </div>
    </body>
    </html>
  `);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
  }, 400);
}
