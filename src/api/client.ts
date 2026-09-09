const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (res.status === 401) {
    const returnTo = encodeURIComponent(window.location.pathname);
    window.location.href = `/login?returnTo=${returnTo}`;
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const problem = await res.json().catch(() => ({}));
    throw Object.assign(new Error(problem.title ?? 'Request failed'), { status: res.status, problem });
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
