import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lunsford Software Development',
    short_name: 'Lunsford Software',
    description: 'Custom websites built from scratch. Based in Newnan, GA.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#0a0a0a',
    icons: [
      {
        src: '/icon-mark.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
