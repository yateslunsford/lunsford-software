export type Project = {
  slug: string;
  title: string;
  client: string;
  tags: string[];
  year: string;
  description: string;
  url: string;
  color: string;
  accentColor: string;
  status: 'live' | 'in-progress' | 'concept';
};

export const projects: Project[] = [
  {
    slug: 'ruined-visions',
    title: 'Ruined Visions',
    client: 'Jeremiah Williams',
    tags: ['E-Commerce', 'Drop Launch', 'SMS', 'Stripe', 'Sanity CMS'],
    year: '2026',
    description:
      'Full streetwear drop launch platform. Countdown lock, Stripe checkout, Sanity CMS, Twilio SMS blast to 1,000+ signups. Drops July 17.',
    url: 'https://ruined-visions-site.vercel.app',
    color: '#0a0a0a',
    accentColor: '#ff4444',
    status: 'live',
  },
  {
    slug: 'lunsford-software',
    title: 'Lunsford Software',
    client: 'Internal',
    tags: ['Portfolio', 'Next.js', 'Framer Motion', 'GSAP'],
    year: '2026',
    description:
      'The site you are looking at. Built to close deals. Three-act hero, scroll-driven animations, magnetic CTA.',
    url: '/',
    color: '#080808',
    accentColor: '#ff8c3c',
    status: 'live',
  },
  {
    slug: 'buckley-trash',
    title: 'Buckley Trash Removal',
    client: 'Coming Soon',
    tags: ['Local Business', 'Tier 1', 'Lead Gen'],
    year: '2026',
    description:
      'Local junk removal business site. Clean, fast, built to rank on Google and convert mobile visitors.',
    url: '#',
    color: '#1a1a0a',
    accentColor: '#f5c842',
    status: 'in-progress',
  },
];
