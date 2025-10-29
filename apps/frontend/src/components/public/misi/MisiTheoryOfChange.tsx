'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
// Minimalist design - no icons needed

export function MisiTheoryOfChange() {
  const [activePillar, setActivePillar] = useState(0);

  const pillars = [
    {
      title: "Data & Teknologi",
      description: "Menggunakan teknologi terdepan untuk dokumentasi dan analisis keanekaragaman hayati",
      details: [
        "Sistem database terintegrasi untuk flora dan fauna",
        "Teknologi AI untuk identifikasi spesies",
        "Platform digital untuk akses data real-time",
        "Sistem monitoring dan pelacakan konservasi"
      ]
    },
    {
      title: "Komunitas & Kolaborasi",
      description: "Membangun jaringan kolaborasi dengan berbagai stakeholder konservasi",
      details: [
        "Kemitraan dengan universitas dan lembaga riset",
        "Program pelatihan untuk masyarakat lokal",
        "Platform partisipasi publik dalam konservasi",
        "Jaringan relawan konservasi nasional"
      ]
    },
    {
      title: "Dampak Global",
      description: "Berkontribusi pada upaya konservasi global dan pencapaian SDGs",
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
      title: "Target Konservasi",
      value: "100+",
      description: "Taman Kehati yang dikelola"
    },
    {
      title: "Database Spesies",
      value: "10,000+",
      description: "Spesies terdokumentasi"
    },
    {
      title: "Komunitas Aktif",
      value: "5,000+",
      description: "Kontributor dan relawan"
    },
    {
      title: "Ekosistem Dilindungi",
      value: "50,000+",
      description: "Hektar kawasan konservasi"
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
            Theory of Change
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Kami percaya bahwa konservasi keanekaragaman hayati memerlukan pendekatan holistik 
            yang menggabungkan teknologi, komunitas, dan dampak global yang berkelanjutan.
          </p>
        </div>

        {/* Video Section - PRESERVED */}
        <div className="mb-20" id="video">
          <div className="relative h-96 rounded-xl overflow-hidden bg-gray-100 shadow-lg">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-xl font-light mb-2">Community Engagement</h3>
              <p className="text-white/90">Membangun komunitas yang peduli konservasi</p>
            </div>
          </div>
        </div>

        {/* Mission Pillars */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {pillars.map((pillar, index) => (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  {pillar.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {pillar.description}
                </p>
                <ul className="space-y-3 text-sm text-gray-500">
                  {pillar.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Areas */}
        <div className="bg-white rounded-xl p-12 border border-gray-200">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-light text-gray-900 mb-4">
              Dampak yang Kami Ciptakan
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Melalui pendekatan holistik kami, kami telah mencapai dampak nyata 
              dalam konservasi keanekaragaman hayati Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {impactAreas.map((area, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-4xl font-light text-gray-900 mb-2">
                  {area.value}
                </div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  {area.title}
                </h4>
                <p className="text-xs text-gray-500">
                  {area.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

