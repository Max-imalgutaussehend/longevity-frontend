import type { ComponentType } from 'react';
import type { LogoProps } from './BrandIcons.js';
import {
  AppleLogo,
  GoogleLogo,
  FitbitLogo,
  GarminLogo,
  OuraLogo,
  StravaLogo,
  WithingsLogo,
  WhoopLogo,
  PolarLogo,
} from './BrandIcons.js';

export interface BrandItem {
  id: string;
  name: string;
  category: string;
  metrics: string;
  badge: string;
  Logo: ComponentType<LogoProps>;
  accentColor: string;
}

export const SUPPORTED_BRANDS: BrandItem[] = [
  {
    id: 'apple',
    name: 'Apple Health',
    category: 'iOS & Apple Watch',
    metrics: 'Schritte · Puls · HRV · Schlaf · VO2max',
    badge: 'Direkt-Import & Cloud',
    Logo: AppleLogo,
    accentColor: '#1d1d1f',
  },
  {
    id: 'google',
    name: 'Google Health & Fit',
    category: 'Android, Wear OS & Health Connect',
    metrics: 'Schritte · Ruhepuls · Schlaf · Aktivminuten',
    badge: 'Cloud Sync (OAuth)',
    Logo: GoogleLogo,
    accentColor: '#4285F4',
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    category: 'Smartwatches & Fitness-Tracker',
    metrics: 'Tagesaktivität · Pulszonen · Schlafanalyse',
    badge: 'Health Connect & Google',
    Logo: FitbitLogo,
    accentColor: '#00B0B9',
  },
  {
    id: 'garmin',
    name: 'Garmin',
    category: 'Sportuhren & Performance Wearables',
    metrics: 'VO2max · Herzfrequenz · Trainingsbelastung',
    badge: 'Connect Sync',
    Logo: GarminLogo,
    accentColor: '#007CC3',
  },
  {
    id: 'oura',
    name: 'Oura Ring',
    category: 'Smart Rings & Erholung',
    metrics: 'Sleep Score · Readiness · HRV-Trends',
    badge: 'Cloud API',
    Logo: OuraLogo,
    accentColor: '#55544f',
  },
  {
    id: 'strava',
    name: 'Strava',
    category: 'Lauf- & Radsport-Plattform',
    metrics: 'Ausdauereinheiten · Zone-2-Minuten · Pace',
    badge: 'OAuth Integration',
    Logo: StravaLogo,
    accentColor: '#FC4C02',
  },
  {
    id: 'withings',
    name: 'Withings',
    category: 'Klinische Waagen & Blutdruckmessgeräte',
    metrics: 'Blutdruck · Gewicht · Gefäßalter',
    badge: 'Health Cloud',
    Logo: WithingsLogo,
    accentColor: '#0f6e56',
  },
  {
    id: 'whoop',
    name: 'Whoop',
    category: 'Performance- & Erholungs-Tracker',
    metrics: 'Strain · Recovery · Herzfrequenzvariabilität',
    badge: 'Apple Health & Connect',
    Logo: WhoopLogo,
    accentColor: '#22221f',
  },
  {
    id: 'polar',
    name: 'Polar',
    category: 'Pulsuhren & Brustgurte',
    metrics: 'Herzfrequenzgenauigkeit · Kardiotraining',
    badge: 'Health Hub',
    Logo: PolarLogo,
    accentColor: '#D0142C',
  },
];
