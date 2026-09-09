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
    ],
  },
]);
