"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Database,
  Camera,
  Map,
  Smartphone,
  Cloud,
  Microscope,
  Satellite,
  Brain,
  ArrowRight,
  Download,
} from "lucide-react";

export function MisiTechnology() {
  const [activeTech, setActiveTech] = useState(0);

  const technologies = [
    {
      id: 1,
      icon: Database,
      title: "Sistem Database Terintegrasi",
      description:
        "Platform terpusat untuk mengelola data flora, fauna, dan ekosistem",
      image: "/tech/database.jpg",
      features: [
        "Penyimpanan data real-time",
        "Integrasi dengan sistem GIS",
        "Backup otomatis dan redundansi",
        "API untuk akses data eksternal",
      ],
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 2,
      icon: Camera,
      title: "Identifikasi Visual AI",
      description:
        "Teknologi kecerdasan buatan untuk identifikasi spesies dari foto",
      image: "/tech/ai-camera.jpg",
      features: [
        "Machine learning untuk identifikasi",
        "Akurasi identifikasi 95%+",
        "Dukungan multi-bahasa",
        "Integrasi dengan database spesies",
      ],
      color: "from-green-500 to-emerald-500",
    },
    {
      id: 3,
      icon: Map,
      title: "Sistem Informasi Geografis",
      description: "Pemetaan interaktif untuk monitoring dan analisis spasial",
      image: "/tech/gis.jpg",
      features: [
        "Peta interaktif real-time",
        "Analisis hotspot keanekaragaman",
        "Overlay data lingkungan",
        "Export data untuk penelitian",
      ],
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 4,
      icon: Smartphone,
      title: "Aplikasi Mobile",
      description: "Akses mudah melalui aplikasi mobile untuk lapangan",
      image: "/tech/mobile.jpg",
      features: [
        "Offline data access",
        "GPS tracking terintegrasi",
        "Upload foto langsung",
        "Sinkronisasi otomatis",
      ],
      color: "from-orange-500 to-red-500",
    },
    {
      id: 5,
      icon: Cloud,
      title: "Cloud Computing",
      description: "Infrastruktur cloud untuk skalabilitas dan keandalan",
      image: "/tech/cloud.jpg",
      features: [
        "Skalabilitas otomatis",
        "99.9% uptime guarantee",
        "Global CDN",
        "Security enterprise-grade",
      ],
      color: "from-indigo-500 to-blue-500",
    },
    {
      id: 6,
      icon: Microscope,
      title: "Laboratorium Digital",
      description: "Platform analisis data untuk penelitian mendalam",
      image: "/tech/lab.jpg",
      features: [
        "Analisis statistik lanjutan",
        "Visualisasi data interaktif",
        "Model prediktif",
        "Kolaborasi penelitian",
      ],
      color: "from-teal-500 to-green-500",
    },
  ];

  const stats = [
    { label: "Data Points", value: "2.5M+", color: "text-blue-600" },
    {
      label: "Spesies Teridentifikasi",
      value: "15,000+",
      color: "text-green-600",
    },
    { label: "Pengguna Aktif", value: "10,000+", color: "text-purple-600" },
    { label: "Uptime", value: "99.9%", color: "text-orange-600" },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl font-light text-gray-900 mb-6">
            Teknologi & Inovasi
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Kami menggunakan teknologi terdepan untuk mempermudah konservasi,
            penelitian, dan akses data keanekaragaman hayati Indonesia.
          </p>
        </div>

        {/* Technology Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {technologies.map((tech, index) => {
            const Icon = tech.icon;
            const isActive = activeTech === index;

            return (
              <Card
                key={tech.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-xl group ${
                  isActive ? "shadow-xl scale-105 border-2" : "hover:scale-102"
                }`}
                onClick={() => setActiveTech(index)}
              >
                <CardContent className="p-6">
                  <div className="text-center">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${tech.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {tech.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {tech.description}
                    </p>
                    <div className="flex items-center justify-center text-gray-500 group-hover:text-gray-700 transition-colors">
                      <span className="text-sm font-medium">
                        Pelajari Lebih Lanjut
                      </span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Active Technology Details */}
        <Card className="mb-16 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative h-80 lg:h-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <div
                    className={`w-24 h-24 bg-gradient-to-br ${technologies[activeTech].color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                  >
                    {(() => {
                      const Icon = technologies[activeTech].icon;
                      return <Icon className="w-12 h-12 text-white" />;
                    })()}
                  </div>
                  <p className="text-gray-600 font-medium">Teknologi Preview</p>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 lg:p-12">
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">
                {technologies[activeTech].title}
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {technologies[activeTech].description}
              </p>

              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Fitur Utama:
                </h4>
                <ul className="space-y-3">
                  {technologies[activeTech].features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 bg-gradient-to-r ${technologies[activeTech].color} rounded-full mt-2 flex-shrink-0`}
                      />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4">
                <button className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                  Lihat Demo
                </button>
                <button className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                  Dokumentasi
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Section */}
        <div className="bg-white rounded-3xl p-12 shadow-sm">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-light text-gray-900 mb-4">
              Dampak Teknologi Kami
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Teknologi yang kami kembangkan telah memberikan dampak nyata dalam
              konservasi keanekaragaman hayati Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Download Section */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0 overflow-hidden">
            <CardContent className="p-12">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-3xl font-light mb-4">
                  Unduh Informasi Teknologi
                </h3>
                <p className="text-gray-300 mb-8 text-lg">
                  Dapatkan dokumentasi lengkap tentang teknologi yang kami
                  gunakan untuk konservasi keanekaragaman hayati.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Unduh Dokumentasi
                  </button>
                  <button className="px-8 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors">
                    Lihat API Documentation
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
