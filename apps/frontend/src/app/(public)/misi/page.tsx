import type { Metadata } from 'next';
import { MisiPage } from '@/components/public/misi/MisiPage';

export const metadata: Metadata = {
  title: 'Misi Kami - Taman Kehati Indonesia',
  description: 'Pelajari misi dan visi Taman Kehati dalam melestarikan keanekaragaman hayati Indonesia melalui teknologi, kolaborasi, dan aksi nyata yang berkelanjutan.',
  openGraph: {
    title: 'Misi Kami - Taman Kehati Indonesia',
    description: 'Melestarikan keanekaragaman hayati Indonesia melalui teknologi, kolaborasi, dan aksi nyata yang berkelanjutan.',
    images: [
      {
        url: '/hero/forest.webp',
        width: 1200,
        height: 630,
        alt: 'Hutan hujan Indonesia - Misi Konservasi',
      },
    ],
  },
};

export const revalidate = 3600;

export default function MisiPageRoute() {
  return <MisiPage />;
}
