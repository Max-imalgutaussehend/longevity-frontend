const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

let csrfTokenPromise: Promise<string | null> | null = null;

export async function fetchCsrfToken(): Promise<string | null> {
  const existing = getCsrfTokenFromCookie();
  if (existing) return existing;
  if (typeof window === 'undefined') return null;

  if (!csrfTokenPromise) {
    csrfTokenPromise = fetch(`${BASE}/auth/csrf`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        csrfTokenPromise = null;
        return data?.csrfToken || getCsrfTokenFromCookie();
      })
      .catch(() => {
        csrfTokenPromise = null;
        return null;
      });
  }
  return csrfTokenPromise;
}

export interface ApiClientOptions extends RequestInit {
  skipAuthRedirect?: boolean;
}

export interface CurrentUser {
  id: string;
  email: string;
  displayName?: string | null;
  role?: string;
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  try {
    return await apiClient<CurrentUser>('/me', { skipAuthRedirect: true });
  } catch {
    return null;
  }
}

export async function apiClient<T>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  const isPublicAuth = path.startsWith('/auth/login') || path.startsWith('/auth/register');

  let csrfToken: string | null = null;
  if (isMutating && !isPublicAuth) {
    csrfToken = getCsrfTokenFromCookie();
    if (!csrfToken) {
      csrfToken = await fetchCsrfToken();
    }
  }

  const hasBody = options.body !== undefined && options.body !== null;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const defaultHeaders: Record<string, string> =
    isFormData || !hasBody ? {} : { 'Content-Type': 'application/json' };
  const csrfHeaders: Record<string, string> = csrfToken ? { 'X-CSRF-Token': csrfToken } : {};

  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...defaultHeaders,
      ...csrfHeaders,
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (res.status === 401) {
    // Only redirect to /login when the session is actually missing/expired.
    // A 401 due to wrong password on sensitive actions (e.g. account deletion)
    // should NOT trigger a forced logout.
    let isSessionExpired = true;
    try {
      const cloned = res.clone();
      const body = await cloned.json();
      const title: string = body?.title ?? '';
      // Only log out if the server explicitly signals "not authenticated"
      isSessionExpired = title === 'Nicht angemeldet.' || title === '';
    } catch {
      // If we can't parse the body, assume session expired
    }

    if (!options.skipAuthRedirect && isSessionExpired && typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const search = window.location.search;
      if (!pathname.startsWith('/login') && !pathname.startsWith('/register')) {
        const returnTo = encodeURIComponent(pathname + (search || ''));
        try {
          const { router } = await import('../router.js');
          if (router && typeof router.navigate === 'function') {
            router.navigate(`/login?returnTo=${returnTo}`, { replace: true });
          } else {
            window.location.href = `/login?returnTo=${returnTo}`;
          }
        } catch {
          window.location.href = `/login?returnTo=${returnTo}`;
        }
      }
    }
    const problem = await res.clone().json().catch(() => ({}));
    const message = problem.error || problem.title || problem.message || 'Nicht angemeldet.';
    throw Object.assign(new Error(message), { status: 401, problem });
  }

  if (!res.ok) {
    const problem = await res.json().catch(() => ({}));
    const message = problem.error || problem.title || problem.message || 'Request failed';
    throw Object.assign(new Error(message), { status: res.status, problem });
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
