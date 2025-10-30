'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Separator } from '../../ui/separator';
import { ScrollArea } from '../../ui/scroll-area';
import { Button } from '../../ui/button';
import { MapPin, Ruler, Info, Calendar, Map, Globe, Shield, Users, TreePine, Sprout, PawPrint, BookOpen, ArrowRight, ExternalLink, Activity, Camera, ArrowLeft, ChevronRight, Home } from 'lucide-react';
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
        `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-zxb9.onrender.com'}/api/v1/galleries/entity/park/${park.id}`
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
    return `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-zxb9.onrender.com'}${url}`;
  };

  // Use stats from park data directly
  const stats = park.statistik || {
    flora: 0,
    fauna: 0,
    kegiatan: 0,
    galeri: 0,
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs & Back Button - Sticky Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between py-4">
            {/* Back Button */}
            <Link href="/taman">
              <Button 
                variant="ghost" 
                size="sm"
                className="gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200 font-semibold"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Kembali</span>
              </Button>
            </Link>

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm">
              <Link 
                href="/" 
                className="text-zinc-600 hover:text-emerald-700 transition-colors duration-200 flex items-center gap-1.5 font-semibold"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Beranda</span>
              </Link>
              <ChevronRight className="h-4 w-4 text-zinc-400" />
              <Link 
                href="/taman" 
                className="text-zinc-600 hover:text-emerald-700 transition-colors duration-200 font-semibold"
              >
                Taman
              </Link>
              <ChevronRight className="h-4 w-4 text-zinc-400" />
              <span className="text-emerald-700 font-semibold truncate max-w-[150px] sm:max-w-xs">
                {park.name}
              </span>
            </nav>
          </div>
        </div>
      </div>

      {/* Hero Section - Black & White Minimalist */}
      <section className="relative overflow-hidden bg-black">
        {/* Background Image - More Visible */}
        <div className="absolute inset-0">
          {park.gambar_utama ? (
            <div className="relative w-full h-full">
            <Image
                src={getImageUrl(park.gambar_utama)}
                alt={park.name}
              fill
              className="object-cover"
              priority
            />
              {/* Subtle gradient overlay - only at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black" />
          )}
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-32 sm:py-40 lg:py-48">
          <div className="max-w-4xl space-y-6">
            {/* Status Badge - Emerald */}
            <div>
                <Badge 
                variant="outline"
                className="px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-300 border-emerald-400/30 backdrop-blur-sm hover:bg-emerald-500/20 transition-all"
                >
                {park.status === 'approved' ? 'AKTIF' : 'DRAFT'}
                </Badge>
              </div>

            {/* Title - Bold & Clean */}
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold text-white tracking-tight leading-[1.05]">
                {park.name}
              </h1>

            {/* Location & Area - Minimal */}
            <div className="flex flex-wrap items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span className="text-base">{park.provinsi || park.region_name || 'Indonesia'}</span>
              </div>
              {park.area_ha && (
                <>
                  <span className="text-white/40">•</span>
                  <div className="flex items-center gap-2">
                    <Ruler className="h-5 w-5" />
                    <span className="text-base">{park.area_ha.toLocaleString()} Ha</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom fade to white */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Stats Cards - Emerald Green Theme */}
      <section className="py-12 -mt-16 relative z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Flora */}
            <Link href={`/flora?taman=${park.id}`} className="group">
              <Card className="border border-emerald-100 hover:border-emerald-600 shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 rounded-full bg-emerald-700 group-hover:bg-emerald-800 transition-colors duration-300">
                    <Sprout className="w-8 h-8 text-white" />
                  </div>
                    <div>
                      <div className="text-5xl font-bold text-emerald-700">
                    {stats.flora}
                  </div>
                      <h3 className="text-sm font-semibold text-emerald-900 mt-3 uppercase tracking-wider">Spesies Flora</h3>
                      <p className="text-xs text-zinc-600 mt-1">Tumbuhan di taman ini</p>
                    </div>
                    <div className="flex items-center text-emerald-700 font-semibold text-sm group-hover:gap-3 gap-2 transition-all">
                      <span>Lihat Detail</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Fauna */}
            <Link href={`/fauna?taman=${park.id}`} className="group">
              <Card className="border border-emerald-100 hover:border-emerald-600 shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 rounded-full bg-emerald-700 group-hover:bg-emerald-800 transition-colors duration-300">
                    <PawPrint className="w-8 h-8 text-white" />
                  </div>
                    <div>
                      <div className="text-5xl font-bold text-emerald-700">
                    {stats.fauna}
                  </div>
                      <h3 className="text-sm font-semibold text-emerald-900 mt-3 uppercase tracking-wider">Spesies Fauna</h3>
                      <p className="text-xs text-zinc-600 mt-1">Hewan di taman ini</p>
                    </div>
                    <div className="flex items-center text-emerald-700 font-semibold text-sm group-hover:gap-3 gap-2 transition-all">
                      <span>Lihat Detail</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Activities */}
            <Link href={`/kegiatan?taman=${park.id}`} className="group">
              <Card className="border border-emerald-100 hover:border-emerald-600 shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 rounded-full bg-emerald-700 group-hover:bg-emerald-800 transition-colors duration-300">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                    <div>
                      <div className="text-5xl font-bold text-emerald-700">
                    {stats.kegiatan || 0}
                  </div>
                      <h3 className="text-sm font-semibold text-emerald-900 mt-3 uppercase tracking-wider">Kegiatan</h3>
                      <p className="text-xs text-zinc-600 mt-1">Aktivitas di taman ini</p>
                    </div>
                    <div className="flex items-center text-emerald-700 font-semibold text-sm group-hover:gap-3 gap-2 transition-all">
                      <span>Lihat Detail</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Description */}
              {park.description && (
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-emerald-700">Tentang Taman</h2>
                  <div className="h-1 w-20 bg-emerald-700" />
                  <p className="text-zinc-700 leading-relaxed text-lg whitespace-pre-line">
                    {park.description}
                  </p>
                </div>
              )}

              {/* SK Penetapan */}
              {park.sk_penetapan && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-emerald-700">SK Penetapan</h3>
                  <div className="h-1 w-16 bg-emerald-700" />
                  <p className="text-zinc-700 leading-relaxed whitespace-pre-line">
                    {park.sk_penetapan}
                  </p>
                </div>
              )}

              {/* Sejarah */}
              {park.sejarah && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-emerald-700">Sejarah</h3>
                  <div className="h-1 w-16 bg-emerald-700" />
                  <p className="text-zinc-700 leading-relaxed whitespace-pre-line">
                    {park.sejarah}
                  </p>
                </div>
              )}

              {/* Visi & Misi */}
              {(park.visi || park.misi) && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-emerald-700">Visi & Misi</h3>
                  <div className="h-1 w-16 bg-emerald-700" />
                  <div className="space-y-6">
                    {park.visi && (
                      <div className="border-l-4 border-emerald-700 pl-6 py-4">
                        <h4 className="text-sm font-semibold text-emerald-700 mb-3 uppercase tracking-wider">
                          Visi
                        </h4>
                        <p className="text-zinc-700 leading-relaxed">{park.visi}</p>
                      </div>
                    )}
                    {park.misi && (
                      <div className="border-l-4 border-emerald-700 pl-6 py-4">
                        <h4 className="text-sm font-semibold text-emerald-700 mb-3 uppercase tracking-wider">
                          Misi
                        </h4>
                        <p className="text-zinc-700 leading-relaxed">{park.misi}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Nilai Penting */}
              {park.nilai_penting && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-emerald-700">Nilai Penting</h3>
                  <div className="h-1 w-16 bg-emerald-700" />
                  <p className="text-zinc-700 leading-relaxed whitespace-pre-line">
                    {park.nilai_penting}
                  </p>
                </div>
              )}

              {/* Kondisi Fisik */}
              {park.kondisi_fisik && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-emerald-700">Kondisi Fisik</h3>
                  <div className="h-1 w-16 bg-emerald-700" />
                  <p className="text-zinc-700 leading-relaxed whitespace-pre-line">
                    {park.kondisi_fisik}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Quick Info Card */}
              <Card className="border border-emerald-100 shadow-sm bg-white">
                <CardHeader className="pb-4 border-b border-emerald-100">
                  <CardTitle className="text-emerald-700 flex items-center gap-2 text-sm uppercase tracking-wider font-semibold">
                    <Info className="h-4 w-4" />
                    Informasi Cepat
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-emerald-50">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</span>
                      <Badge 
                        className={park.status === 'approved' 
                          ? 'bg-emerald-700 hover:bg-emerald-800' 
                          : 'bg-zinc-400 hover:bg-zinc-500'
                        }
                      >
                        {park.status === 'approved' ? 'AKTIF' : 'DRAFT'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-emerald-50">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Provinsi</span>
                      <span className="text-sm text-emerald-700 font-semibold text-right">{park.provinsi || 'N/A'}</span>
                  </div>
                    <div className="flex justify-between items-center py-2 border-b border-emerald-50">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pengelola</span>
                      <span className="text-sm text-emerald-700 font-semibold text-right">{park.pengelola || 'N/A'}</span>
                  </div>
                    <div className="flex justify-between items-center py-2 border-b border-emerald-50">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ekoregion</span>
                      <span className="text-sm text-emerald-700 font-semibold text-right">{park.tipe_ekoregion || 'N/A'}</span>
                  </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Luas</span>
                      <span className="text-sm text-emerald-700 font-bold">{park.area_ha} ha</span>
                  </div>
                  </div>
                </CardContent>
              </Card>

              {/* Time Info Card */}
              <Card className="border border-emerald-100 shadow-sm bg-white">
                <CardHeader className="pb-4 border-b border-emerald-100">
                  <CardTitle className="text-emerald-700 flex items-center gap-2 text-sm uppercase tracking-wider font-semibold">
                    <Calendar className="h-4 w-4" />
                    Informasi Waktu
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 mb-1 uppercase tracking-wider">Dibuat</p>
                    <p className="text-sm font-semibold text-emerald-700">
                      {park.created_at ? formatDate(park.created_at) : 'Tidak tersedia'}
                    </p>
                  </div>
                  <Separator className="bg-emerald-100" />
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 mb-1 uppercase tracking-wider">Diperbarui</p>
                    <p className="text-sm font-semibold text-emerald-700">
                      {park.updated_at ? formatDate(park.updated_at) : 'Tidak tersedia'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Location Card */}
              <Card className="border border-emerald-100 shadow-sm bg-white">
                <CardHeader className="pb-4 border-b border-emerald-100">
                  <CardTitle className="text-emerald-700 flex items-center gap-2 text-sm uppercase tracking-wider font-semibold">
                    <MapPin className="h-4 w-4" />
                  Lokasi
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {park.latitude && park.longitude ? (
                    <>
                      <div className="aspect-video rounded-lg overflow-hidden border border-zinc-200">
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
                      <div className="text-sm space-y-2">
                        <p className="text-zinc-600">
                          <span className="font-semibold text-emerald-700">Koordinat:</span> {park.latitude}, {park.longitude}
                        </p>
                        <p className="text-zinc-600">
                          <span className="font-semibold text-emerald-700">Alamat:</span> {park.desa_kelurahan}, {park.kecamatan}, {park.kota_kabupaten}, {park.provinsi}
                        </p>
                      </div>
                      <Button 
                        variant="default" 
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                        onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${park.latitude}&mlon=${park.longitude}&zoom=15`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Buka di Peta
                      </Button>
                    </>
                  ) : (
                    <div className="aspect-video bg-zinc-100 rounded-lg flex items-center justify-center border border-zinc-200">
                      <div className="text-center">
                        <Map className="w-12 h-12 text-zinc-400 mx-auto mb-2" />
                        <p className="text-sm text-zinc-600 font-medium">Koordinat tidak tersedia</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {galleries.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-emerald-700 flex items-center gap-3">
                  <Camera className="h-8 w-8 text-emerald-700" />
                  Galeri Foto
                </h2>
                <div className="h-1 w-20 bg-emerald-700 mt-3" />
                <p className="mt-3 text-zinc-600 font-semibold">
                  {galleries.length} foto dari taman konservasi ini
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {galleries.map((gallery) => (
                  <div 
                    key={gallery.id} 
                    className="aspect-square relative rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 group cursor-pointer hover:shadow-lg transition-all duration-300"
                  >
                    <Image
                      src={getImageUrl(gallery.image_url)}
                      alt={gallery.title || 'Foto taman'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                    {gallery.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white text-sm font-medium">
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

      {/* Flora Section */}
      <section className="py-16 bg-emerald-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-emerald-700">Spesies Flora</h2>
                <div className="h-1 w-20 bg-emerald-700 mt-3" />
                <p className="mt-3 text-zinc-600 font-semibold">Keanekaragaman tumbuhan di taman ini</p>
              </div>
              <Link
                href={`/flora?taman=${park.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 text-white hover:bg-emerald-800 font-semibold transition-all duration-200 uppercase tracking-wider text-sm rounded-md shadow-md hover:shadow-lg"
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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-emerald-700">Spesies Fauna</h2>
                <div className="h-1 w-20 bg-emerald-700 mt-3" />
                <p className="mt-3 text-zinc-600 font-semibold">Keanekaragaman hewan di taman ini</p>
              </div>
              <Link
                href={`/fauna?taman=${park.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 text-white hover:bg-emerald-800 font-semibold transition-all duration-200 uppercase tracking-wider text-sm rounded-md shadow-md hover:shadow-lg"
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
      <section className="py-16 bg-emerald-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-emerald-700">Kegiatan Taman</h2>
                <div className="h-1 w-20 bg-emerald-700 mt-3" />
                <p className="mt-3 text-zinc-600 font-semibold">Aktivitas dan kegiatan yang dilakukan di taman ini</p>
              </div>
              <Link
                href={`/kegiatan?taman=${park.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 text-white hover:bg-emerald-800 font-semibold transition-all duration-200 uppercase tracking-wider text-sm rounded-md shadow-md hover:shadow-lg"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ParkActivities parkId={park.id} parkName={park.name} />
          </div>
        </div>
      </section>
    </div>
  );
}
