import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { apiClient } from '../../api/client.js';
import { APP_ROUTES } from '../../lib/routes.js';
import { SUPPORTED_BRANDS } from './brandsConfig.js';

export function DashboardBrandLogosBar() {
  const navigate = useNavigate();
  const { data: sources = [] } = useQuery<{ id: string; kind: string; enabled: boolean; sampleCount?: number; lastSyncAt?: string | null }[]>({
    queryKey: ['sources'],
    queryFn: () => apiClient('/sources'),
  });

  const isBrandConnected = (brandId: string) => {
    return sources.some((s) => {
      if (!s.enabled) return false;
      const hasData = (s.sampleCount ?? 0) > 0 || !!s.lastSyncAt;
      if (brandId === 'apple') return (s.kind === 'apple_health' || s.kind === 'health_auto_export') && hasData;
      if (brandId === 'google') return (s.kind === 'google_fit' || s.kind === 'google_health') && hasData;
      if (brandId === 'oura') return s.kind === 'oura' && hasData;
      return s.kind === brandId && hasData;
    });
  };

  const connectedCount = SUPPORTED_BRANDS.filter((b) => isBrandConnected(b.id)).length;

  return (
    <div
      data-testid="dashboard-brand-logos"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(248,252,250,0.88) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 18,
        border: '1px solid rgba(29, 158, 117, 0.18)',
        padding: '18px 22px',
        boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#22221f' }}>
            Kompatible Tracker & Gesundheits-Apps
          </span>
          <span
            style={{
              fontSize: 11,
              color: connectedCount > 0 ? '#0f6e56' : '#71716b',
              background: connectedCount > 0 ? 'rgba(29, 158, 117, 0.1)' : 'rgba(0,0,0,0.05)',
              padding: '2px 8px',
              borderRadius: 999,
              fontWeight: 500,
            }}
          >
            {connectedCount > 0 ? `${connectedCount} aktiv verbunden` : `${SUPPORTED_BRANDS.length} Plattformen unterstützt`}
          </span>
        </div>
        <button
          type="button"
          data-testid="dashboard-manage-sources-btn"
          onClick={() => navigate(APP_ROUTES.daten())}
          style={{
            fontSize: 12,
            color: '#0f6e56',
            fontWeight: 600,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: 0,
          }}
        >
          Tracker & Quellen verwalten →
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', alignItems: 'center' }}>
        {SUPPORTED_BRANDS.map((b) => {
          const Logo = b.Logo;
          const connected = isBrandConnected(b.id);
          return (
            <button
              key={b.id}
              type="button"
              data-testid={`dashboard-brand-${b.id}`}
              onClick={() => navigate(APP_ROUTES.daten())}
              title={`${b.name} (${b.category}) – ${connected ? 'Aktiv verbunden' : 'Jetzt in Daten verknüpfen'}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 13px',
                borderRadius: 999,
                background: connected ? 'rgba(29, 158, 117, 0.09)' : 'rgba(255, 255, 255, 0.85)',
                border: connected ? '1.5px solid rgba(29, 158, 117, 0.35)' : '1px solid rgba(0, 0, 0, 0.07)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = 'rgba(29, 158, 117, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = connected ? 'rgba(29, 158, 117, 0.35)' : 'rgba(0, 0, 0, 0.07)';
              }}
            >
              <Logo size={15} color={b.id === 'google' ? undefined : b.accentColor} />
              <span style={{ fontSize: 12, fontWeight: 500, color: connected ? '#0f6e56' : '#22221f' }}>
                {b.name}
              </span>
              {connected && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: '#0f6e56',
                    color: '#fff',
                  }}
                >
                  <Check size={9} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
