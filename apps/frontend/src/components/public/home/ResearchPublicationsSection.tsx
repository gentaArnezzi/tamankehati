'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Download, ExternalLink, Calendar, User, Tag } from 'lucide-react';
import Link from 'next/link';

interface Publication {
  id: number;
  title: string;
  author: string;
  date: string;
  category: string;
  abstract: string;
  downloads: number;
  thumbnail: string;
  pdf_url?: string;
}

export function ResearchPublicationsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('research-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const publications: Publication[] = [
    {
      id: 1,
      title: 'Konservasi Orangutan Sumatera: Strategi dan Implementasi',
      author: 'Dr. Siti Rahma, M.Sc',
      date: '15 Oktober 2024',
      category: 'Konservasi Fauna',
      abstract: 'Penelitian mendalam tentang upaya konservasi orangutan sumatera dengan fokus pada habitat restoration dan community engagement.',
      downloads: 1250,
      thumbnail: 'https://images.unsplash.com/photo-1551739440-5dd934d3a94a?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      title: 'Biodiversitas Flora di Taman Nasional Gunung Leuser',
      author: 'Prof. Budi Santoso, Ph.D',
      date: '08 Oktober 2024',
      category: 'Biodiversitas',
      abstract: 'Katalog komprehensif spesies flora endemik di kawasan Gunung Leuser dengan analisis ekologi dan distribusi geografis.',
      downloads: 890,
      thumbnail: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      title: 'Dampak Perubahan Iklim terhadap Ekosistem Laut Indonesia',
      author: 'Dr. Marina Kusuma',
      date: '01 Oktober 2024',
      category: 'Ekologi',
      abstract: 'Studi longitudinal mengenai dampak perubahan iklim terhadap biodiversitas laut dan strategi adaptasi ekosistem.',
      downloads: 1420,
      thumbnail: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
    }
  ];

  const categories = [
    { value: 'all', label: 'Semua Kategori', count: publications.length },
    { value: 'konservasi', label: 'Konservasi', count: 1 },
    { value: 'biodiversitas', label: 'Biodiversitas', count: 1 },
    { value: 'ekologi', label: 'Ekologi', count: 1 }
  ];

  return (
    <section id="research-section" className="py-32 bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-gradient-to-tr from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-7xl px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6">
            <BookOpen className="w-4 h-4" />
            Publikasi Ilmiah
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Penelitian &
            <span className="block bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Publikasi Terkini
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Akses publikasi ilmiah terbaru dari peneliti dan akademisi di bidang konservasi dan biodiversitas Indonesia
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                selectedCategory === category.value
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/50'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
              <span className="ml-2 text-sm opacity-75">({category.count})</span>
            </button>
          ))}
        </motion.div>

        {/* Publications Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {publications.map((pub, index) => (
            <motion.article
              key={pub.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="relative h-48 overflow-hidden bg-gray-200">
                <img
                  src={pub.thumbnail}
                  alt={pub.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full">
                    {pub.category}
                  </span>
                </div>

                {/* Downloads Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                  <Download className="w-3 h-3 text-emerald-600" />
                  <span className="text-xs font-semibold text-gray-700">{pub.downloads}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                  {pub.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {pub.abstract}
                </p>

                {/* Meta Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User className="w-4 h-4" />
                    <span>{pub.author}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{pub.date}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/research/${pub.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-all"
                  >
                    Baca Lebih Lanjut
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          {[
            { label: 'Total Publikasi', value: '145', icon: BookOpen },
            { label: 'Peneliti Aktif', value: '67', icon: User },
            { label: 'Total Download', value: '12.5K', icon: Download },
            { label: 'Kategori Riset', value: '12', icon: Tag }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.9 + i * 0.1 }}
              className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200 text-center"
            >
              <stat.icon className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center"
        >
          <Link
            href="/research"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-emerald-500/50 transition-all hover:scale-105"
          >
            Lihat Semua Publikasi
            <ExternalLink className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

