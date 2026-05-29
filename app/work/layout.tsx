import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "All Work — Lunsford Software Development",
  description:
    "Full portfolio of custom websites and web apps built from scratch. Real projects, real results. Based in Newnan, GA.",
  openGraph: {
    title: "All Work — Lunsford Software Development",
    description: "Full portfolio of custom websites built from scratch. No templates, no shortcuts.",
    url: "https://lunsfordsoftware.com/work",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Work — Lunsford Software Development",
    description: "Full portfolio of custom websites built from scratch.",
  },
};

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
