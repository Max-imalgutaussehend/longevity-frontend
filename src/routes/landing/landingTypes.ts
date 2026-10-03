export interface ContactReason {
  id: string;
  label: string;
  subject: string;
  companyLabel: string;
  companyPlaceholder: string;
  companyRequired: boolean;
  emailLabel: string;
  messagePlaceholder: string;
}

export const CONTACT_REASONS: ContactReason[] = [
  {
    id: 'insurer',
    label: 'Krankenkasse & Kooperation',
    subject: 'Kooperationsanfrage Krankenkasse / Partner',
    companyLabel: 'Krankenkasse / Organisation *',
    companyPlaceholder: 'z. B. Techniker Krankenkasse, Barmer, BKK...',
    companyRequired: true,
    emailLabel: 'Geschäftliche E-Mail-Adresse *',
    messagePlaceholder: 'Beschreiben Sie kurz Ihre Organisation sowie Kooperations- oder Anbindungswünsche...',
  },
  {
    id: 'feedback',
    label: 'Feedback & Anregungen',
    subject: 'Feedback zu LONGEVITY',
    companyLabel: 'Organisation / Hochschule (optional)',
    companyPlaceholder: 'Optional: Unternehmen, Hochschule oder privat',
    companyRequired: false,
    emailLabel: 'E-Mail-Adresse *',
    messagePlaceholder: 'Dein Feedback, Anmerkungen zum Algorithmus oder Feature-Ideen...',
  },
  {
    id: 'research',
    label: 'Forschung & DHBW',
    subject: 'Forschungsanfrage DHBW',
    companyLabel: 'Hochschule / Institut (optional)',
    companyPlaceholder: 'z. B. DHBW Mannheim, Universität...',
    companyRequired: false,
    emailLabel: 'E-Mail-Adresse *',
    messagePlaceholder: 'Deine Fragen zur Methodik oder wissenschaftlichen Zusammenarbeit...',
  },
  {
    id: 'general',
    label: 'Allgemeine Anfrage',
    subject: 'Allgemeine Nachricht',
    companyLabel: 'Organisation (optional)',
    companyPlaceholder: 'Optional',
    companyRequired: false,
    emailLabel: 'E-Mail-Adresse *',
    messagePlaceholder: 'Deine Nachricht an das Team...',
  },
];
