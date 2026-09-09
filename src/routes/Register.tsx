import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client.js';

export function Component() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', birthDate: '', sex: '' as 'm' | 'f' | '', displayName: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiClient('/auth/register', { method: 'POST', body: JSON.stringify(form) });
      navigate('/dashboard');
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Registrierung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, key: keyof typeof form, type = 'text', extra?: object) => (
    <label style={{ display: 'block', marginBottom: 16 }}>
      <span style={{ fontSize: 12, color: 'var(--neutral-700)', display: 'block', marginBottom: 4 }}>{label}</span>
      <input type={type} required value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--neutral-200)', borderRadius: 8, fontSize: 14 }}
        {...extra} />
    </label>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--neutral-50)' }}>
      <div style={{ width: '100%', maxWidth: 360, background: 'var(--neutral-0)', border: '1px solid var(--neutral-200)', borderRadius: 10, padding: 32 }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, margin: '0 0 24px' }}>Konto erstellen</h1>
        <form onSubmit={handleSubmit}>
          {field('E-Mail', 'email', 'email')}
          {field('Passwort (mind. 10 Zeichen)', 'password', 'password', { minLength: 10 })}
          {field('Geburtsdatum', 'birthDate', 'date')}
          <label style={{ display: 'block', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--neutral-700)', display: 'block', marginBottom: 4 }}>Biologisches Geschlecht</span>
            <span style={{ fontSize: 12, color: 'var(--neutral-500)', display: 'block', marginBottom: 8 }}>
              Wird für die Referenzkurven benötigt — Werte unterscheiden sich nach Geschlecht.
            </span>
            <select required value={form.sex} onChange={e => setForm(f => ({ ...f, sex: e.target.value as 'm' | 'f' }))}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--neutral-200)', borderRadius: 8, fontSize: 14 }}>
              <option value="">Bitte wählen</option>
              <option value="m">Männlich</option>
              <option value="f">Weiblich</option>
            </select>
          </label>
          {error && <p style={{ color: 'var(--danger-700)', fontSize: 13, margin: '16px 0' }}>{error}</p>}
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '10px', background: 'var(--accent-600)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', marginTop: 16 }}>
            {loading ? 'Einen Moment…' : 'Registrieren'}
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: 13, color: 'var(--neutral-500)', textAlign: 'center' }}>
          Bereits ein Konto? <Link to="/login" style={{ color: 'var(--accent-600)' }}>Anmelden</Link>
        </p>
      </div>
    </div>
  );
}
