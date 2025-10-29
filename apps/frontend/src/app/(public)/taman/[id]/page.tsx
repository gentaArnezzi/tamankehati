import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ParkDetailView } from '../../../../components/public/parks/ParkDetailView';
import { JsonLd } from '../../../../components/public/seo/JsonLd';
import { getArtikelPage, getTamanDetail, getParkStats } from '../../../../lib/api/public';
import type { TamanDetail } from '../../../../types/taman';

type TamanDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: TamanDetailPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const taman = await getTamanDetail(id);
    return {
      title: `${taman.name} | Taman Kehati`,
      description: taman.description?.slice(0, 150) ?? 'Profil taman konservasi Indonesia.',
      openGraph: {
        title: taman.name,
        description: taman.description?.slice(0, 150),
      },
    };
  } catch {
    return {
      title: 'Taman Kehati',
      description: 'Profil taman konservasi Indonesia.',
    };
  }
}

export default async function TamanDetailPage({ params }: TamanDetailPageProps) {
  try {
    const { id } = await params;
    const [taman, parkStats] = await Promise.all([
      getTamanDetail(id),
      getParkStats(parseInt(id)).catch(() => null), // Fetch real stats from stats endpoint
    ]);
    
    const relatedArticles = await getArtikelPage({ search: taman.name, limit: 4, offset: 0 }).catch(() => null);

    const enrichedTaman = {
      ...taman,
      artikel_terkait: relatedArticles?.items ?? [],
      statistik: {
        flora: parkStats?.total_flora ?? taman.statistik?.flora ?? 0,
        fauna: parkStats?.total_fauna ?? taman.statistik?.fauna ?? 0,
        kegiatan: parkStats?.total_artikel ?? 0,  // Using total_artikel field for activities count
        galeri: 0,  // Gallery stats not available in current API
      },
    };

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tamankehati.id';
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: enrichedTaman.name,
      description: enrichedTaman.description,
      address: 'Indonesia', // Region-based addressing removed - using user-based access control
      areaServed: 'Indonesia', // Region-based addressing removed - using user-based access control
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 0,
        longitude: 0,
      },
      url: `${siteUrl}/taman/${id}`,
    };

    return (
      <>
        <JsonLd data={jsonLd} />
        <ParkDetailView park={enrichedTaman} />
      </>
    );
  } catch (error) {
    console.error('Error loading taman details:', error);
    notFound();
  }
}
