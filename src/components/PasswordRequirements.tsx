import { Check, Circle } from 'lucide-react';

export interface PasswordRule {
  id: 'length' | 'lowercase' | 'uppercase' | 'special';
  label: string;
  check: (pw: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'length',
    label: 'Mindestens 10 Zeichen',
    check: (pw) => pw.length >= 10,
  },
  {
    id: 'lowercase',
    label: 'Mindestens 1 Kleinbuchstabe',
    check: (pw) => /[a-z]/.test(pw),
  },
  {
    id: 'uppercase',
    label: 'Mindestens 1 Großbuchstabe',
    check: (pw) => /[A-Z]/.test(pw),
  },
  {
    id: 'special',
    label: 'Mindestens 1 Zahl oder Sonderzeichen',
    check: (pw) => /[\d\W_]/.test(pw),
  },
];

export function checkPasswordRequirements(password: string) {
  const length = password.length >= 10;
  const lowercase = /[a-z]/.test(password);
  const uppercase = /[A-Z]/.test(password);
  const special = /[\d\W_]/.test(password);
  const allValid = length && lowercase && uppercase && special;
  return { length, lowercase, uppercase, special, allValid };
}

export interface PasswordRequirementsProps {
  password?: string;
  showAlways?: boolean;
}

export function PasswordRequirements({ password = '', showAlways = true }: PasswordRequirementsProps) {
  if (!showAlways && !password) return null;

  return (
    <div
      data-testid="password-requirements"
      style={{
        marginTop: 6,
        padding: '10px 12px',
        borderRadius: 8,
        background: 'rgba(0, 0, 0, 0.025)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 500, color: '#71716b', marginBottom: 2 }}>
        Passwort-Anforderungen:
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
        {PASSWORD_RULES.map((rule) => {
          const satisfied = rule.check(password);
          return (
            <div
              key={rule.id}
              data-testid={`password-rule-${rule.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: satisfied ? '#0f6e56' : '#888780',
                transition: 'color 0.15s ease',
              }}
            >
              {satisfied ? (
                <Check size={13} color="#0f6e56" strokeWidth={2.5} style={{ flexShrink: 0 }} />
              ) : (
                <Circle size={10} color="#b4b2a9" style={{ flexShrink: 0 }} />
              )}
              <span style={{ fontWeight: satisfied ? 500 : 400 }}>{rule.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
