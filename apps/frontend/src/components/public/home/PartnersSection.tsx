"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, GraduationCap, Globe, Handshake } from "lucide-react";

export function PartnersSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    const element = document.getElementById("partners-section");
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const partnerCategories = [
    {
      title: "Universitas & Institusi Akademik",
      icon: GraduationCap,
      partners: [
        "Universitas Indonesia",
        "Institut Pertanian Bogor (IPB)",
        "Universitas Gadjah Mada",
        "Institut Teknologi Bandung",
        "Universitas Brawijaya",
        "Universitas Padjadjaran",
      ],
    },
    {
      title: "Lembaga Pemerintah",
      icon: Building2,
      partners: [
        "Kementerian Lingkungan Hidup",
        "LIPI (Lembaga Ilmu Pengetahuan Indonesia)",
        "BKSDA (Balai Konservasi Sumber Daya Alam)",
        "Kementerian Kehutanan",
        "BRIN (Badan Riset dan Inovasi Nasional)",
        "Direktorat Jenderal KSDAE",
      ],
    },
    {
      title: "Organisasi Internasional",
      icon: Globe,
      partners: [
        "WWF Indonesia",
        "The Nature Conservancy",
        "Conservation International",
        "IUCN (International Union for Conservation)",
        "Wildlife Conservation Society",
        "Rainforest Alliance",
      ],
    },
    {
      title: "Komunitas & LSM Lokal",
      icon: Handshake,
      partners: [
        "Yayasan Kehati Indonesia",
        "Orangutan Foundation",
        "Komodo Survival Program",
        "Leuser Conservation Forum",
        "Indonesian Biodiversity Foundation",
        "Coral Triangle Center",
      ],
    },
  ];

  return (
    <section
      id="partners-section"
      className="py-32 bg-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container mx-auto max-w-7xl px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6">
            <Handshake className="w-4 h-4" />
            Mitra & Kolaborator
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Bersama Melindungi
            <span className="block bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Keanekaragaman Hayati
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kolaborasi dengan berbagai institusi, universitas, dan organisasi
            untuk mencapai dampak konservasi yang lebih besar
          </p>
        </motion.div>

        {/* Partner Categories */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {partnerCategories.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-lg border border-gray-200 hover:shadow-2xl transition-all"
            >
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/50">
                  <category.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {category.title}
                </h3>
              </div>

              {/* Partners Grid */}
              <div className="grid grid-cols-2 gap-3">
                {category.partners.map((partner, partnerIndex) => (
                  <motion.div
                    key={partnerIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                    transition={{
                      delay: 0.3 + categoryIndex * 0.1 + partnerIndex * 0.05,
                    }}
                    className="bg-white rounded-xl p-4 border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full group-hover:scale-150 transition-transform" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors">
                        {partner}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

          <div className="relative grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: "28+", label: "Institusi Partner" },
              { value: "15+", label: "Universitas" },
              { value: "12+", label: "Organisasi Internasional" },
              { value: "20+", label: "Komunitas Lokal" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                <div className="text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ingin Berkolaborasi?
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Kami terbuka untuk kolaborasi dengan institusi, peneliti, dan
            organisasi yang memiliki visi yang sama dalam konservasi
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-emerald-500/50 transition-all hover:scale-105">
            Hubungi Kami untuk Kerjasama
          </button>
        </motion.div>
      </div>
    </section>
  );
}
