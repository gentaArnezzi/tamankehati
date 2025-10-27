import type { Metadata } from 'next';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = {
  title: 'Portal Keanekaragaman Hayati Indonesia',
  description:
    'Taman Kehati menyediakan akses terpadu ke data flora, fauna, dan taman konservasi Indonesia untuk edukasi, riset, dan aksi lapangan.',
  openGraph: {
    title: 'Portal Keanekaragaman Hayati Indonesia',
    description:
      'Jelajahi data flora, fauna, dan taman konservasi dari seluruh Nusantara melalui Taman Kehati.',
    images: [
      {
        url: '/hero/forest.webp',
        width: 1200,
        height: 630,
        alt: 'Hutan hujan Indonesia',
      },
    ],
  },
};

export const revalidate = 3600;

export default function HomePage() {
  return <HomePageClient />;
}
