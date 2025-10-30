"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Plus,
  Leaf,
  Bird,
  MapPin,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import Link from "next/link";

interface Update {
  id: number;
  type: "flora" | "fauna" | "park" | "article" | "gallery";
  title: string;
  description: string;
  time: string;
  user: string;
  thumbnail?: string;
}

export function RecentUpdatesSection() {
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

    const element = document.getElementById("updates-section");
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const updates: Update[] = [
    {
      id: 1,
      type: "flora",
      title: "Rafflesia Arnoldii - Bunga Raksasa Sumatera",
      description:
        "Data baru ditambahkan untuk spesies Rafflesia Arnoldii dengan lokasi penemuan terbaru di Bengkulu",
      time: "2 jam yang lalu",
      user: "Dr. Siti Rahma",
      thumbnail:
        "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=200&h=200&fit=crop",
    },
    {
      id: 2,
      type: "fauna",
      title: "Orangutan Tapanuli - Update Populasi",
      description:
        "Sensus terbaru menunjukkan peningkatan populasi orangutan tapanuli di kawasan Batang Toru",
      time: "5 jam yang lalu",
      user: "Tim Konservasi",
      thumbnail:
        "https://images.unsplash.com/photo-1551739440-5dd934d3a94a?w=200&h=200&fit=crop",
    },
    {
      id: 3,
      type: "park",
      title: "Taman Nasional Way Kambas",
      description:
        "Informasi terbaru tentang program konservasi gajah sumatera di Way Kambas",
      time: "1 hari yang lalu",
      user: "Pengelola Taman",
      thumbnail:
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&h=200&fit=crop",
    },
    {
      id: 4,
      type: "article",
      title: "Strategi Konservasi Hutan Hujan Tropis",
      description:
        "Artikel baru tentang pendekatan inovatif dalam konservasi hutan hujan Indonesia",
      time: "2 hari yang lalu",
      user: "Prof. Budi Santoso",
      thumbnail:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop",
    },
    {
      id: 5,
      type: "gallery",
      title: "Foto Dokumentasi Jalak Bali",
      description:
        "15 foto baru ditambahkan ke galeri dokumentasi Jalak Bali di Taman Nasional Bali Barat",
      time: "3 hari yang lalu",
      user: "Wildlife Photographer",
      thumbnail:
        "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop",
    },
    {
      id: 6,
      type: "flora",
      title: "Anggrek Hitam Kalimantan",
      description:
        "Penemuan koloni baru anggrek hitam di kawasan Kalimantan Tengah",
      time: "4 hari yang lalu",
      user: "Tim Eksplorasi",
      thumbnail:
        "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&h=200&fit=crop",
    },
  ];

  const getTypeConfig = (type: Update["type"]) => {
    switch (type) {
      case "flora":
        return { icon: Leaf, color: "emerald", label: "Flora" };
      case "fauna":
        return { icon: Bird, color: "teal", label: "Fauna" };
      case "park":
        return { icon: MapPin, color: "green", label: "Taman" };
      case "article":
        return { icon: FileText, color: "blue", label: "Artikel" };
      case "gallery":
        return { icon: ImageIcon, color: "purple", label: "Galeri" };
    }
  };

  return (
    <section
      id="updates-section"
      className="py-32 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)`,
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
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6">
            <Clock className="w-4 h-4" />
            Update Terbaru
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Aktivitas
            <span className="block bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Real-Time Database
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pantau penambahan data terbaru dari kontributor di seluruh Indonesia
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-green-500 to-teal-500" />

            {/* Updates */}
            <div className="space-y-8">
              {updates.map((update, index) => {
                const config = getTypeConfig(update.type);
                const Icon = config.icon;

                return (
                  <motion.div
                    key={update.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="relative pl-24"
                  >
                    {/* Timeline Icon */}
                    <div
                      className={`absolute left-0 w-16 h-16 bg-gradient-to-br from-${config.color}-500 to-${config.color}-600 rounded-2xl shadow-lg shadow-${config.color}-500/50 flex items-center justify-center`}
                      style={{
                        background: `linear-gradient(135deg, ${
                          config.color === "emerald"
                            ? "#10b981"
                            : config.color === "teal"
                              ? "#14b8a6"
                              : config.color === "green"
                                ? "#22c55e"
                                : config.color === "blue"
                                  ? "#3b82f6"
                                  : "#a855f7"
                        }, ${
                          config.color === "emerald"
                            ? "#059669"
                            : config.color === "teal"
                              ? "#0d9488"
                              : config.color === "green"
                                ? "#16a34a"
                                : config.color === "blue"
                                  ? "#2563eb"
                                  : "#9333ea"
                        })`,
                      }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Update Card */}
                    <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100 cursor-pointer">
                      <div className="flex gap-6">
                        {/* Thumbnail */}
                        {update.thumbnail && (
                          <div className="flex-shrink-0">
                            <div className="w-24 h-24 rounded-xl overflow-hidden">
                              <img
                                src={update.thumbnail}
                                alt={update.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Type Badge */}
                          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold mb-2">
                            <Plus className="w-3 h-3" />
                            {config.label} Baru
                          </div>

                          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                            {update.title}
                          </h3>

                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {update.description}
                          </p>

                          {/* Meta */}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {update.time}
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              oleh {update.user}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Load More */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mt-12"
          >
            <button className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-emerald-500/50 transition-all hover:scale-105">
              Lihat Lebih Banyak Update
            </button>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { label: "Update Hari Ini", value: "24", icon: Clock },
            { label: "Kontributor Aktif", value: "18", icon: Plus },
            { label: "Data Baru (Minggu Ini)", value: "156", icon: FileText },
            { label: "Verifikasi Pending", value: "7", icon: Clock },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 1.1 + i * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center"
            >
              <stat.icon className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
