import { useMemo } from 'react';

/**
 * Lightweight pure-CSS confetti particle simulation overlay.
 */
export function ConfettiCanvas() {
  const particles = useMemo(() => {
    const colors = ['#1d9e75', '#0f6e56', '#5dcaa5', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];
    return Array.from({ length: 42 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      size: 6 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1.5,
      duration: 2.2 + Math.random() * 1.8,
      rotate: Math.random() * 360,
    }));
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 10 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            borderRadius: 2,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confettiFall ${p.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}s infinite`,
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  );
}
