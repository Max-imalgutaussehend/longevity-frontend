import type { CSSProperties, ReactNode, MouseEvent } from 'react';

/* ── Primitives ────────────────────────────────────────────────── */

export function Card({ children, style, className, onClick, 'data-testid': testId }: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  onClick?: (e: MouseEvent) => void;
  'data-testid'?: string;
}) {
  return (
    <div
      className={`glass ${className ?? ''}`}
      onClick={onClick}
      data-testid={testId}
      style={{ borderRadius: 20, padding: '28px 32px', ...style }}
    >
      {children}
    </div>
  );
}

export function Btn({
  children, variant = 'primary', small, full, onClick, type = 'button', testId, disabled, title, style, className,
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  small?: boolean;
  full?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  testId?: string;
  disabled?: boolean;
  title?: string;
  style?: CSSProperties;
  className?: string;
}) {
  const base: CSSProperties = {
    padding: small ? '5px 14px' : '9px 20px',
    borderRadius: 999,
    fontSize: small ? 12 : 13,
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    width: full ? '100%' : undefined,
    transition: 'opacity 0.15s',
    letterSpacing: '0.01em',
    border: 'none',
    opacity: disabled ? 0.6 : 1,
  };
  const variants: Record<string, CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, #1d9e75 0%, #0f6e56 100%)',
      color: '#fff',
      border: '1px solid rgba(15,110,86,0.4)',
      boxShadow: '0 2px 12px rgba(29,158,117,0.28), 0 1px 0 rgba(255,255,255,0.18) inset',
    },
    secondary: {
      background: 'rgba(255,255,255,0.60)',
      color: '#0f6e56',
      border: '1px solid rgba(29,158,117,0.28)',
      backdropFilter: 'blur(12px)',
    },
    ghost: {
      background: 'rgba(255,255,255,0.35)',
      color: '#55544f',
      border: '1px solid rgba(168,168,156,0.3)',
      backdropFilter: 'blur(12px)',
    },
    danger: {
      background: 'rgba(255,255,255,0.45)',
      color: '#a32d2d',
      border: '1px solid rgba(163,45,45,0.25)',
      backdropFilter: 'blur(12px)',
    },
  };
  return (
    <button
      type={type}
      className={className}
      onClick={disabled ? undefined : onClick}
      data-testid={testId}
      disabled={disabled}
      title={title}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.opacity = '0.80'; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.opacity = '1'; }}
    >
      {children}
    </button>
  );
}

export function Chip({ children, color = 'neutral' }: {
  children: ReactNode;
  color?: 'teal' | 'neutral' | 'red' | 'amber' | 'green';
}) {
  const styles: Record<string, CSSProperties> = {
    teal:    { background: 'rgba(29,158,117,0.10)', color: '#0f6e56', border: '1px solid rgba(29,158,117,0.22)' },
    neutral: { background: 'rgba(168,168,156,0.12)', color: '#55544f', border: '1px solid rgba(168,168,156,0.25)' },
    red:     { background: 'rgba(163,45,45,0.09)', color: '#a32d2d', border: '1px solid rgba(163,45,45,0.2)' },
    amber:   { background: 'rgba(133,79,11,0.09)', color: '#854f0b', border: '1px solid rgba(133,79,11,0.2)' },
    green:   { background: 'rgba(59,109,17,0.09)', color: '#3b6d11', border: '1px solid rgba(59,109,17,0.2)' },
  };
  return (
    <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 999, ...styles[color] }}>
      {children}
    </span>
  );
}

export function MockBadge() {
  return (
    <span style={{
      fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 999,
      background: 'rgba(168,168,156,0.15)', color: '#888780',
      border: '1px solid rgba(168,168,156,0.25)', letterSpacing: '0.03em',
    }}>
      Mock
    </span>
  );
}

export function PercentileBar({ p }: { p: number | null }) {
  if (p === null) return <span style={{ fontSize: 12, color: '#a3a29c' }}>—</span>;
  const color = p >= 65 ? '#1d9e75' : p >= 40 ? '#854f0b' : '#a32d2d';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 99, background: 'rgba(0,0,0,0.06)' }}>
        <div style={{ height: '100%', borderRadius: 99, background: color, width: `${p}%`, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: 11, color: '#888780', minWidth: 28, textAlign: 'right' }}>{p}. Pz.</span>
    </div>
  );
}

export function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      aria-checked={on}
      role="switch"
      style={{
        width: 42, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer',
        background: on ? 'linear-gradient(135deg,#1d9e75,#0f6e56)' : 'rgba(168,168,156,0.25)',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        boxShadow: on ? '0 2px 8px rgba(29,158,117,0.3)' : 'none',
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: on ? 21 : 3,
        width: 18, height: 18, borderRadius: 999, background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        transition: 'left 0.18s cubic-bezier(0.34,1.2,0.64,1)',
      }} />
    </button>
  );
}

export function Modal({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(15,30,22,0.22)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 440, margin: 24 }}>
        <Card style={{ padding: '32px 36px' }}>{children}</Card>
      </div>
    </div>
  );
}

export function GlassInput({ placeholder, type = 'text', value, onChange, onFocus, onBlur, testId, name }: {
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (v: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  testId?: string;
  name?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      name={name}
      data-testid={testId}
      onChange={(e) => onChange?.(e.target.value)}
      onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(29,158,117,0.5)'; onFocus?.(); }}
      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)'; onBlur?.(); }}
      style={{
        width: '100%', padding: '10px 16px', borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.7)',
        background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)',
        fontSize: 14, fontFamily: 'inherit', color: '#22221f', outline: 'none',
        transition: 'border-color 0.15s',
      }}
    />
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#55544f', marginBottom: 6, letterSpacing: '0.02em' }}>
      {children}
    </label>
  );
}

export function GlassSelect({ value, onChange, options, testId, name }: {
  value?: string;
  onChange?: (v: string) => void;
  options: { value: string; label: string }[];
  testId?: string;
  name?: string;
}) {
  return (
    <select
      value={value}
      name={name}
      data-testid={testId}
      onChange={(e) => onChange?.(e.target.value)}
      style={{
        width: '100%', padding: '10px 16px', borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.7)',
        background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)',
        fontSize: 14, fontFamily: 'inherit', color: '#22221f', outline: 'none',
        cursor: 'pointer', appearance: 'none',
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function InfoTooltip({ text }: { text: string }) {
  return (
    <span
      title={text}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 15, height: 15, borderRadius: 999, marginLeft: 6,
        fontSize: 10, fontWeight: 600, color: '#888780',
        background: 'rgba(168,168,156,0.15)', border: '1px solid rgba(168,168,156,0.3)',
        cursor: 'help', verticalAlign: 'middle',
      }}
    >
      ?
    </span>
  );
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, color: '#22221f', letterSpacing: '-0.01em', marginBottom: sub ? 6 : 0, margin: 0 }}>{title}</h1>
      {sub && <p style={{ fontSize: 14, color: '#888780', margin: '6px 0 0' }}>{sub}</p>}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: 12, color: '#888780', marginBottom: 14, margin: '0 0 14px' }}>
      {children}
    </p>
  );
}

export function StatTile({ label, value, unit, sub }: {
  label: string;
  value: ReactNode;
  unit?: string;
  sub?: string;
}) {
  return (
    <div className="glass-deep" style={{ borderRadius: 20, padding: '28px 28px 24px' }}>
      <div style={{ fontSize: 11, color: '#888780', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        {value}
        {unit && <span style={{ fontSize: 14, color: '#888780', fontWeight: 400 }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#888780', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export function Skeleton({ width, height, style }: { width?: string | number; height?: string | number; style?: CSSProperties }) {
  return (
    <div style={{
      width: width ?? '100%',
      height: height ?? 16,
      borderRadius: 8,
      background: 'rgba(168,168,156,0.18)',
      animation: 'pulse 1.8s ease-in-out infinite',
      ...style,
    }} />
  );
}
