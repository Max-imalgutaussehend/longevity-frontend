
export interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
}

export type Archetype = 'athletic' | 'balanced' | 'starter';

export interface ArchetypeProfile {
  id: Archetype;
  label: string;
  iconName: 'activity' | 'sparkles' | 'briefcase';
  desc: string;
  targetScore: number;
  domains: { cardio: number; regen: number; activity: number; risk: number };
}

export const ARCHETYPES: ArchetypeProfile[] = [
  {
    id: 'athletic',
    label: 'Sportlich & Aktiv',
    iconName: 'activity',
    desc: '10.000 Schritte, 2x Zone-2 & 8h Schlaf',
    targetScore: 84,
    domains: { cardio: 88, regen: 82, activity: 92, risk: 85 },
  },
  {
    id: 'balanced',
    label: 'Ausgeglichen',
    iconName: 'sparkles',
    desc: '7.500 Schritte, moderate Bewegung, 7h Schlaf',
    targetScore: 71,
    domains: { cardio: 72, regen: 70, activity: 74, risk: 75 },
  },
  {
    id: 'starter',
    label: 'Startphase / Büro',
    iconName: 'briefcase',
    desc: 'Viel Sitzen, unregelmäßiger Schlaf, Neubeginn',
    targetScore: 54,
    domains: { cardio: 55, regen: 50, activity: 48, risk: 62 },
  },
];

export interface ConsentStatus {
  hasConsented: boolean;
}
