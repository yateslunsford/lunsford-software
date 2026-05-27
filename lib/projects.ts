export type Project = {
  slug: string;
  title: string;
  client: string;
  tags: string[];
  year: string;
  description: string;
  url: string;
  /** Card background. Strict B/W palette — all near-black tones. */
  color: string;
  /** Foreground accent — white or near-white tints. */
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
    color:       '#070707',
    accentColor: '#ffffff',
    status: 'live',
  },
  {
    slug: 'lunsford-software',
    title: 'Lunsford Software',
    client: 'Personal Portfolio',
    tags: ['Next.js', 'R3F', 'GSAP', 'Vercel'],
    year: '2026',
    description:
      'Personal dev portfolio with cinematic 3D scroll animations and immersive WebGL scenes. Built to stand out.',
    url: '/',
    color:       '#0a0a0c',
    accentColor: '#ececec',
    status: 'live',
  },
  {
    slug: 'local-business',
    title: 'Local Business Web Presence',
    client: 'Tier-1 Concept',
    tags: ['Next.js', 'TypeScript', 'Tailwind'],
    year: '2026',
    description:
      'Clean, fast, mobile-first site for a local service business. Built for SEO and real conversions.',
    url: '#',
    color:       '#080a0d',
    accentColor: '#c4c4c4',
    status: 'in-progress',
  },
];
