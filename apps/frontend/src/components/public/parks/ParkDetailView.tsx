'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Separator } from '../../ui/separator';
import { ScrollArea } from '../../ui/scroll-area';
import { Button } from '../../ui/button';
import { MapPin, Ruler, Info, Calendar, Map, Globe, Shield, Users, TreePine, Sprout, PawPrint, BookOpen, ArrowRight, ExternalLink } from 'lucide-react';
import { formatDate } from '../../../lib/utils';
import { getParkStats } from '../../../lib/api/client';
import type { ParkDetail } from '../../../types/parks';
import { ParkActivities } from '../activities/ParkActivities';
import { ParkFlora } from './ParkFlora';
import { ParkFauna } from './ParkFauna';
import { ParkArticles } from './ParkArticles';

interface ParkDetailViewProps {
  park: ParkDetail;
}

export function ParkDetailView({ park }: ParkDetailViewProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use stats from park data directly
  const stats = park.statistik || {
    flora: 0,
    fauna: 0,
    artikel: 0,
    galeri: 0,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          {park.galeri && park.galeri.length > 0 ? (
            <Image
              src={park.galeri[0].url || '/placeholder.svg'}
              alt={park.galeri[0].judul || park.name}
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

            {/* Articles Count */}
            <Link href={`/artikel?taman=${park.id}`} className="group">
              <div className="text-gray-900 flex flex-col gap-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-0 bg-gradient-to-br from-green-50 to-blue-50">
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-800 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-800 to-blue-800 bg-clip-text text-transparent mb-2">
                    {stats.artikel}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Artikel</h3>
                  <p className="text-sm text-gray-600 mb-4">Tentang taman ini</p>
                  <div className="flex items-center justify-center text-green-800 group-hover:text-blue-800">
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
                        {park.status === 'approved' ? 'Disetujui' : 'Draft'}
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
                      {formatDate(park.created_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-600">Diperbarui</dt>
                    <dd className="text-sm font-semibold text-slate-800">
                      {formatDate(park.updated_at)}
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
                  <div className="aspect-video bg-gradient-to-br from-green-200 to-blue-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Map className="w-12 h-12 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-green-800 font-medium">Peta Interaktif</p>
                      <p className="text-xs text-blue-600">Akan segera tersedia</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 border-green-800 text-green-800 hover:bg-green-800 hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Lihat di Peta
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="py-16 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="container mx-auto px-4">
          <ParkActivities parkId={park.id} parkName={park.name} />
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

      {/* Articles Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Artikel Terkait</h2>
                <p className="mt-1 text-sm text-slate-600">Artikel dan berita tentang taman ini</p>
              </div>
              <Link
                href={`/artikel?taman=${park.id}`}
                className="inline-flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-green-800 to-blue-800 bg-clip-text text-transparent hover:from-green-700 hover:to-blue-700 transition-colors"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ParkArticles parkId={park.id} />
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {park.galeri && park.galeri.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Galeri Foto</h2>
                <p className="mt-1 text-sm text-slate-600">Koleksi foto taman konservasi</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {park.galeri.slice(0, 6).map((image, index) => (
                  <div key={index} className="aspect-square relative rounded-xl overflow-hidden bg-slate-200 group">
                    <Image
                      src={image.url || '/placeholder.svg'}
                      alt={image.judul || `Gambar ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
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