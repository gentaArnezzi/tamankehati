'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Target, 
  Users, 
  Database, 
  Globe, 
  Shield, 
  Heart,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export function MisiTheoryOfChange() {
  const [activePillar, setActivePillar] = useState(0);

  const pillars = [
    {
      icon: Database,
      title: "Data & Teknologi",
      description: "Menggunakan teknologi terdepan untuk dokumentasi dan analisis keanekaragaman hayati",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      details: [
        "Sistem database terintegrasi untuk flora dan fauna",
        "Teknologi AI untuk identifikasi spesies",
        "Platform digital untuk akses data real-time",
        "Sistem monitoring dan pelacakan konservasi"
      ]
    },
    {
      icon: Users,
      title: "Komunitas & Kolaborasi",
      description: "Membangun jaringan kolaborasi dengan berbagai stakeholder konservasi",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      details: [
        "Kemitraan dengan universitas dan lembaga riset",
        "Program pelatihan untuk masyarakat lokal",
        "Platform partisipasi publik dalam konservasi",
        "Jaringan relawan konservasi nasional"
      ]
    },
    {
      icon: Globe,
      title: "Dampak Global",
      description: "Berkontribusi pada upaya konservasi global dan pencapaian SDGs",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      details: [
        "Kontribusi pada target Aichi Biodiversity",
        "Dukungan pencapaian SDG 15 (Life on Land)",
        "Partisipasi dalam konvensi internasional",
        "Pemodelan dampak perubahan iklim"
      ]
    }
  ];

  const impactAreas = [
    {
      icon: Target,
      title: "Target Konservasi",
      value: "100+",
      description: "Taman Kehati yang dikelola",
      color: "text-green-600"
    },
    {
      icon: Database,
      title: "Database Spesies",
      value: "10,000+",
      description: "Spesies terdokumentasi",
      color: "text-blue-600"
    },
    {
      icon: Users,
      title: "Komunitas Aktif",
      value: "5,000+",
      description: "Kontributor dan relawan",
      color: "text-purple-600"
    },
    {
      icon: Shield,
      title: "Ekosistem Dilindungi",
      value: "50,000+",
      description: "Hektar kawasan konservasi",
      color: "text-emerald-600"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl font-light text-gray-900 mb-6">
            Theory of Change
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Kami percaya bahwa konservasi keanekaragaman hayati memerlukan pendekatan holistik 
            yang menggabungkan teknologi, komunitas, dan dampak global yang berkelanjutan.
          </p>
        </div>

        {/* Video Background Section */}
        <div className="mb-20">
          <div className="relative h-96 rounded-3xl overflow-hidden bg-gray-900">
            {/* Video Background */}
            <div className="absolute inset-0">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                poster="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop"
              >
                <source src="https://cdn.prod.website-files.com/66ce39f987d962826a1a9abb/66ce39f987d962826a1a9b71_Locals%20For%20Website%20(1)-transcode.mp4" type="video/mp4" />
                <source src="https://cdn.prod.website-files.com/66ce39f987d962826a1a9abb/66ce39f987d962826a1a9b71_Locals%20For%20Website%20(1)-transcode.webm" type="video/webm" />
              </video>
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>
            
            {/* Content */}
            <div className="relative z-10 h-full flex items-end">
              <div className="p-12">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white">
                    <h3 className="text-2xl font-semibold">Community Engagement</h3>
                    <p className="text-white/80">Membangun komunitas yang peduli konservasi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Pillars */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              const isActive = activePillar === index;
              
              return (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                    isActive ? 'shadow-xl scale-105' : 'hover:scale-102'
                  } ${pillar.borderColor} ${pillar.bgColor}`}
                  onClick={() => setActivePillar(index)}
                >
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className={`w-16 h-16 bg-gradient-to-br ${pillar.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                        {pillar.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-6">
                        {pillar.description}
                      </p>
                      <div className="flex items-center justify-center text-gray-500 group">
                        <span className="text-sm font-medium">Pelajari Lebih Lanjut</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Active Pillar Details */}
          <Card className={`${pillars[activePillar].bgColor} ${pillars[activePillar].borderColor} border-2`}>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    {pillars[activePillar].title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {pillars[activePillar].description}
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Fokus Utama:
                  </h4>
                  <ul className="space-y-3">
                    {pillars[activePillar].details.map((detail, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Impact Areas */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-light text-gray-900 mb-4">
              Dampak yang Kami Ciptakan
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Melalui pendekatan holistik kami, kami telah mencapai dampak nyata 
              dalam konservasi keanekaragaman hayati Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {impactAreas.map((area, index) => {
              const Icon = area.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <Icon className={`w-8 h-8 ${area.color}`} />
                  </div>
                  <div className={`text-4xl font-bold ${area.color} mb-2`}>
                    {area.value}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {area.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {area.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-12 text-white">
            <h3 className="text-3xl font-light mb-4">
              Bergabunglah dengan Misi Kami
            </h3>
            <p className="text-green-100 mb-8 text-lg max-w-2xl mx-auto">
              Mari bersama-sama melestarikan keanekaragaman hayati Indonesia 
              untuk generasi mendatang.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-green-600 font-semibold rounded-full hover:bg-green-50 transition-colors">
                Lihat Cara Berkontribusi
              </button>
              <button className="px-8 py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-400 transition-colors">
                Daftar Sebagai Relawan
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

