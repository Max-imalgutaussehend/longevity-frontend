export interface CertificatePdfParams {
  partnerName: string;
  title: string;
  bandLow: number;
  bandHigh: number;
  tokenId: string;
  verifyUrl: string;
  qrUrl: string;
}

export function downloadCertificatePdf(params: CertificatePdfParams): void {
  const sanitize = (str: string) => (str || '').replace(/[()\\]/g, '');
  const dateStr = new Date().toLocaleDateString('de-DE');

  const content = [
    '0.059 0.431 0.337 rg',
    '0 760 595.28 81.89 re f',
    '1 1 1 rg',
    'BT /F2 20 Tf 40 805 Td (LONGEVITY HEALTH INTERMEDIARY) Tj ET',
    'BT /F1 11 Tf 40 782 Td (Offizieller Nachweis gemaess Paragraph 65a SGB V) Tj ET',
    '0.133 0.133 0.122 rg',
    'BT /F2 22 Tf 40 710 Td (VITALITAETSNACHWEIS) Tj ET',
    '0.333 0.329 0.310 rg',
    'BT /F1 12 Tf 40 688 Td (Bestaetigung gesundheitsbewussten Verhaltens fuer Krankenkassen) Tj ET',
    '0.85 0.85 0.85 RG 1 w 0.97 0.98 0.97 rg',
    '40 450 515.28 210 re B',
    '0.059 0.431 0.337 rg',
    `BT /F2 28 Tf 60 610 Td (Score-Band ${params.bandLow} - ${params.bandHigh}) Tj ET`,
    '0.133 0.133 0.122 rg',
    `BT /F2 12 Tf 60 575 Td (Krankenkasse: ${sanitize(params.partnerName)}) Tj ET`,
    `BT /F1 11 Tf 60 550 Td (Programm: ${sanitize(params.title)}) Tj ET`,
    `BT /F1 11 Tf 60 525 Td (Haltedauer: Mindestens 90 Tage kontinuierlich bestaetigt) Tj ET`,
    `BT /F1 11 Tf 60 500 Td (Validierung: 100% gepruefte Sensordaten - Mock-Daten ausgeschlossen) Tj ET`,
    `BT /F1 11 Tf 60 475 Td (Ausstellungsdatum: ${dateStr}) Tj ET`,
    '0.85 0.85 0.85 RG 1 w',
    '40 290 515.28 135 re S',
    '0.133 0.133 0.122 rg',
    'BT /F2 13 Tf 60 395 Td (Kryptografische Token-Verifikation) Tj ET',
    '0.333 0.329 0.310 rg',
    `BT /F1 10 Tf 60 370 Td (Token-ID: ${sanitize(params.tokenId)}) Tj ET`,
    `BT /F1 10 Tf 60 350 Td (Pruef-URL: ${sanitize(params.verifyUrl)}) Tj ET`,
    `BT /F1 10 Tf 60 330 Td (Pruefsiegel: Kryptografisch autorisiert durch LONGEVITY Ed25519) Tj ET`,
    `BT /F1 10 Tf 60 310 Td (Gueltigkeit: 12 Monate ab Ausstellungsdatum) Tj ET`,
    '0.533 0.529 0.502 rg',
    'BT /F1 9 Tf 40 200 Td (Rechtlicher Hinweis:) Tj ET',
    'BT /F1 9 Tf 40 185 Td (Dieser Nachweis dient zur Vorlage bei der Krankenkasse fuer Boni gemaess Paragraph 65a SGB V.) Tj ET',
    'BT /F1 9 Tf 40 170 Td (LONGEVITY uebermittelt keinerlei medizinische Rohdaten, sondern bestaetigt ausschliesslich) Tj ET',
    'BT /F1 9 Tf 40 155 Td (das erreichte Qualitaetsband auf Basis faelschungssicherer Wearable- und Labormessungen.) Tj ET',
    'BT /F2 9 Tf 40 125 Td (LONGEVITY Health Intermediary - www.longevity.app) Tj ET',
  ].join('\n');

  const encoder = new TextEncoder();
  const streamBytes = encoder.encode(content);
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>',
    `<< /Length ${streamBytes.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  ];

  let out = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(encoder.encode(out).length);
    out += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = encoder.encode(out).length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    out += `${String(off).padStart(10, '0')} 00000 n \n`;
  }
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([encoder.encode(out)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Longevity-Nachweis-SGB-V-${params.bandLow}-${params.bandHigh}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
