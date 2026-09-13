const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const defaultHeaders: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' };

  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: { ...defaultHeaders, ...(options.headers as Record<string, string> | undefined) },
  });

  if (res.status === 401) {
    const returnTo = encodeURIComponent(window.location.pathname);
    window.location.href = `/login?returnTo=${returnTo}`;
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const problem = await res.json().catch(() => ({}));
    const message = problem.error || problem.title || problem.message || 'Request failed';
    throw Object.assign(new Error(message), { status: res.status, problem });
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
