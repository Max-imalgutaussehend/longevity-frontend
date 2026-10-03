import type { CSSProperties } from 'react';

export interface LogoProps {
  size?: number;
  className?: string;
  color?: string;
  style?: CSSProperties;
}

export function AppleLogo({ size = 20, className, color, style }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={color ?? 'currentColor'}
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
      aria-label="Apple Health Logo"
    >
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
    </svg>
  );
}

export function GoogleLogo({ size = 20, className, style }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
      aria-label="Google Health Logo"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function FitbitLogo({ size = 20, className, color, style }: LogoProps) {
  const fill = color ?? '#00B0B9';
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={fill}
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
      aria-label="Fitbit Logo"
    >
      <circle cx="12" cy="3.5" r="1.5" />
      <circle cx="12" cy="7.5" r="1.75" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="16.5" r="1.75" />
      <circle cx="12" cy="20.5" r="1.5" />
      <circle cx="7.5" cy="7.5" r="1.25" />
      <circle cx="7.5" cy="12" r="1.5" />
      <circle cx="7.5" cy="16.5" r="1.25" />
      <circle cx="16.5" cy="7.5" r="1.25" />
      <circle cx="16.5" cy="12" r="1.5" />
      <circle cx="16.5" cy="16.5" r="1.25" />
      <circle cx="3.5" cy="12" r="1" />
      <circle cx="20.5" cy="12" r="1" />
    </svg>
  );
}

export function GarminLogo({ size = 20, className, color, style }: LogoProps) {
  const fill = color ?? '#007CC3';
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={fill}
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
      aria-label="Garmin Logo"
    >
      <polygon points="12,2 22,20 2,20" />
    </svg>
  );
}

export function OuraLogo({ size = 20, className, color, style }: LogoProps) {
  const stroke = color ?? 'currentColor';
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke={stroke}
      strokeWidth="2.5"
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
      aria-label="Oura Ring Logo"
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.5" strokeWidth="1.5" strokeOpacity="0.5" />
    </svg>
  );
}

export function StravaLogo({ size = 20, className, color, style }: LogoProps) {
  const fill = color ?? '#FC4C02';
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={fill}
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
      aria-label="Strava Logo"
    >
      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-6.99 13.827h4.172" />
    </svg>
  );
}

export function WithingsLogo({ size = 20, className, color, style }: LogoProps) {
  const stroke = color ?? '#0f6e56';
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke={stroke}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
      aria-label="Withings Logo"
    >
      <path d="M4 6l3.5 12L11 8l3.5 10L18 6" />
      <circle cx="20.5" cy="6" r="1.5" fill={stroke} stroke="none" />
    </svg>
  );
}

export function WhoopLogo({ size = 20, className, color, style }: LogoProps) {
  const stroke = color ?? 'currentColor';
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke={stroke}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
      aria-label="Whoop Logo"
    >
      <path d="M3 12h3l2-6 4 12 3-9 2 3h4" />
    </svg>
  );
}

export function PolarLogo({ size = 20, className, color, style }: LogoProps) {
  const fill = color ?? '#D0142C';
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
      aria-label="Polar Logo"
    >
      <path
        d="M2.123 10.438 A 10 10 0 1 0 2.933 7.781 L 13.172 7.781 A 1.328 1.328 0 0 1 13.172 10.438 Z"
        fill={fill}
      />
      <path
        d="M4.209 18.27 C 4.539 16.648 4.93 15.945 5.906 15.945 L 13.719 15.945 C 16.063 15.945, 18.211 14.695, 19.383 12.938 C 20.555 11.18, 21.023 8.836, 20.66 7 A 10 10 0 0 1 4.209 18.27 Z"
        fill="black"
        fillOpacity={0.16}
      />
    </svg>
  );
}
