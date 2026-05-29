// No 'use client' — pure SVG, no hooks, Server Component safe.
import type { SVGProps } from 'react';

interface MarkProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  size?: number;
}

/* ═══════════════════════════════════════════════════════════
   LogoMark — the bracket [ L ] icon mark extracted from the
   brand sheet. stroke="currentColor" so it inherits text
   color from its parent — zero extra styling needed for B/W
   theming. Use the size prop; default 28.
═══════════════════════════════════════════════════════════ */
export function LogoMark({ size = 28, className = '', style, ...props }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 46 46"
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={style}
      {...props}
    >
      {/* Left bracket — top cap → vertical → bottom cap */}
      <path d="M14 10 L7 10 L7 36 L14 36" strokeWidth="3.5" />
      {/* Right bracket — top cap → vertical → bottom cap */}
      <path d="M32 10 L39 10 L39 36 L32 36" strokeWidth="3.5" />
      {/* The L — vertical bar down, then horizontal foot right */}
      <path d="M17 12 L17 33 L30 33" strokeWidth="4" />
    </svg>
  );
}
