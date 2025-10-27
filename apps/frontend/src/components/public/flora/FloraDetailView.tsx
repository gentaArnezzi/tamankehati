'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { type FloraDetail } from '../../../types/flora';
import { Badge } from '../../ui/badge';
import { LeafletMap } from '../map/LeafletMap';
import { EntityCard } from '../cards/EntityCard';
import { JsonLd } from '../seo/JsonLd';

type FloraDetailViewProps = {
  flora: FloraDetail;
};

type GalleryImage = {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  created_at?: string;
};

const taxonomyEntries = (flora: FloraDetail) =>
  [
    { label: 'Nama ilmiah', value: flora.nama_ilmiah },
    { label: 'Nama umum', value: flora.nama_umum },
    { label: 'Famili', value: flora.famili },
    { label: 'Genus', value: flora.genus },
    { label: 'Spesies', value: flora.spesies },
    { label: 'Ordo', value: flora.ordo },
    { label: 'Status IUCN', value: flora.status_iucn },
    { label: 'Habitat', value: flora.habitat },
    { label: 'Sebaran', value: flora.sebaran?.join(', ') },
  ].filter((entry) => entry.value);

export function FloraDetailView({ flora }: FloraDetailViewProps) {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const response = await fetch(`/api/public/flora/${flora.id}/gallery`);
        if (response.ok) {
          const data = await response.json();
          setGalleryImages(data.gallery_images || []);
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      } finally {
        setLoadingGallery(false);
      }
    };

    fetchGalleryImages();
  }, [flora.id]);
  const heroImage =
    flora.gambar_utama && flora.gambar_utama.trim()
      ? (flora.gambar_utama.startsWith('http') ? flora.gambar_utama : `http://localhost:8000${flora.gambar_utama}`)
      : 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1600&auto=format&fit=crop';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Taxon',
    name: flora.nama_ilmiah,
    alternateName: flora.nama_umum,
    description: flora.deskripsi,
    image: flora.gambar_utama,
    habitat: flora.habitat,
    conservationStatus: flora.status_iucn,
    geographicDistribution: flora.sebaran,
  };

  return (
    <div className="space-y-12">
      <JsonLd data={jsonLd} />
      <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
        <div className="relative h-[320px] w-full md:h-[420px]">
          <Image
            src={heroImage}
            alt={flora.nama_ilmiah}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 960px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-500">{flora.status_iucn}</Badge>
              <Badge variant="outline" className="border-white/40 bg-white/10 text-white">
                {flora.wilayah}
              </Badge>
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl lg:text-5xl">{flora.nama_ilmiah}</h1>
            {flora.nama_umum && (
              <p className="text-lg text-white/80 md:text-xl">
                {flora.nama_umum}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-8 p-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:p-12">
          <article className="space-y-6">
            {flora.deskripsi && (
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-slate-900">Deskripsi</h2>
                <p className="whitespace-pre-line text-base leading-relaxed text-slate-700">
                  {flora.deskripsi}
                </p>
              </div>
            )}

            {flora.habitat && (
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-slate-900">Habitat dan Ekologi</h3>
                <p className="text-base leading-relaxed text-slate-700">{flora.habitat}</p>
              </div>
            )}

            {flora.sebaran?.length ? (
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-slate-900">Sebaran Wilayah</h3>
                <ul className="flex flex-wrap gap-2 text-sm text-slate-600">
                  {flora.sebaran.map((wilayah) => (
                    <li key={wilayah} className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                      {wilayah}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {flora.koordinat && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Sebaran Geografis</h3>
                <LeafletMap
                  height="320px"
                  markers={[
                    {
                      id: flora.id,
                      position: [flora.koordinat.lat, flora.koordinat.lng],
                      title: flora.nama_ilmiah,
                      description: flora.wilayah,
                    },
                  ]}
                  scrollWheelZoom={false}
                  zoom={8}
                  ariaLabel={`Peta sebaran ${flora.nama_ilmiah}`}
                />
                <p className="text-xs text-slate-500">
                  Koordinat yang ditampilkan bersifat indikatif untuk tujuan visualisasi.
                </p>
              </div>
            )}
          </article>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6">
              <h2 className="text-lg font-semibold text-emerald-800">Taksonomi</h2>
              <dl className="mt-4 space-y-3 text-sm text-slate-700">
                {taxonomyEntries(flora).map((entry) => (
                  <div key={entry.label} className="flex justify-between gap-4">
                    <dt className="font-medium text-slate-600">{entry.label}</dt>
                    <dd className="text-right text-slate-800">{entry.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Status Konservasi</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Status IUCN menggambarkan tingkat keterancaman spesies. Gunakan informasi ini untuk menentukan prioritas
                tindakan konservasi serta kebutuhan monitoring populasi di lapangan.
              </p>
              <Link
                href="https://www.iucnredlist.org/"
                className="mt-4 inline-flex text-sm font-semibold text-emerald-600 hover:text-emerald-500"
              >
                Pelajari panduan IUCN
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Gallery Section */}
      {!loadingGallery && galleryImages.length > 0 && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Galeri Foto</h2>
            <p className="text-sm text-slate-600">
              Koleksi foto tambahan untuk {flora.nama_ilmiah}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {galleryImages.map((image) => (
              <div key={image.id} className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <div className="aspect-square relative">
                  <Image
                    src={image.image_url}
                    alt={image.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-slate-900 text-sm">{image.title}</h3>
                  {image.description && (
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">{image.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {flora.konten_terkait?.length ? (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Spesies Terkait</h2>
            <p className="text-sm text-slate-600">
              Temukan spesies dengan karakteristik serupa untuk memperluas konteks taksonomi dan konservasi.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {flora.konten_terkait.map((related) => (
              <EntityCard
                key={related.id}
                href={`/flora/${related.id}`}
                title={related.nama_ilmiah}
                subtitle={related.nama_umum ?? ''}
                image={related.gambar_utama}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
