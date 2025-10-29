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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/public/stats/`);
      if (response.ok) {
        const data = await response.json();
        // Map public stats to dashboard format
        setStats({
          total_taman: data.total_taman,
          total_flora: data.total_flora,
          total_fauna: data.total_fauna,
          total_users: 0, // Not available in public stats
          published_taman: data.total_taman,
          published_flora: data.total_flora,
          published_fauna: data.total_fauna
        });
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
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24 md:py-32 lg:py-40 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }} />
        </div>
        
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-2 h-2 bg-slate-400 rounded-full animate-float"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-slate-500 rounded-full animate-float delay-1000"></div>
          <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-slate-300 rounded-full animate-float delay-500"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-full text-slate-300 text-sm font-medium">
                <BarChart3 className="h-4 w-4" />
                Dashboard Data Publik
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white mb-8 leading-tight animate-slide-up">
              <span className="block">Indeks Kehati</span>
              <span className="block font-normal text-slate-300">Indonesia</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in delay-300">
              Data terbaru keanekaragaman hayati Indonesia dalam satu platform
            </p>
            <div className="flex items-center justify-center gap-2 text-slate-400 animate-fade-in delay-500">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Diperbarui secara real-time</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="container mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse bg-white border-slate-200">
                <CardContent className="p-8">
                  <div className="h-24 bg-slate-200 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-slate-300 bg-white animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-4 rounded-xl bg-slate-100`}>
                        <Icon className="h-6 w-6 text-slate-700" />
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-light text-slate-900">
                          {card.value.toLocaleString()}
                        </div>
                        {card.published !== null && (
                          <div className="text-sm text-slate-500 mt-1">
                            {card.published} Dipublikasi
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="font-medium text-slate-700 text-lg">{card.title}</h3>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>

      {/* Detailed Stats */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Biodiversity Index */}
          <Card className="border border-slate-200 bg-white">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-slate-700" />
                </div>
                <div>
                  <CardTitle className="text-xl font-medium text-slate-900">Indeks Keanekaragaman</CardTitle>
                  <CardDescription className="text-slate-600">Tingkat keberagaman spesies di Indonesia</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Total Spesies Terdokumentasi</span>
                  <span className="text-3xl font-light text-slate-900">
                    {((stats?.total_flora || 0) + (stats?.total_fauna || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Flora</span>
                      <span className="font-medium text-slate-900">{stats?.total_flora || 0} spesies</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-400"
                        style={{ 
                          width: `${((stats?.total_flora || 0) / ((stats?.total_flora || 0) + (stats?.total_fauna || 0)) * 100) || 50}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Fauna</span>
                      <span className="font-medium text-slate-900">{stats?.total_fauna || 0} spesies</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-500"
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
          <Card className="border border-slate-200 bg-white">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 rounded-xl">
                  <MapPin className="h-6 w-6 text-slate-700" />
                </div>
                <div>
                  <CardTitle className="text-xl font-medium text-slate-900">Distribusi Geografis</CardTitle>
                  <CardDescription className="text-slate-600">Sebaran taman kehati di Indonesia</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Total Lokasi Taman</span>
                  <span className="text-3xl font-light text-slate-900">
                    {stats?.total_taman || 0}
                  </span>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl">
                  <p className="text-sm text-slate-700 mb-2">
                    <span className="font-medium text-slate-900">{stats?.published_taman || 0}</span> taman telah terdaftar dan dipublikasi
                  </p>
                  <p className="text-xs text-slate-600">
                    Mencakup berbagai provinsi di seluruh Indonesia
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border border-slate-200 bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-slate-100 rounded-xl">
                  <TreePine className="h-6 w-6 text-slate-700" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-2 text-lg">Konservasi Aktif</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {stats?.published_taman || 0} taman aktif melakukan konservasi keanekaragaman hayati
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-slate-100 rounded-xl">
                  <Leaf className="h-6 w-6 text-slate-700" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-2 text-lg">Database Lengkap</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Dokumentasi lengkap {((stats?.total_flora || 0) + (stats?.total_fauna || 0)).toLocaleString()} spesies flora & fauna
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-slate-100 rounded-xl">
                  <Users className="h-6 w-6 text-slate-700" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-2 text-lg">Kolaborasi Nasional</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {stats?.total_users || 0} kontributor aktif dari berbagai institusi
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-slate-900 text-white border-0 overflow-hidden relative">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '20px 20px'
            }} />
          </div>
          <CardContent className="p-16 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-light mb-6">
                Jelajahi Data Lengkap Keanekaragaman Hayati Indonesia
              </h2>
              <p className="text-slate-300 mb-12 text-lg leading-relaxed">
                Akses informasi detail tentang taman kehati, flora, dan fauna di seluruh Indonesia
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a 
                  href="/misi" 
                  className="px-8 py-4 bg-white text-slate-900 font-medium rounded-xl hover:bg-slate-100 transition-all duration-300 hover:scale-105"
                >
                  Pelajari Misi Kami
                </a>
                <a 
                  href="/taman" 
                  className="px-8 py-4 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-600 transition-all duration-300 hover:scale-105"
                >
                  Lihat Taman Kehati
                </a>
                <a 
                  href="/flora" 
                  className="px-8 py-4 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-600 transition-all duration-300 hover:scale-105"
                >
                  Jelajahi Flora
                </a>
                <a 
                  href="/fauna" 
                  className="px-8 py-4 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-600 transition-all duration-300 hover:scale-105"
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
