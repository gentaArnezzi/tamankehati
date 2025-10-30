"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  TreePine,
  Leaf,
  PawPrint,
  Users,
  Target,
  ArrowRight,
  CheckCircle,
  Globe,
} from "lucide-react";

export function MisiTimeline() {
  const [activeYear, setActiveYear] = useState(0);

  const timeline = [
    {
      year: "2024",
      title: "Peluncuran Platform Digital",
      description:
        "Platform Taman Kehati resmi diluncurkan dengan fitur dasar dokumentasi flora dan fauna",
      status: "completed",
      achievements: [
        "100+ taman kehati terdaftar",
        "5,000+ spesies terdokumentasi",
        "1,000+ pengguna aktif",
        "API publik tersedia",
      ],
      icon: TreePine,
      color: "from-green-500 to-emerald-500",
    },
    {
      year: "2025",
      title: "Ekspansi Teknologi AI",
      description:
        "Implementasi teknologi kecerdasan buatan untuk identifikasi spesies dan analisis data",
      status: "in-progress",
      achievements: [
        "AI identification system",
        "Mobile app development",
        "Real-time monitoring",
        "International partnerships",
      ],
      icon: Target,
      color: "from-blue-500 to-cyan-500",
    },
    {
      year: "2026",
      title: "Jaringan Konservasi Nasional",
      description:
        "Membangun jaringan kolaborasi dengan 500+ institusi konservasi di seluruh Indonesia",
      status: "planned",
      achievements: [
        "500+ institusi mitra",
        "10,000+ relawan terdaftar",
        "Program edukasi nasional",
        "Database terintegrasi",
      ],
      icon: Users,
      color: "from-purple-500 to-pink-500",
    },
    {
      year: "2027",
      title: "Platform Global",
      description:
        "Ekspansi ke level internasional dengan fokus pada keanekaragaman hayati Asia Tenggara",
      status: "planned",
      achievements: [
        "Regional expansion",
        "International database",
        "Global partnerships",
        "Climate impact modeling",
      ],
      icon: Globe,
      color: "from-orange-500 to-red-500",
    },
    {
      year: "2028",
      title: "Ekosistem Berkelanjutan",
      description:
        "Mencapai sistem konservasi yang berkelanjutan dengan dampak nyata pada lingkungan",
      status: "planned",
      achievements: [
        "Carbon neutral operations",
        "Sustainable funding model",
        "Policy influence",
        "Global recognition",
      ],
      icon: Leaf,
      color: "from-teal-500 to-green-500",
    },
    {
      year: "2029",
      title: "Masa Depan Konservasi",
      description:
        "Menjadi platform konservasi terdepan di dunia dengan teknologi dan dampak terbesar",
      status: "vision",
      achievements: [
        "Global leadership",
        "1M+ species documented",
        "Worldwide impact",
        "Next-gen technology",
      ],
      icon: PawPrint,
      color: "from-indigo-500 to-purple-500",
    },
  ];

  const milestones = [
    {
      quarter: "Q1 2024",
      title: "Platform Launch",
      description: "Peluncuran resmi platform Taman Kehati",
      status: "completed",
    },
    {
      quarter: "Q2 2024",
      title: "Data Integration",
      description: "Integrasi data dari 50+ taman kehati",
      status: "completed",
    },
    {
      quarter: "Q3 2024",
      title: "Mobile App",
      description: "Peluncuran aplikasi mobile",
      status: "completed",
    },
    {
      quarter: "Q4 2024",
      title: "API Public",
      description: "Rilis API publik untuk developer",
      status: "completed",
    },
    {
      quarter: "Q1 2025",
      title: "AI Integration",
      description: "Implementasi teknologi AI",
      status: "in-progress",
    },
    {
      quarter: "Q2 2025",
      title: "International Partnerships",
      description: "Kemitraan dengan organisasi internasional",
      status: "planned",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "in-progress":
        return "text-blue-600 bg-blue-100";
      case "planned":
        return "text-gray-600 bg-gray-100";
      case "vision":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Selesai";
      case "in-progress":
        return "Sedang Berjalan";
      case "planned":
        return "Direncanakan";
      case "vision":
        return "Visi Masa Depan";
      default:
        return "Direncanakan";
    }
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl font-light text-gray-900 mb-6">
            Roadmap Masa Depan
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Visi kami untuk 6 tahun ke depan dalam melestarikan keanekaragaman
            hayati Indonesia dan menjadi platform konservasi terdepan di dunia.
          </p>
        </div>

        {/* Year Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {timeline.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveYear(index)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeYear === index
                  ? "bg-gray-900 text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.year}
            </button>
          ))}
        </div>

        {/* Active Year Details */}
        <Card className="mb-16 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Content Section */}
            <div className="p-8 lg:p-12">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${timeline[activeYear].color} rounded-2xl flex items-center justify-center`}
                >
                  {(() => {
                    const Icon = timeline[activeYear].icon;
                    return <Icon className="w-8 h-8 text-white" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-3xl font-semibold text-gray-900 mb-2">
                    {timeline[activeYear].title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(timeline[activeYear].status)}`}
                  >
                    {getStatusText(timeline[activeYear].status)}
                  </span>
                </div>
              </div>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {timeline[activeYear].description}
              </p>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Target Pencapaian:
                </h4>
                <ul className="space-y-3">
                  {timeline[activeYear].achievements.map(
                    (achievement, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{achievement}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>

            {/* Visual Section */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-8">
              <div className="text-center">
                <div
                  className={`w-32 h-32 bg-gradient-to-br ${timeline[activeYear].color} rounded-full flex items-center justify-center mx-auto mb-6`}
                >
                  {(() => {
                    const Icon = timeline[activeYear].icon;
                    return <Icon className="w-16 h-16 text-white" />;
                  })()}
                </div>
                <h4 className="text-2xl font-semibold text-gray-900 mb-2">
                  {timeline[activeYear].year}
                </h4>
                <p className="text-gray-600">
                  {getStatusText(timeline[activeYear].status)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quarterly Milestones */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-light text-gray-900 mb-4">
              Milestone 2024-2025
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pencapaian detail yang telah dan akan kami raih dalam 2 tahun ke
              depan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {milestones.map((milestone, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        milestone.status === "completed"
                          ? "bg-green-500"
                          : milestone.status === "in-progress"
                            ? "bg-blue-500"
                            : "bg-gray-300"
                      }`}
                    />
                    <span className="text-sm font-medium text-gray-600">
                      {milestone.quarter}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {milestone.title}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {milestone.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0 overflow-hidden">
            <CardContent className="p-12">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-3xl font-light mb-4">
                  Ikuti Perjalanan Kami
                </h3>
                <p className="text-gray-300 mb-8 text-lg">
                  Dapatkan update terbaru tentang perkembangan platform Taman
                  Kehati dan kontribusi Anda dalam konservasi keanekaragaman
                  hayati Indonesia.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-colors">
                    Berlangganan Newsletter
                  </button>
                  <button className="px-8 py-3 bg-gray-700 text-white font-semibold rounded-full hover:bg-gray-600 transition-colors">
                    Ikuti di Media Sosial
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
