'use client';

import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { type FloraDetail } from '../../../types/flora';
import { Badge } from '../../ui/badge';
import { EntityCard } from '../cards/EntityCard';
import { JsonLd } from '../seo/JsonLd';
import { MapPin, ArrowRight, ArrowLeft, Home } from 'lucide-react';
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../ui/breadcrumb';
import { ImageWithFallback } from '../../ui/image-with-fallback';

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
    { label: 'Sinonim', value: flora.sinonim },
    { label: 'Famili', value: flora.famili },
    { label: 'Genus', value: flora.genus },
    { label: 'Spesies', value: flora.spesies },
    { label: 'Ordo', value: flora.ordo },
    { label: 'Status IUCN', value: flora.status_iucn },
  ].filter((entry) => entry.value);

export function FloraDetailView({ flora }: FloraDetailViewProps) {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        // Fetch directly from backend API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}/api/public/flora/${flora.id}/gallery`);
        if (response.ok) {
          const data = await response.json();
          console.log('Gallery data fetched:', data);
          setGalleryImages(data.gallery_images || []);
        } else {
          console.warn('Gallery fetch failed:', response.status);
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      } finally {
        setLoadingGallery(false);
      }
    };

    fetchGalleryImages();
  }, [flora.id]);

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
    <div className="space-y-0 pb-12 bg-white">
      <JsonLd data={jsonLd} />

      {/* Hero Section - Full Width with Breadcrumb Overlay */}
      <section className="relative -mx-6 md:-mx-8 lg:-mx-12">
        <div className="relative h-[400px] w-full md:h-[500px] lg:h-[600px]">
          <ImageWithFallback
            src={flora.gambar_utama}
            alt={flora.nama_ilmiah}
            title={flora.nama_umum || flora.nama_ilmiah}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 960px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
          
          {/* Breadcrumb & Back Button Overlay - Top */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent pt-8 pb-16 z-20">
            <div className="container mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
              <div className="flex items-center justify-between gap-4">
                {/* Back Button */}
                <Link
                  href="/flora"
                  className="inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition-colors backdrop-blur-sm bg-black/20 hover:bg-black/30 px-3 py-2 rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Kembali</span>
                </Link>

                {/* Breadcrumb */}
                <Breadcrumb>
                  <BreadcrumbList className="text-white/80">
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/" className="flex items-center gap-1 hover:text-white transition-colors">
                          <Home className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Beranda</span>
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-white/50" />
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/flora" className="hover:text-white transition-colors">Flora</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-white/50" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="max-w-[200px] sm:max-w-none truncate text-white">
                        {flora.nama_umum || flora.nama_ilmiah}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
          </div>

          {/* Title & Badges - Bottom */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="container mx-auto max-w-7xl px-6 md:px-8 lg:px-12 py-8 md:py-12">
            <div className="flex flex-wrap items-center gap-3">
              {flora.status_iucn && (
                <Badge className="bg-slate-900 text-white hover:bg-slate-800">{flora.status_iucn}</Badge>
              )}
              {flora.wilayah && (
                <Badge variant="outline" className="border-white/40 bg-white/10 text-white">
                  {flora.wilayah}
                </Badge>
              )}
              {flora.is_endemic && (
                <Badge className="bg-slate-700 text-white hover:bg-slate-600">
                  Endemik Indonesia
                </Badge>
              )}
            </div>
            <h1 className="mt-4 text-3xl font-light text-white md:text-4xl lg:text-5xl">{flora.nama_ilmiah}</h1>
            {flora.nama_umum && (
              <p className="text-lg text-white/80 md:text-xl">
                {flora.nama_umum}
              </p>
            )}
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="px-6 md:px-8 lg:px-12">
        <section className="bg-white mt-12">
          <div className="container mx-auto max-w-7xl py-12">
          <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <article className="space-y-8">
            {/* Deskripsi */}
            {flora.deskripsi && (
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-slate-900">Deskripsi</h2>
                <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">
                  {flora.deskripsi}
                </p>
              </div>
            )}

            {/* Morfologi */}
            {flora.morfologi && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-slate-900">Morfologi</h3>
                <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">
                  {flora.morfologi}
                </p>
              </div>
            )}

            {/* Gambar Detail Flora */}
            {(flora.gambar_daun || flora.gambar_batang || flora.gambar_bunga || flora.gambar_buah) && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium text-slate-900">Dokumentasi Detail</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Gambar detail morfologi untuk identifikasi lebih akurat
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {flora.gambar_daun && (
                    <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                      <div className="aspect-square relative overflow-hidden bg-slate-100">
                        <Image
                          src={flora.gambar_daun.startsWith('http') ? flora.gambar_daun : `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}${flora.gambar_daun}`}
                          alt={`Pertelaan daun ${flora.nama_ilmiah}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="p-3 border-t border-slate-100">
                        <h4 className="text-sm font-medium text-slate-900">Pertelaan Daun</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Detail struktur daun</p>
                      </div>
                    </div>
                  )}
                  
                  {flora.gambar_batang && (
                    <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                      <div className="aspect-square relative overflow-hidden bg-slate-100">
                        <Image
                          src={flora.gambar_batang.startsWith('http') ? flora.gambar_batang : `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}${flora.gambar_batang}`}
                          alt={`Batang dan percabangan ${flora.nama_ilmiah}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="p-3 border-t border-slate-100">
                        <h4 className="text-sm font-medium text-slate-900">Batang</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Batang & percabangan</p>
                      </div>
                    </div>
                  )}
                  
                  {flora.gambar_bunga && (
                    <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                      <div className="aspect-square relative overflow-hidden bg-slate-100">
                        <Image
                          src={flora.gambar_bunga.startsWith('http') ? flora.gambar_bunga : `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}${flora.gambar_bunga}`}
                          alt={`Bunga ${flora.nama_ilmiah}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="p-3 border-t border-slate-100">
                        <h4 className="text-sm font-medium text-slate-900">Bunga</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Detail struktur bunga</p>
                      </div>
                    </div>
                  )}
                  
                  {flora.gambar_buah && (
                    <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                      <div className="aspect-square relative overflow-hidden bg-slate-100">
                        <Image
                          src={flora.gambar_buah.startsWith('http') ? flora.gambar_buah : `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}${flora.gambar_buah}`}
                          alt={`Buah ${flora.nama_ilmiah}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="p-3 border-t border-slate-100">
                        <h4 className="text-sm font-medium text-slate-900">Buah</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Detail struktur buah</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Habitat */}
            {flora.habitat && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-slate-900">Habitat dan Ekologi</h3>
                <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">
                  {flora.habitat}
                </p>
              </div>
            )}

            {/* Manfaat */}
            {flora.manfaat && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-slate-900">Manfaat dan Kegunaan</h3>
                <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">
                  {flora.manfaat}
                </p>
              </div>
            )}

            {/* Informasi Tambahan */}
            {(flora.sinonim || flora.waktu_berbunga || flora.penyebaran || flora.metode_perbanyakan) && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-slate-900">Informasi Tambahan</h3>
                <dl className="grid gap-4 sm:grid-cols-2">
                  {flora.sinonim && (
                    <div className="space-y-1">
                      <dt className="text-sm font-medium text-slate-600">Sinonim</dt>
                      <dd className="text-base text-slate-800 italic">{flora.sinonim}</dd>
                    </div>
                  )}
                  {flora.waktu_berbunga && (
                    <div className="space-y-1">
                      <dt className="text-sm font-medium text-slate-600">Waktu Berbunga</dt>
                      <dd className="text-base text-slate-800">{flora.waktu_berbunga}</dd>
                    </div>
                  )}
                  {flora.penyebaran && (
                    <div className="space-y-1 sm:col-span-2">
                      <dt className="text-sm font-medium text-slate-600">Penyebaran</dt>
                      <dd className="text-base text-slate-800 whitespace-pre-line">{flora.penyebaran}</dd>
                    </div>
                  )}
                  {flora.metode_perbanyakan && (
                    <div className="space-y-1 sm:col-span-2">
                      <dt className="text-sm font-medium text-slate-600">Metode Perbanyakan</dt>
                      <dd className="text-base text-slate-800 whitespace-pre-line">{flora.metode_perbanyakan}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Referensi */}
            {flora.referensi && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-slate-900">Referensi</h3>
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                    {flora.referensi}
                  </p>
                </div>
              </div>
            )}

            {/* Sebaran Wilayah */}
            {flora.sebaran?.length ? (
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-slate-900">Sebaran Wilayah</h3>
                <ul className="flex flex-wrap gap-2 text-sm text-slate-600">
                  {flora.sebaran.map((wilayah) => (
                    <li key={wilayah} className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                      {wilayah}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Peta Geografis */}
            {flora.koordinat && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-slate-900">Sebaran Geografis</h3>
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
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-medium text-slate-900">Taksonomi</h2>
              <dl className="mt-4 space-y-3 text-sm text-slate-700">
                {taxonomyEntries(flora).map((entry) => (
                  <div key={entry.label} className="flex justify-between gap-4">
                    <dt className="font-medium text-slate-600">{entry.label}</dt>
                    <dd className="text-right text-slate-800">{entry.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Park Information */}
            {flora.park_info && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-medium text-slate-900">Informasi Taman</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-slate-600">Nama Taman</dt>
                    <dd className="text-right text-slate-800">
                      <Link 
                        href={`/taman/${flora.park_info.id}`}
                        className="text-slate-900 hover:text-slate-600 hover:underline transition-colors font-medium"
                      >
                        {flora.park_info.name}
                      </Link>
                    </dd>
                  </div>
                  {flora.park_info.area_ha && (
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-slate-600">Luas Area</dt>
                      <dd className="text-right text-slate-800">{flora.park_info.area_ha} ha</dd>
                    </div>
                  )}
                  {flora.park_info.pengelola && (
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-slate-600">Pengelola</dt>
                      <dd className="text-right text-slate-800">{flora.park_info.pengelola}</dd>
                    </div>
                  )}
                  {flora.park_info.tipe_ekoregion && (
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-slate-600">Tipe Ekoregion</dt>
                      <dd className="text-right text-slate-800">{flora.park_info.tipe_ekoregion}</dd>
                    </div>
                  )}
                  {flora.park_info.description && (
                    <div className="mt-3">
                      <dt className="font-medium text-slate-600 mb-2">Deskripsi Taman</dt>
                      <dd className="text-sm text-slate-700 leading-relaxed">{flora.park_info.description}</dd>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <Link 
                    href={`/taman/${flora.park_info.id}`}
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
              <h2 className="text-lg font-medium text-slate-900">Status Konservasi</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Status IUCN menggambarkan tingkat keterancaman spesies. Gunakan informasi ini untuk menentukan prioritas
                tindakan konservasi serta kebutuhan monitoring populasi di lapangan.
              </p>
              <Link
                href="https://www.iucnredlist.org/"
                className="mt-4 inline-flex text-sm font-medium text-slate-900 hover:text-slate-600"
              >
                Pelajari panduan IUCN
              </Link>
            </div>
          </aside>
          </div>
          </div>
        </section>

        {/* Gallery Section */}
        {!loadingGallery && galleryImages.length > 0 && (
          <section className="space-y-6 mt-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-light text-slate-900">Galeri Foto</h2>
              <p className="mt-1 text-sm text-slate-600">
                Koleksi {galleryImages.length} foto untuk <span className="italic">{flora.nama_ilmiah}</span>
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
                    src={image.image_url.startsWith('http') ? image.image_url : `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}${image.image_url}`}
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
          <section className="space-y-6 mt-12">
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
          <section className="space-y-6 mt-12">
          <div>
            <h2 className="text-2xl font-light text-slate-900">Galeri Foto</h2>
            <p className="mt-1 text-sm text-slate-600">
              Koleksi foto untuk <span className="italic">{flora.nama_ilmiah}</span>
            </p>
          </div>
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
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

        {flora.konten_terkait?.length ? (
          <section className="space-y-6 mt-12">
          <div>
            <h2 className="text-2xl font-light text-slate-900">Spesies Terkait</h2>
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
    </div>
  );
}
