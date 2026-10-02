export interface ContactReason {
  id: string;
  label: string;
  shortLabel: string;
  badge: string;
  subject: string;
  companyLabel: string;
  companyPlaceholder: string;
  companyRequired: boolean;
  emailLabel: string;
  messagePlaceholder: string;
  btnText: string;
}

export const CONTACT_REASONS: ContactReason[] = [
  {
    id: 'insurer',
    label: '🏥 Krankenkasse / Kooperation',
    shortLabel: 'Krankenkasse',
    badge: 'B2B & Kassen',
    subject: 'Kooperationsanfrage Krankenkasse / Partner',
    companyLabel: 'Krankenkasse / Organisation *',
    companyPlaceholder: 'z.B. Techniker Krankenkasse, Barmer, BKK...',
    companyRequired: true,
    emailLabel: 'Geschäftliche E-Mail-Adresse *',
    messagePlaceholder: 'Beschreiben Sie kurz Ihre Organisation sowie Kooperations- oder Anbindungswünsche...',
    btnText: 'Erstkontakt anfordern',
  },
  {
    id: 'feedback',
    label: '💡 Allgemein & Score-Feedback',
    shortLabel: 'Feedback & Hebel',
    badge: 'Community',
    subject: 'Feedback zu den Score-Hebel-Berechnungen & Biomarkern',
    companyLabel: 'Organisation / Firma (optional)',
    companyPlaceholder: 'Optional: Unternehmen, Hochschule oder privat',
    companyRequired: false,
    emailLabel: 'Deine E-Mail-Adresse *',
    messagePlaceholder: 'Dein Feedback, Anmerkungen zum Algorithmus oder Feature-Ideen...',
    btnText: 'Feedback absenden →',
  },
  {
    id: 'research',
    label: '🎓 DHBW-Forschung & Wissenschaft',
    shortLabel: 'Forschung',
    badge: 'Wissenschaft',
    subject: 'Frage zum DHBW-Forschungsprojekt & wissenschaftlichen Kurven',
    companyLabel: 'Hochschule / Institut (optional)',
    companyPlaceholder: 'z.B. DHBW Mannheim, Universität...',
    companyRequired: false,
    emailLabel: 'Deine E-Mail-Adresse *',
    messagePlaceholder: 'Deine Fragen zur Methodik oder wissenschaftlichen Zusammenarbeit...',
    btnText: 'Forschungsanfrage absenden →',
  },
  {
    id: 'general',
    label: '💬 Sonstiges / Hallo',
    shortLabel: 'Allgemein',
    badge: 'Kennenlernen',
    subject: 'Hallo an das LONGEVITY-Team',
    companyLabel: 'Organisation (optional)',
    companyPlaceholder: 'Optional',
    companyRequired: false,
    emailLabel: 'Deine E-Mail-Adresse *',
    messagePlaceholder: 'Deine Nachricht an das Team...',
    btnText: 'Nachricht absenden →',
  },
];
