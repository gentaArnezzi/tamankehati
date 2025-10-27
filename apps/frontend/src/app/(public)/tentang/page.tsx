'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TreePine, Bird, Leaf, MapPin, TrendingUp, Users, Calendar } from 'lucide-react';

interface DashboardStats {
  total_taman: number;
  total_flora: number;
  total_fauna: number;
  total_users: number;
  published_taman: number;
  published_flora: number;
  published_fauna: number;
}

export default function IndeksKehatiPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/dashboard/`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Taman Kehati',
      value: stats?.total_taman || 0,
      published: stats?.published_taman || 0,
      icon: TreePine,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      title: 'Spesies Flora',
      value: stats?.total_flora || 0,
      published: stats?.published_flora || 0,
      icon: Leaf,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
    {
      title: 'Spesies Fauna',
      value: stats?.total_fauna || 0,
      published: stats?.published_fauna || 0,
      icon: Bird,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      title: 'Kontributor Aktif',
      value: stats?.total_users || 0,
      published: null,
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-emerald-700 text-white py-20">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm font-medium">Dashboard Data Publik</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Indeks Kehati Indonesia
            </h1>
            <p className="text-xl md:text-2xl text-green-50 mb-8 leading-relaxed">
              Data terbaru keanekaragaman hayati Indonesia dalam satu platform
            </p>
            <div className="flex items-center justify-center gap-2 text-green-100">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Diperbarui secara real-time</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="container mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900">
                          {card.value.toLocaleString()}
                        </div>
                        {card.published !== null && (
                          <div className="text-sm text-gray-600 mt-1">
                            {card.published} Dipublikasi
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-700">{card.title}</h3>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>

      {/* Detailed Stats */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Biodiversity Index */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Indeks Keanekaragaman</CardTitle>
                  <CardDescription>Tingkat keberagaman spesies di Indonesia</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Total Spesies Terdokumentasi</span>
                  <span className="text-2xl font-bold text-green-600">
                    {((stats?.total_flora || 0) + (stats?.total_fauna || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Flora</span>
                      <span className="font-semibold">{stats?.total_flora || 0} spesies</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        style={{ 
                          width: `${((stats?.total_flora || 0) / ((stats?.total_flora || 0) + (stats?.total_fauna || 0)) * 100) || 50}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Fauna</span>
                      <span className="font-semibold">{stats?.total_fauna || 0} spesies</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{ 
                          width: `${((stats?.total_fauna || 0) / ((stats?.total_flora || 0) + (stats?.total_fauna || 0)) * 100) || 50}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Geographic Distribution */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Distribusi Geografis</CardTitle>
                  <CardDescription>Sebaran taman kehati di Indonesia</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Total Lokasi Taman</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {stats?.total_taman || 0}
                  </span>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold text-blue-700">{stats?.published_taman || 0}</span> taman telah terdaftar dan dipublikasi
                  </p>
                  <p className="text-xs text-gray-600">
                    Mencakup berbagai provinsi di seluruh Indonesia
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500 rounded-xl">
                  <TreePine className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">Konservasi Aktif</h3>
                  <p className="text-sm text-green-700">
                    {stats?.published_taman || 0} taman aktif melakukan konservasi keanekaragaman hayati
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Database Lengkap</h3>
                  <p className="text-sm text-blue-700">
                    Dokumentasi lengkap {((stats?.total_flora || 0) + (stats?.total_fauna || 0)).toLocaleString()} spesies flora & fauna
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500 rounded-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900 mb-1">Kolaborasi Nasional</h3>
                  <p className="text-sm text-purple-700">
                    {stats?.total_users || 0} kontributor aktif dari berbagai institusi
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-12 mb-12">
        <Card className="bg-gradient-to-r from-green-600 to-emerald-700 text-white border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <CardContent className="p-12 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Jelajahi Data Lengkap Keanekaragaman Hayati Indonesia
              </h2>
              <p className="text-green-50 mb-8 text-lg">
                Akses informasi detail tentang taman kehati, flora, dan fauna di seluruh Indonesia
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a 
                  href="/taman" 
                  className="px-8 py-3 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-colors"
                >
                  Lihat Taman Kehati
                </a>
                <a 
                  href="/flora" 
                  className="px-8 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                >
                  Jelajahi Flora
                </a>
                <a 
                  href="/fauna" 
                  className="px-8 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                >
                  Jelajahi Fauna
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
