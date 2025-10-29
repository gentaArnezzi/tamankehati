'use client';

import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { type FaunaDetail } from '../../../types/fauna';
import { Badge } from '../../ui/badge';
import { EntityCard } from '../cards/EntityCard';
import { JsonLd } from '../seo/JsonLd';
import { MapPin, ArrowRight } from 'lucide-react';

// Dynamically import LeafletMap with SSR disabled to avoid "window is not defined" error
const LeafletMap = dynamic(
  () => import('../map/LeafletMap').then((mod) => mod.LeafletMap),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[320px] bg-slate-100 rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-slate-500 text-sm">Memuat peta...</p>
      </div>
    )
  }
);

type FaunaDetailViewProps = {
  fauna: FaunaDetail;
};

type GalleryImage = {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  created_at?: string;
};

const taxonomyEntries = (fauna: FaunaDetail) =>
  [
    { label: 'Nama ilmiah', value: fauna.nama_ilmiah },
    { label: 'Nama umum', value: fauna.nama_umum },
    { label: 'Famili', value: fauna.famili },
    { label: 'Genus', value: fauna.genus },
    { label: 'Spesies', value: fauna.spesies },
    { label: 'Ordo', value: fauna.ordo },
    { label: 'Status IUCN', value: fauna.status_iucn },
    { label: 'Habitat', value: fauna.habitat },
    { label: 'Sebaran', value: fauna.sebaran?.join(', ') },
  ].filter((entry) => entry.value);

export function FaunaDetailView({ fauna }: FaunaDetailViewProps) {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        // Fetch directly from backend API
        const response = await fetch(`http://localhost:8000/api/public/fauna/${fauna.id}/gallery`);
        if (response.ok) {
          const data = await response.json();
          console.log('Fauna Gallery data fetched:', data);
          setGalleryImages(data.gallery_images || []);
        } else {
          console.warn('Fauna Gallery fetch failed:', response.status);
        }
      } catch (error) {
        console.error('Error fetching fauna gallery images:', error);
      } finally {
        setLoadingGallery(false);
      }
    };

    fetchGalleryImages();
  }, [fauna.id]);

  const heroImage =
    fauna.gambar_utama && fauna.gambar_utama.trim()
      ? (fauna.gambar_utama.startsWith('http') ? fauna.gambar_utama : `http://localhost:8000${fauna.gambar_utama}`)
      : 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&auto=format&fit=crop';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Taxon',
    name: fauna.nama_ilmiah,
    alternateName: fauna.nama_umum,
    description: fauna.deskripsi,
    conservationStatus: fauna.status_iucn,
    habitat: fauna.habitat,
    image: fauna.gambar_utama,
    geographicDistribution: fauna.sebaran,
  };

  return (
    <div className="space-y-12">
      <JsonLd data={jsonLd} />
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-[320px] w-full md:h-[420px]">
          <Image
            src={heroImage}
            alt={fauna.nama_ilmiah}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 960px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="flex flex-wrap items-center gap-3">
              {fauna.status_iucn && (
                <Badge className="bg-slate-900 text-white hover:bg-slate-800">{fauna.status_iucn}</Badge>
              )}
              {fauna.wilayah && (
                <Badge variant="outline" className="border-white/40 bg-white/10 text-white">
                  {fauna.wilayah}
                </Badge>
              )}
              {fauna.is_endemic && (
                <Badge className="bg-slate-700 text-white hover:bg-slate-600">
                  Endemik Indonesia
                </Badge>
              )}
            </div>
            <h1 className="mt-4 text-3xl font-light text-white md:text-4xl lg:text-5xl">{fauna.nama_ilmiah}</h1>
            {fauna.nama_umum && (
              <p className="text-lg text-white/80 md:text-xl">
                {fauna.nama_umum}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-8 p-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:p-12">
          <article className="space-y-8">
            {/* Deskripsi */}
            {fauna.deskripsi && (
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-slate-900">Deskripsi</h2>
                <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">
                  {fauna.deskripsi}
                </p>
              </div>
            )}

            {/* Morfologi */}
            {fauna.morfologi && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-slate-900">Morfologi</h3>
                <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">
                  {fauna.morfologi}
                </p>
              </div>
            )}

            {/* Habitat dan Ekologi */}
            {fauna.habitat && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-slate-900">Habitat dan Ekologi</h3>
                <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">
                  {fauna.habitat}
                </p>
              </div>
            )}

            {/* Habitat Sumber Makanan */}
            {fauna.habitat_sumber_makanan && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-slate-900">Habitat dan Sumber Makanan</h3>
                <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">
                  {fauna.habitat_sumber_makanan}
                </p>
              </div>
            )}

            {/* Sebaran Wilayah */}
            {fauna.sebaran?.length ? (
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-slate-900">Sebaran Wilayah</h3>
                <ul className="flex flex-wrap gap-2 text-sm text-slate-600">
                  {fauna.sebaran.map((wilayah) => (
                    <li key={wilayah} className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                      {wilayah}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Peta Geografis */}
            {fauna.koordinat && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-slate-900">Sebaran Geografis</h3>
                <LeafletMap
                  height="320px"
                  markers={[
                    {
                      id: fauna.id,
                      position: [fauna.koordinat.lat, fauna.koordinat.lng],
                      title: fauna.nama_ilmiah,
                      description: fauna.wilayah,
                    },
                  ]}
                  scrollWheelZoom={false}
                  zoom={7}
                  ariaLabel={`Peta sebaran ${fauna.nama_ilmiah}`}
                />
                <p className="text-xs text-slate-500">
                  Koordinat yang ditampilkan bersifat indikatif untuk tujuan visualisasi.
                </p>
              </div>
            )}
          </article>

          <aside className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-medium text-slate-900">Taksonomi</h2>
              <dl className="mt-4 space-y-3 text-sm text-slate-700">
                {taxonomyEntries(fauna).map((entry) => (
                  <div key={entry.label} className="flex justify-between gap-4">
                    <dt className="font-medium text-slate-600">{entry.label}</dt>
                    <dd className="text-right text-slate-800">{entry.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Park Information */}
            {fauna.park_info && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-medium text-slate-900">Informasi Taman</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-slate-600">Nama Taman</dt>
                    <dd className="text-right text-slate-800">
                      <Link 
                        href={`/taman/${fauna.park_info.id}`}
                        className="text-slate-900 hover:text-slate-600 hover:underline transition-colors font-medium"
                      >
                        {fauna.park_info.name}
                      </Link>
                    </dd>
                  </div>
                  {fauna.park_info.area_ha && (
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-slate-600">Luas Area</dt>
                      <dd className="text-right text-slate-800">{fauna.park_info.area_ha} ha</dd>
                    </div>
                  )}
                  {fauna.park_info.pengelola && (
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-slate-600">Pengelola</dt>
                      <dd className="text-right text-slate-800">{fauna.park_info.pengelola}</dd>
                    </div>
                  )}
                  {fauna.park_info.tipe_ekoregion && (
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-slate-600">Tipe Ekoregion</dt>
                      <dd className="text-right text-slate-800">{fauna.park_info.tipe_ekoregion}</dd>
                    </div>
                  )}
                  {fauna.park_info.description && (
                    <div className="mt-3">
                      <dt className="font-medium text-slate-600 mb-2">Deskripsi Taman</dt>
                      <dd className="text-sm text-slate-700 leading-relaxed">{fauna.park_info.description}</dd>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <Link 
                    href={`/taman/${fauna.park_info.id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 hover:text-slate-600 hover:underline transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    Lihat Detail Taman
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-medium text-slate-900">Status Perlindungan</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Informasi status IUCN dan perlindungan nasional digunakan untuk menyusun prioritas intervensi serta edukasi
                masyarakat.
              </p>
              <Link
                href="https://ksdae.menlhk.go.id/info-bksda/"
                className="mt-4 inline-flex text-sm font-medium text-slate-900 hover:text-slate-600"
              >
                Lihat pedoman perlindungan satwa
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Gallery Section */}
      {!loadingGallery && galleryImages.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-light text-slate-900">Galeri Foto</h2>
              <p className="mt-1 text-sm text-slate-600">
                Koleksi {galleryImages.length} foto untuk <span className="italic">{fauna.nama_ilmiah}</span>
              </p>
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex border-slate-200 text-slate-700">
              {galleryImages.length} {galleryImages.length === 1 ? 'Foto' : 'Foto'}
            </Badge>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {galleryImages.map((image, index) => (
              <div 
                key={image.id} 
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg hover:border-slate-300"
              >
                <div className="aspect-square relative overflow-hidden bg-slate-100">
                  <Image
                    src={image.image_url.startsWith('http') ? image.image_url : `http://localhost:8000${image.image_url}`}
                    alt={image.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 text-slate-700 hover:bg-white border-slate-200">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="font-medium text-slate-900 text-sm line-clamp-1">{image.title}</h3>
                  {image.description && (
                    <p className="text-xs text-slate-600 line-clamp-2">{image.description}</p>
                  )}
                  {image.created_at && (
                    <p className="text-xs text-slate-400 pt-1">
                      {new Date(image.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {loadingGallery && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-light text-slate-900">Galeri Foto</h2>
            <p className="mt-1 text-sm text-slate-600">Memuat galeri foto...</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-slate-200 rounded-xl" />
                <div className="mt-3 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty Gallery State */}
      {!loadingGallery && galleryImages.length === 0 && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-light text-slate-900">Galeri Foto</h2>
            <p className="mt-1 text-sm text-slate-600">
              Koleksi foto untuk <span className="italic">{fauna.nama_ilmiah}</span>
            </p>
          </div>
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-4 text-sm font-medium text-slate-900">Belum ada foto galeri</h3>
            <p className="mt-2 text-sm text-slate-500">
              Galeri foto untuk spesies ini belum tersedia atau masih dalam proses persetujuan.
            </p>
          </div>
        </section>
      )}

      {fauna.konten_terkait?.length ? (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-light text-slate-900">Satwa Terkait</h2>
            <p className="text-sm text-slate-600">
              Kumpulan satwa dengan habitat serupa untuk mendukung pembelajaran lintas spesies.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {fauna.konten_terkait.map((related) => (
              <EntityCard
                key={related.id}
                href={`/fauna/${related.id}`}
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
