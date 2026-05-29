'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoMark } from '@/components/Logo';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Work',     href: '#work' },
  { label: 'Process',  href: '#process' },
  { label: 'About',    href: '#about' },
  { label: 'Contact',  href: '#contact' },
] as const;

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      window.setTimeout(() => closeButtonRef.current?.focus(), 40);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 z-[200] flex flex-col md:hidden"
          style={{ background: 'rgba(4,4,4,0.97)' }}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <a
              href="#"
              onClick={onClose}
              className="font-mono text-xs tracking-tight font-semibold text-white inline-flex items-center gap-2"
            >
              <LogoMark size={16} />
              LUNSFORD<span className="text-white/45">/SOFTWARE</span>
            </a>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close menu"
              className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="1" y1="1" x2="15" y2="15" />
                <line x1="15" y1="1" x2="1" y2="15" />
              </svg>
            </button>
          </div>

          {/* Nav links — large display type */}
          <nav className="flex-1 flex flex-col justify-center px-6 gap-1" aria-label="Mobile navigation">
            {LINKS.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                onClick={onClose}
                className="block py-3 border-b border-white/[0.06] text-white/55 hover:text-white transition-colors"
                style={{
                  fontSize: 'clamp(2rem, 10vw, 3.5rem)',
                  fontFamily: 'var(--font-anton), system-ui, sans-serif',
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.05,
                }}
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.32, delay: 0.06 + i * 0.055, ease: [0.22, 1, 0.36, 1] }}
              >
                {link.label}
              </motion.a>
            ))}
          </nav>

          {/* Bottom: CTA + contact info */}
          <motion.div
            className="px-6 pb-8 pt-5 space-y-3 border-t border-white/[0.06]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.38 }}
          >
            <a
              href="#contact"
              onClick={onClose}
              className="block w-full text-center py-4 bg-white text-black rounded-full font-semibold text-sm tracking-wide hover:bg-gray-100 transition-colors"
            >
              Start a project →
            </a>
            <div className="flex items-center justify-between pt-1">
              <a
                href="tel:4702152012"
                className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/35 hover:text-white/65 transition-colors"
              >
                470-215-2012
              </a>
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/25">
                Newnan, GA
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
