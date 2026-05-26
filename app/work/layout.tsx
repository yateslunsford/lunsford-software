import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:       'Work — Lunsford Software',
  description: 'Featured client builds and personal projects from Lunsford Software Development. Custom websites, e-commerce, drop launches.',
};

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
