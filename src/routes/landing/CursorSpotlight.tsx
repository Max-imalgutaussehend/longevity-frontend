import { useRef, useEffect } from 'react';

export function CursorSpotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = spotlightRef.current;
    if (!el) return;

    let rafId: number;
    const handleMove = (e: MouseEvent) => {
      rafId = requestAnimationFrame(() => {
        if (el) {
          el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
          el.style.opacity = '1';
        }
      });
    };

    const handleLeave = () => {
      if (el) {
        el.style.opacity = '0';
      }
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseleave', handleLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <div
      ref={spotlightRef}
      className="cursor-light-spotlight"
      aria-hidden="true"
    />
  );
}
