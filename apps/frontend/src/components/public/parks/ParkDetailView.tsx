'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Separator } from '../../ui/separator';
import { ScrollArea } from '../../ui/scroll-area';
import { Button } from '../../ui/button';
import { MapPin, Ruler, Info, Calendar, Map, Globe, Shield, Users, TreePine, Sprout, PawPrint, BookOpen, ArrowRight, ExternalLink, Activity, Camera } from 'lucide-react';
import { formatDate } from '../../../lib/utils';
import { getParkStats } from '../../../lib/api/client';
import type { ParkDetail } from '../../../types/parks';
import { ParkFlora } from './ParkFlora';
import { ParkFauna } from './ParkFauna';
import { ParkActivities } from '../activities/ParkActivities';

interface ParkDetailViewProps {
  park: ParkDetail;
}

interface Gallery {
  id: number;
  title: string;
  image_url: string;
  status: string;
}

export function ParkDetailView({ park }: ParkDetailViewProps) {
  const [scrollY, setScrollY] = useState(0);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadGalleries();
  }, [park.id]);

  const loadGalleries = async () => {
    try {
      setLoadingGallery(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/galleries/entity/park/${park.id}`
      );
      
      if (response.ok) {
        const result = await response.json();
        console.log('Gallery response:', result);
        setGalleries(result.data || result.items || []);
      } else {
        console.error('Gallery load failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to load galleries:', error);
    } finally {
      setLoadingGallery(false);
    }
  };

  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}`;
  };

  // Use stats from park data directly
  const stats = park.statistik || {
    flora: 0,
    fauna: 0,
    kegiatan: 0,
    galeri: 0,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          {park.gambar_utama ? (
            <Image
              src={getImageUrl(park.gambar_utama)}
              alt={park.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-800 via-green-700 to-blue-800" />
          )}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent" />

        {/* Content */}
        <div className="relative z-10 h-full flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <Badge 
                  variant={park.status === 'published' ? 'default' : 'secondary'} 
                  className="text-sm bg-green-800 hover:bg-green-700 text-white"
                >
                  {park.status === 'published' ? 'Dipublikasikan' : 'Draft'}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-semibold text-white mb-4 drop-shadow-lg">
                {park.name}
              </h1>
              <div className="flex items-center text-white/90 mb-6">
                <MapPin className="mr-2 h-5 w-5" />
                <span>{park.region_name || 'Indonesia'}</span>
                {park.area_ha && (
                  <>
                    <span className="mx-3">•</span>
                    <Ruler className="mr-2 h-5 w-5" />
                    <span>{park.area_ha} hektar</span>
                  </>
                )}
              </div>
              {park.description && (
                <p className="text-lg text-white/90 max-w-2xl leading-relaxed">
                  {park.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Flora Count */}
            <Link href={`/flora?taman=${park.id}`} className="group">
              <div className="text-gray-900 flex flex-col gap-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-0 bg-gradient-to-br from-green-50 to-green-100">
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Sprout className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-green-800 mb-2">
                    {stats.flora}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Spesies Flora</h3>
                  <p className="text-sm text-gray-600 mb-4">Tumbuhan di taman ini</p>
                  <div className="flex items-center justify-center text-green-800 group-hover:text-green-700">
                    <span className="text-sm font-medium">Lihat Detail</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Fauna Count */}
            <Link href={`/fauna?taman=${park.id}`} className="group">
              <div className="text-gray-900 flex flex-col gap-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <PawPrint className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-blue-800 mb-2">
                    {stats.fauna}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Spesies Fauna</h3>
                  <p className="text-sm text-gray-600 mb-4">Hewan di taman ini</p>
                  <div className="flex items-center justify-center text-blue-800 group-hover:text-blue-700">
                    <span className="text-sm font-medium">Lihat Detail</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Activities Count */}
            <Link href={`/kegiatan?taman=${park.id}`} className="group">
              <div className="text-gray-900 flex flex-col gap-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-0 bg-gradient-to-br from-emerald-50 to-emerald-100">
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-800 mb-2">
                    {stats.kegiatan || 0}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Kegiatan</h3>
                  <p className="text-sm text-gray-600 mb-4">Aktivitas di taman ini</p>
                  <div className="flex items-center justify-center text-emerald-800 group-hover:text-emerald-700">
                    <span className="text-sm font-medium">Lihat Detail</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* About Park Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {park.description && (
                <section className="space-y-3">
                  <h2 className="text-2xl font-semibold text-slate-900">Tentang Taman</h2>
                  <p className="whitespace-pre-line text-base leading-relaxed text-slate-700">
                    {park.description}
                  </p>
                </section>
              )}

              {/* SK Penetapan */}
              {park.sk_penetapan && (
                <section className="space-y-3">
                  <h3 className="text-xl font-semibold text-slate-900">SK Penetapan</h3>
                  <p className="whitespace-pre-line text-base leading-relaxed text-slate-700">
                    {park.sk_penetapan}
                  </p>
                </section>
              )}

              {/* Sejarah */}
              {park.sejarah && (
                <section className="space-y-3">
                  <h3 className="text-xl font-semibold text-slate-900">Sejarah</h3>
                  <p className="whitespace-pre-line text-base leading-relaxed text-slate-700">
                    {park.sejarah}
                  </p>
                </section>
              )}

              {/* Visi & Misi */}
              {(park.visi || park.misi) && (
                <section className="space-y-3">
                  <h3 className="text-xl font-semibold text-slate-900">Visi & Misi</h3>
                  <div className="space-y-4">
                    {park.visi && (
                      <div>
                        <h4 className="text-lg font-semibold text-slate-800 mb-2">Visi</h4>
                        <p className="text-slate-700 leading-relaxed">{park.visi}</p>
                      </div>
                    )}
                    {park.misi && (
                      <div>
                        <h4 className="text-lg font-semibold text-slate-800 mb-2">Misi</h4>
                        <p className="text-slate-700 leading-relaxed">{park.misi}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Nilai Penting */}
              {park.nilai_penting && (
                <section className="space-y-3">
                  <h3 className="text-xl font-semibold text-slate-900">Nilai Penting</h3>
                  <p className="whitespace-pre-line text-base leading-relaxed text-slate-700">
                    {park.nilai_penting}
                  </p>
                </section>
              )}

              {/* Kondisi Fisik */}
              {park.kondisi_fisik && (
                <section className="space-y-3">
                  <h3 className="text-xl font-semibold text-slate-900">Kondisi Fisik</h3>
                  <p className="whitespace-pre-line text-base leading-relaxed text-slate-700">
                    {park.kondisi_fisik}
                  </p>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Quick Info */}
              <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6">
                <h2 className="text-lg font-semibold text-green-800">Informasi Cepat</h2>
                <dl className="mt-4 space-y-3 text-sm text-slate-700">
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-slate-600">Status</dt>
                    <dd className="text-right text-slate-800">
                      <Badge 
                        variant={park.status === 'approved' ? 'default' : 'secondary'}
                        className={park.status === 'approved' 
                          ? 'bg-green-800 hover:bg-green-700 text-white' 
                          : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {park.status === 'approved' ? 'Published' : 'Draft'}
                      </Badge>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-slate-600">Wilayah</dt>
                    <dd className="text-right text-slate-800">{park.region_name || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-slate-600">Pengelola</dt>
                    <dd className="text-right text-slate-800">{park.pengelola || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-slate-600">Tipe Ekoregion</dt>
                    <dd className="text-right text-slate-800">{park.tipe_ekoregion || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-slate-600">Luas</dt>
                    <dd className="text-right text-slate-800">{park.area_ha} ha</dd>
                  </div>
                </dl>
              </div>

              {/* Time Info */}
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-blue-800">Informasi Waktu</h2>
                <dl className="mt-4 space-y-3 text-sm text-slate-700">
                  <div>
                    <dt className="font-medium text-slate-600">Dibuat</dt>
                    <dd className="text-sm font-semibold text-slate-800">
                      {park.created_at ? formatDate(park.created_at) : 'Tidak tersedia'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-600">Diperbarui</dt>
                    <dd className="text-sm font-semibold text-slate-800">
                      {park.updated_at ? formatDate(park.updated_at) : 'Tidak tersedia'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Location */}
              <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-blue-50 p-6 shadow-sm">
                <h2 className="text-lg font-semibold bg-gradient-to-r from-green-800 to-blue-800 bg-clip-text text-transparent">
                  Lokasi
                </h2>
                <div className="mt-4">
                  {park.latitude && park.longitude ? (
                    <div className="space-y-4">
                      <div className="aspect-video bg-gradient-to-br from-green-200 to-blue-200 rounded-lg overflow-hidden">
                        <iframe
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${park.longitude - 0.01},${park.latitude - 0.01},${park.longitude + 0.01},${park.latitude + 0.01}&layer=mapnik&marker=${park.latitude},${park.longitude}`}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title={`Peta ${park.name}`}
                        />
                      </div>
                      <div className="text-sm text-slate-600">
                        <p><span className="font-medium">Koordinat:</span> {park.latitude}, {park.longitude}</p>
                        <p><span className="font-medium">Alamat:</span> {park.desa_kelurahan}, {park.kecamatan}, {park.kota_kabupaten}, {park.provinsi}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full border-green-800 text-green-800 hover:bg-green-800 hover:text-white"
                        onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${park.latitude}&mlon=${park.longitude}&zoom=15`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Buka di Peta
                      </Button>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-green-200 to-blue-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Map className="w-12 h-12 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-green-800 font-medium">Peta Interaktif</p>
                        <p className="text-xs text-blue-600">Koordinat tidak tersedia</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>


      {/* Flora Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Spesies Flora</h2>
                <p className="mt-1 text-sm text-slate-600">Keanekaragaman tumbuhan di taman ini</p>
              </div>
              <Link
                href={`/flora?taman=${park.id}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-green-800 hover:text-green-700 transition-colors"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ParkFlora parkId={park.id} />
          </div>
        </div>
      </section>

      {/* Fauna Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Spesies Fauna</h2>
                <p className="mt-1 text-sm text-slate-600">Keanekaragaman hewan di taman ini</p>
              </div>
              <Link
                href={`/fauna?taman=${park.id}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-800 hover:text-blue-700 transition-colors"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ParkFauna parkId={park.id} />
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Kegiatan Taman</h2>
                <p className="mt-1 text-sm text-slate-600">Aktivitas dan kegiatan yang dilakukan di taman ini</p>
              </div>
              <Link
                href={`/kegiatan?taman=${park.id}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-emerald-800 hover:text-emerald-700 transition-colors"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ParkActivities parkId={park.id} parkName={park.name} />
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {galleries.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                    <Camera className="h-6 w-6 text-purple-600" />
                    Galeri Foto
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {galleries.length} foto dari taman konservasi ini
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleries.map((gallery) => (
                  <div 
                    key={gallery.id} 
                    className="aspect-square relative rounded-xl overflow-hidden bg-slate-200 group cursor-pointer shadow-md hover:shadow-xl transition-shadow"
                  >
                    <Image
                      src={getImageUrl(gallery.image_url)}
                      alt={gallery.title || 'Foto taman'}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    {gallery.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white text-sm font-medium truncate">
                          {gallery.title}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}