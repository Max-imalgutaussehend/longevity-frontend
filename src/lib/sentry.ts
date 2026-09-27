/**
 * Sentry initialisation for the React frontend.
 *
 * Called once from main.tsx before <RouterProvider> is rendered.
 * Set VITE_SENTRY_DSN in your .env to enable error tracking.
 * Without it this module is a no-op.
 *
 * We use the @sentry/react SDK which wraps the React Router
 * integration so that route changes are tracked as transactions.
 */
import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

export function initSentry() {
  if (!dsn) return; // Gracefully disabled when DSN is not configured

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE, // 'development' | 'production'
    release: import.meta.env.VITE_COMMIT_SHA as string | undefined,

    integrations: [
      // Automatic performance tracing for page loads and navigation
      Sentry.browserTracingIntegration(),
      // Session replay — 10 % in prod, 100 % on error
      Sentry.replayIntegration({
        maskAllText: true,   // Never record health data text
        blockAllMedia: true,
      }),
    ],

    // 10 % performance traces in production, 100 % in dev
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Capture 10 % of sessions, 100 % when an error occurs
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Never capture PII — health data must not leave the browser via Sentry
    sendDefaultPii: false,
  });
}

/**
 * Sentry-wrapped error boundary component from @sentry/react.
 * Re-exported here so other files don't need to import from @sentry/react.
 */
export { Sentry };
