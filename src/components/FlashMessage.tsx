import { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle2, Info, X } from 'lucide-react';

export interface FlashData {
  type: 'error' | 'success' | 'info';
  message: string;
}

interface FlashMessageProps {
  type?: 'error' | 'success' | 'info';
  message: string;
  onDismiss?: () => void;
  autoDismissMs?: number;
}

const TYPE_CONFIG = {
  error: {
    bg: 'rgba(163, 45, 45, 0.08)',
    border: '1px solid rgba(163, 45, 45, 0.22)',
    color: '#a32d2d',
    Icon: ShieldAlert,
  },
  success: {
    bg: 'rgba(29, 158, 117, 0.08)',
    border: '1px solid rgba(29, 158, 117, 0.22)',
    color: '#0f6e56',
    Icon: CheckCircle2,
  },
  info: {
    bg: 'rgba(15, 110, 86, 0.08)',
    border: '1px solid rgba(15, 110, 86, 0.2)',
    color: '#0f6e56',
    Icon: Info,
  },
};

export function FlashMessage({
  type = 'error',
  message,
  onDismiss,
  autoDismissMs = 7000,
}: FlashMessageProps) {
  const [visible, setVisible] = useState(true);
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.error;
  const Icon = cfg.Icon;

  useEffect(() => {
    if (autoDismissMs <= 0) return;
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [autoDismissMs, onDismiss]);

  if (!visible) return null;

  return (
    <div
      role="alert"
      data-testid="flash-message"
      data-type={type}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '12px 18px',
        marginBottom: 20,
        borderRadius: 14,
        background: cfg.bg,
        border: cfg.border,
        color: cfg.color,
        fontSize: 13,
        fontWeight: 500,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 4px 16px -4px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon size={16} style={{ flexShrink: 0 }} />
        <span>{message}</span>
      </div>
      <button
        type="button"
        data-testid="flash-dismiss-btn"
        aria-label="Schließen"
        onClick={() => {
          setVisible(false);
          onDismiss?.();
        }}
        style={{
          background: 'none',
          border: 'none',
          color: cfg.color,
          cursor: 'pointer',
          padding: 4,
          margin: -4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
          opacity: 0.75,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.75'; }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
