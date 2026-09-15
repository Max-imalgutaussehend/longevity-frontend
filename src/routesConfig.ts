import type { RouteObject } from 'react-router-dom';

export const routes: RouteObject[] = [
  {
    path: '/login',
    lazy: () => import('./routes/Login.js'),
  },
  {
    path: '/register',
    lazy: () => import('./routes/Register.js'),
  },
  {
    path: '/verify/:id',
    lazy: () => import('./routes/Verify.js'),
  },
  // Public layer
  {
    path: '/',
    lazy: () => import('./routes/PublicShell.js'),
    children: [
      { index: true, lazy: () => import('./routes/Landing.js') },
      { path: 'impressum', lazy: () => import('./routes/Impressum.js') },
      { path: 'datenschutz', lazy: () => import('./routes/Datenschutz.js') },
    ],
  },
  // Protected app layer
  {
    lazy: () => import('./routes/AppShell.js'),
    children: [
      { path: 'dashboard', lazy: () => import('./routes/Dashboard.js') },
      { path: 'score', lazy: () => import('./routes/Score.js') },
      { path: 'hebel', lazy: () => import('./routes/Hebel.js') },
      { path: 'daten', lazy: () => import('./routes/Daten.js') },
      { path: 'freigabe', lazy: () => import('./routes/Freigabe.js') },
      { path: 'vorteile', lazy: () => import('./routes/Vorteile.js') },
      { path: 'report', lazy: () => import('./routes/Report.js') },
    ],
  },
];
