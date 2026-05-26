'use client';

import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

interface ButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  external?: boolean;
  onClick?: () => void;
}

/* ═══════════════════════════════════════════════════════════
   Button — shared shiny premium pill.
   Identical visual treatment everywhere it appears.
═══════════════════════════════════════════════════════════ */
export default function Button({
  href,
  children,
  className = '',
  style,
  external,
  onClick,
}: ButtonProps) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onClick={onClick}
      className={[
        'group relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap',
        'bg-black text-white uppercase font-semibold',
        'border border-white/[0.15] hover:border-white/40',
        'transition-all duration-300 ease-out',
        'hover:scale-[1.02]',
        'hover:shadow-[0_0_20px_rgba(255,255,255,0.2),0_0_40px_rgba(255,255,255,0.1)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        borderRadius: 9999,
        fontSize: 13,
        letterSpacing: '0.08em',
        padding: '12px 28px',
        ...style,
      }}
    >
      {/* Glass shine — diagonal highlight overlay */}
      <span
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: 9999,
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0) 100%)',
        }}
      />
      <span className="relative z-10">{children}</span>
    </Link>
  );
}
