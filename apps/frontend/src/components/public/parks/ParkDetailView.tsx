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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      {/* Hero Section with Parallax */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        {/* Parallax Background */}
        <div
          className="absolute inset-0 w-full h-[120%]"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        >
          {park.galeri && park.galeri.length > 0 ? (
            <Image
              src={park.galeri[0].url || '/placeholder.svg'}
              alt={park.galeri[0].judul || park.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600" />
          )}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />

        {/* Content */}
        <div className="relative z-10 h-full flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant={park.status === 'published' ? 'default' : 'secondary'} className="text-sm">
                  {park.status === 'published' ? 'Dipublikasikan' : 'Draft'}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-light text-white mb-4 drop-shadow-lg">
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
              <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-0 bg-gradient-to-br from-emerald-50 to-emerald-100">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Sprout className="w-8 h-8 text-white" />
                  </div>
                         <div className="text-3xl font-bold text-emerald-700 mb-2">
                           {stats.flora}
                         </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Spesies Flora</h3>
                  <p className="text-sm text-gray-600 mb-4">Tumbuhan di taman ini</p>
                  <div className="flex items-center justify-center text-emerald-600 group-hover:text-emerald-700">
                    <span className="text-sm font-medium">Lihat Detail</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Fauna Count */}
            <Link href={`/fauna?taman=${park.id}`} className="group">
              <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <PawPrint className="w-8 h-8 text-white" />
                  </div>
                         <div className="text-3xl font-bold text-blue-700 mb-2">
                           {stats.fauna}
                         </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Spesies Fauna</h3>
                  <p className="text-sm text-gray-600 mb-4">Hewan di taman ini</p>
                  <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-700">
                    <span className="text-sm font-medium">Lihat Detail</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Articles Count */}
            <Link href={`/artikel?taman=${park.id}`} className="group">
              <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                         <div className="text-3xl font-bold text-purple-700 mb-2">
                           {stats.artikel}
                         </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Artikel</h3>
                  <p className="text-sm text-gray-600 mb-4">Tentang taman ini</p>
                  <div className="flex items-center justify-center text-purple-600 group-hover:text-purple-700">
                    <span className="text-sm font-medium">Lihat Detail</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="py-16 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="container mx-auto px-4">
          <ParkActivities parkId={park.id} parkName={park.name} />
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Gallery Grid */}
              {park.galeri && park.galeri.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {park.galeri.slice(0, 6).map((image, index) => (
                    <div key={index} className="aspect-square relative rounded-lg overflow-hidden bg-muted group">
                      <Image
                        src={image.url || '/placeholder.svg'}
                        alt={image.judul || `Gambar ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Description */}
              {park.description && (
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Info className="h-6 w-6 text-emerald-600" />
                      Tentang Taman
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg leading-relaxed text-gray-700">{park.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* SK Penetapan */}
              {park.sk_penetapan && (
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Shield className="h-6 w-6 text-blue-600" />
                      SK Penetapan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg leading-relaxed text-gray-700">{park.sk_penetapan}</p>
                  </CardContent>
                </Card>
              )}

              {/* Sejarah */}
              {park.sejarah && (
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Calendar className="h-6 w-6 text-purple-600" />
                      Sejarah
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg leading-relaxed text-gray-700">{park.sejarah}</p>
                  </CardContent>
                </Card>
              )}

              {/* Visi & Misi */}
              {(park.visi || park.misi) && (
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Globe className="h-6 w-6 text-green-600" />
                      Visi & Misi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {park.visi && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Visi</h4>
                        <p className="text-gray-700 leading-relaxed">{park.visi}</p>
                      </div>
                    )}
                    {park.misi && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Misi</h4>
                        <p className="text-gray-700 leading-relaxed">{park.misi}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Nilai Penting */}
              {park.nilai_penting && (
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <TreePine className="h-6 w-6 text-emerald-600" />
                      Nilai Penting
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg leading-relaxed text-gray-700">{park.nilai_penting}</p>
                  </CardContent>
                </Card>
              )}

              {/* Kondisi Fisik */}
              {park.kondisi_fisik && (
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Map className="h-6 w-6 text-orange-600" />
                      Kondisi Fisik
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg leading-relaxed text-gray-700">{park.kondisi_fisik}</p>
                  </CardContent>
                </Card>
              )}

              {/* Area Information */}
              {park.area_ha && (
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Ruler className="h-6 w-6 text-blue-600" />
                      Informasi Luas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-bold text-blue-600">{park.area_ha}</span>
                      <span className="text-xl text-gray-600">hektar</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-emerald-600" />
                    Informasi Cepat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Status</span>
                    <Badge variant={park.status === 'published' ? 'default' : 'secondary'}>
                      {park.status === 'published' ? 'Dipublikasikan' : 'Draft'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Wilayah</span>
                    <span className="font-semibold">{park.region_name || 'Indonesia'}</span>
                  </div>
                  {park.pengelola && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Pengelola</span>
                      <span className="font-semibold">{park.pengelola}</span>
                    </div>
                  )}
                  {park.tipe_ekoregion && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Tipe Ekoregion</span>
                      <span className="font-semibold">{park.tipe_ekoregion}</span>
                    </div>
                  )}
                  {park.area_ha && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Luas</span>
                      <span className="font-semibold">{park.area_ha} ha</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timestamps */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Informasi Waktu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {park.created_at && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600">Dibuat</h4>
                      <p className="text-sm font-semibold">{formatDate(park.created_at)}</p>
                    </div>
                  )}
                  {park.updated_at && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600">Diperbarui</h4>
                      <p className="text-sm font-semibold">{formatDate(park.updated_at)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Map */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-blue-600" />
                    Lokasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Map className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                      <p className="text-sm text-blue-600 font-medium">Peta Interaktif</p>
                      <p className="text-xs text-blue-500">Akan segera tersedia</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Lihat di Peta
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
