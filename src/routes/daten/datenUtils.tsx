import React from 'react';
import {
  Footprints,
  Heart,
  Moon,
  Clock,
  TrendingUp,
  Zap,
  Wind,
  Stethoscope,
  FlaskConical,
  Droplet,
  Ruler,
  Dumbbell,
  CigaretteOff,
  Wine,
  Microscope,
  Bot,
  CircleDot,
  Activity,
  Scale,
  Smartphone,
  Pencil,
  FileText,
  MapPin,
  BarChart3,
} from 'lucide-react';
import { AppleLogo } from '../../components/BrandLogos.js';
import type { Source } from '../../api/types.js';
import { LIFESTYLE_FIELDS, type LifestyleField, type SourceSyncStatusInfo } from './datenTypes.js';

export function renderMetricIcon(metric: string, size = 18): React.ReactNode {
  switch (metric) {
    case 'steps': return <Footprints size={size} color="#0f6e56" />;
    case 'resting_hr': return <Heart size={size} color="#a32d2d" />;
    case 'sleep_duration': return <Moon size={size} color="#3b82f6" />;
    case 'sleep_consistency': return <Clock size={size} color="#3b82f6" />;
    case 'hrv_rmssd': return <TrendingUp size={size} color="#1d9e75" />;
    case 'zone2_minutes': return <Zap size={size} color="#f59e0b" />;
    case 'vo2max': return <Wind size={size} color="#0f6e56" />;
    case 'systolic_bp': return <Stethoscope size={size} color="#a32d2d" />;
    case 'ldl':
    case 'hdl': return <FlaskConical size={size} color="#8b5cf6" />;
    case 'hba1c': return <Droplet size={size} color="#a32d2d" />;
    case 'waist': return <Ruler size={size} color="#854f0b" />;
    case 'strength_sessions': return <Dumbbell size={size} color="#0f6e56" />;
    case 'smoking': return <CigaretteOff size={size} color="#55544f" />;
    case 'alcohol_units': return <Wine size={size} color="#854f0b" />;
    case 'hscrp': return <Microscope size={size} color="#8b5cf6" />;
    default: return <BarChart3 size={size} color="#55544f" />;
  }
}

export function renderSourceIcon(sourceKind: string, size = 16): React.ReactNode {
  switch (sourceKind) {
    case 'google_fit': return <Bot size={size} />;
    case 'apple_health': return <AppleLogo size={size} color="#0f6e56" />;
    case 'oura': return <CircleDot size={size} />;
    case 'strava': return <Activity size={size} />;
    case 'withings': return <Scale size={size} />;
    case 'health_auto_export': return <Smartphone size={size} />;
    case 'lab': return <FlaskConical size={size} />;
    case 'manual': return <Pencil size={size} />;
    case 'questionnaire': return <FileText size={size} />;
    default: return <MapPin size={size} />;
  }
}

export function formatMetricVal(metric: string, val: number): string {
  if (metric === 'steps') return Math.round(val).toLocaleString('de-DE');
  if (metric === 'sleep_duration' || metric === 'vo2max') return val.toFixed(1);
  if (metric === 'resting_hr' || metric === 'systolic_bp') return Math.round(val).toString();
  return Number.isInteger(val) ? val.toString() : val.toFixed(1);
}

export function daysAgoLabel(days: number | null): string | null {
  if (days === null) return null;
  if (days < 1) return 'Heute eingetragen';
  if (days < 2) return 'Vor 1 Tag eingetragen';
  return `Vor ${Math.round(days)} Tagen eingetragen`;
}

export function formatDate(isoString?: string | null): string {
  if (!isoString) return 'Noch nie';
  try {
    return new Intl.DateTimeFormat('de-DE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

export function getSourceSyncStatusInfo(
  src: Source | undefined,
  defaultReadyLabel = 'Bereit',
): SourceSyncStatusInfo {
  if (!src) {
    return {
      status: 'ready',
      badgeLabel: defaultReadyLabel,
      badgeColor: 'neutral',
      isTokenExpired: false,
      isError: false,
      isConnected: false,
      needsReconnect: false,
    };
  }

  const sampleCount = src.sampleCount ?? 0;
  const isMock = src.adapter === 'mock';
  const isConnected = !!(src.connected ?? (isMock || false));
  const isEnabled = src.enabled;
  const syncStatus = src.syncStatus;

  if (syncStatus === 'token_expired' || (!isConnected && sampleCount > 0 && !isMock)) {
    return {
      status: 'token_expired',
      badgeLabel: 'Token abgelaufen',
      badgeColor: 'amber',
      isTokenExpired: true,
      isError: false,
      isConnected: false,
      needsReconnect: true,
    };
  }

  if (syncStatus === 'error') {
    return {
      status: 'error',
      badgeLabel: 'Sync-Fehler',
      badgeColor: 'red',
      isTokenExpired: false,
      isError: true,
      isConnected,
      needsReconnect: true,
    };
  }

  if (isConnected) {
    if (!isEnabled) {
      return {
        status: 'paused',
        badgeLabel: `Deaktiviert${sampleCount > 0 ? ` (${sampleCount} pausiert)` : ''}`,
        badgeColor: 'neutral',
        isTokenExpired: false,
        isError: false,
        isConnected: true,
        needsReconnect: false,
      };
    }

    return {
      status: 'ok',
      badgeLabel: isMock
        ? `Mock-Daten aktiv${sampleCount > 0 ? ` (${sampleCount})` : ''}`
        : `Verbunden${sampleCount > 0 ? ` (${sampleCount})` : ''}`,
      badgeColor: isMock ? 'amber' : 'teal',
      isTokenExpired: false,
      isError: false,
      isConnected: true,
      needsReconnect: false,
    };
  }

  return {
    status: 'ready',
    badgeLabel: defaultReadyLabel,
    badgeColor: 'neutral',
    isTokenExpired: false,
    isError: false,
    isConnected: false,
    needsReconnect: false,
  };
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // If timestamp is in the future (e.g. UTC end-of-day) or within the last minute
  if (diffMs <= 60 * 1000) {
    return 'Heute';
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 60) {
    return `Vor ${diffMinutes} Min.`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    const isSameDay =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();
    if (isSameDay) {
      return diffHours === 1 ? 'Vor 1 Std.' : `Vor ${diffHours} Std.`;
    }
    return 'Gestern';
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays <= 1) return 'Gestern';
  if (diffDays < 7) return `Vor ${diffDays} Tagen`;
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

export interface LifestyleValidationResult {
  error: string | null;
  values: Array<{ metric: string; value: number; unit: string }>;
}

export function validateLifestyleInputs(
  vals: Record<string, string | undefined>,
  fields: Array<LifestyleField> = LIFESTYLE_FIELDS,
): LifestyleValidationResult {
  const values: Array<{ metric: string; value: number; unit: string }> = [];

  for (const f of fields) {
    const raw = vals[f.key];
    if (raw === undefined || raw === '') continue;

    const num = Number(raw.replace(',', '.'));
    if (isNaN(num)) continue;
    if (num < (f.min ?? 0)) {
      return { error: `${f.label}: Wert darf nicht negativ sein.`, values: [] };
    }
    if (f.max !== undefined && num > f.max) {
      return { error: `${f.label}: Wert darf maximal ${f.max} sein.`, values: [] };
    }

    values.push({ metric: f.key, value: num, unit: f.unit });
  }

  return { error: null, values };
}

