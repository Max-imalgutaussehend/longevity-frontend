/**
 * Centralized, type-safe route definitions and external links.
 * Single source of truth across the entire frontend application.
 */

export const APP_ROUTES = {
  // Namespace: Public
  public: {
    home: () => '/',
    impressum: () => '/impressum',
    datenschutz: () => '/datenschutz',
    login: (returnTo?: string) => (returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : '/login'),
    register: () => '/register',
    forgotPassword: () => '/forgot-password',
    resetPassword: (token: string) => `/reset-password/${encodeURIComponent(token)}`,
    verifyEmail: (token: string) => `/verify-email/${encodeURIComponent(token)}`,
    confirmDeleteAccount: (token: string) => `/confirm-delete-account/${encodeURIComponent(token)}`,
    verify: (id?: string) => (id ? `/verify/${encodeURIComponent(id)}` : '/verify'),
    insurerInvite: (token: string) => `/insurer-invite/${encodeURIComponent(token)}`,
  },

  // Namespace: App (Protected)
  app: {
    dashboard: () => '/dashboard',
    score: () => '/score',
    hebel: () => '/hebel',
    daten: (params?: { connected?: string; tab?: 'sources' | 'metrics' }) => {
      const q = new URLSearchParams();
      if (params?.connected) q.set('connected', params.connected);
      if (params?.tab) q.set('tab', params.tab);
      const queryStr = q.toString();
      return queryStr ? `/daten?${queryStr}` : '/daten';
    },
    freigabe: () => '/freigabe',
    vorteile: () => '/vorteile',
    report: () => '/report',
  },

  // Role-specific shells
  insurer: {
    root: () => '/insurer',
    overview: () => '/insurer/overview',
    vorteile: () => '/insurer/vorteile',
  },
  admin: {
    root: () => '/admin',
    users: () => '/admin',
    insurerRequests: () => '/admin/insurer-requests',
  },

  // Flat string aliases for backwards compatibility
  home: '/',
  impressum: '/impressum',
  datenschutz: '/datenschutz',
  login: (returnTo?: string) => (returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : '/login'),
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: (token: string) => `/reset-password/${encodeURIComponent(token)}`,
  verifyEmail: (token: string) => `/verify-email/${encodeURIComponent(token)}`,
  confirmDeleteAccount: (token: string) => `/confirm-delete-account/${encodeURIComponent(token)}`,
  verify: (id?: string) => (id ? `/verify/${encodeURIComponent(id)}` : '/verify'),
  insurerInvite: (token: string) => `/insurer-invite/${encodeURIComponent(token)}`,
  dashboard: '/dashboard',
  score: '/score',
  hebel: '/hebel',
  daten: (params?: { connected?: string; tab?: 'sources' | 'metrics' }) => {
    const q = new URLSearchParams();
    if (params?.connected) q.set('connected', params.connected);
    if (params?.tab) q.set('tab', params.tab);
    const queryStr = q.toString();
    return queryStr ? `/daten?${queryStr}` : '/daten';
  },
  freigabe: '/freigabe',
  vorteile: '/vorteile',
  report: '/report',
} as const;

export const EXTERNAL_LINKS = {
  github: 'https://github.com/Max-imalgutaussehend/LONGEVITY',
  contactEmail: 'kontakt@longevity.app',
} as const;
