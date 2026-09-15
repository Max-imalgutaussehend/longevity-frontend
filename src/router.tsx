import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
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
  {
    path: '/insurer',
    lazy: () => import('./routes/InsurerShell.js'),
    children: [
      { index: true, lazy: () => import('./routes/InsurerOverview.js') },
      { path: 'overview', lazy: () => import('./routes/InsurerOverview.js') },
      { path: 'vorteile', lazy: () => import('./routes/InsurerOffers.js') },
    ],
  },
  {
    path: '/insurer-invite/:token',
    lazy: () => import('./routes/InsurerInvite.js'),
  },
  {
    path: '/verify-email/:token',
    lazy: () => import('./routes/VerifyEmail.js'),
  },
  {
    path: '/',
    lazy: () => import('./routes/AppShell.js'),
    children: [
      { index: true, lazy: () => import('./routes/Dashboard.js') },
      { path: 'dashboard', lazy: () => import('./routes/Dashboard.js') },
      { path: 'score', lazy: () => import('./routes/Score.js') },
      { path: 'hebel', lazy: () => import('./routes/Hebel.js') },
      { path: 'daten', lazy: () => import('./routes/Daten.js') },
      { path: 'freigabe', lazy: () => import('./routes/Freigabe.js') },
      { path: 'vorteile', lazy: () => import('./routes/Vorteile.js') },
      { path: 'report', lazy: () => import('./routes/Report.js') },
      { path: 'impressum', lazy: () => import('./routes/Impressum.js') },
      { path: 'datenschutz', lazy: () => import('./routes/Datenschutz.js') },
    ],
  },
]);
