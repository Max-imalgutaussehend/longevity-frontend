import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client.js';

export function Component() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiClient('/auth/login', { method: 'POST', body: JSON.stringify(form) });
      const returnTo = new URLSearchParams(window.location.search).get('returnTo') ?? '/dashboard';
      navigate(returnTo);
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Anmeldung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--neutral-50)' }}>
      <div style={{ width: '100%', maxWidth: 360, background: 'var(--neutral-0)', border: '1px solid var(--neutral-200)', borderRadius: 10, padding: 32 }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, margin: '0 0 24px' }}>Anmelden</h1>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--neutral-700)', display: 'block', marginBottom: 4 }}>E-Mail</span>
            <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--neutral-200)', borderRadius: 8, fontSize: 14 }} />
          </label>
          <label style={{ display: 'block', marginBottom: 24 }}>
            <span style={{ fontSize: 12, color: 'var(--neutral-700)', display: 'block', marginBottom: 4 }}>Passwort</span>
            <input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--neutral-200)', borderRadius: 8, fontSize: 14 }} />
          </label>
          {error && <p style={{ color: 'var(--danger-700)', fontSize: 13, marginBottom: 16 }}>{error}</p>}
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '10px', background: 'var(--accent-600)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            {loading ? 'Einen Moment…' : 'Anmelden'}
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: 13, color: 'var(--neutral-500)', textAlign: 'center' }}>
          Noch kein Konto? <Link to="/register" style={{ color: 'var(--accent-600)' }}>Registrieren</Link>
        </p>
      </div>
    </div>
  );
}
