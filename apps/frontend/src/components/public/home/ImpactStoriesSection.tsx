'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Users, TreePine, TrendingUp, ChevronRight, Award, MapPin } from 'lucide-react';
import Link from 'next/link';

interface Story {
  id: number;
  title: string;
  location: string;
  category: string;
  impact: string;
  description: string;
  stats: { label: string; value: string }[];
  image: string;
  color: string;
}

export function ImpactStoriesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedStory, setSelectedStory] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('impact-stories-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const stories: Story[] = [
    {
      id: 1,
      title: 'Penyelamatan Orangutan Batang Toru',
      location: 'Sumatera Utara',
      category: 'Konservasi Fauna',
      impact: 'Populasi Meningkat 15%',
      description: 'Program konservasi kolaboratif berhasil menyelamatkan habitat orangutan tapanuli dan meningkatkan populasi mereka melalui restorasi hutan dan pemberdayaan masyarakat.',
      stats: [
        { label: 'Orangutan Diselamatkan', value: '47' },
        { label: 'Hektar Hutan Dipulihkan', value: '1,200' },
        { label: 'Keluarga Terlibat', value: '230' }
      ],
      image: 'https://images.unsplash.com/photo-1551739440-5dd934d3a94a?w=800&h=600&fit=crop',
      color: 'emerald'
    },
    {
      id: 2,
      title: 'Restorasi Terumbu Karang Bunaken',
      location: 'Sulawesi Utara',
      category: 'Ekosistem Laut',
      impact: '85% Terumbu Pulih',
      description: 'Inisiatif restorasi terumbu karang melibatkan komunitas lokal dan menghasilkan pemulihan ekosistem laut yang signifikan, meningkatkan biodiversitas dan mata pencaharian nelayan.',
      stats: [
        { label: 'Terumbu Ditanam', value: '5,400' },
        { label: 'Spesies Ikan Kembali', value: '123' },
        { label: 'Nelayan Terbantu', value: '450' }
      ],
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
      color: 'teal'
    },
    {
      id: 3,
      title: 'Pelestarian Rafflesia di Bengkulu',
      location: 'Bengkulu',
      category: 'Konservasi Flora',
      impact: '12 Koloni Baru Ditemukan',
      description: 'Program monitoring dan edukasi masyarakat berhasil melindungi habitat Rafflesia arnoldii dan menemukan koloni baru, memastikan kelestarian bunga langka ini.',
      stats: [
        { label: 'Koloni Terlindungi', value: '28' },
        { label: 'Hektar Kawasan', value: '350' },
        { label: 'Pemandu Lokal', value: '45' }
      ],
      image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&h=600&fit=crop',
      color: 'green'
    }
  ];

  const currentStory = stories[selectedStory];

  return (
    <section id="impact-stories-section" className="py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
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
            <Heart className="w-4 h-4" />
            Cerita Dampak Nyata
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Kisah Sukses
            <span className="block bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Konservasi Indonesia
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Perubahan nyata dimulai dari aksi kecil. Lihat bagaimana upaya konservasi membawa dampak besar bagi lingkungan dan masyarakat
          </p>
        </motion.div>

        {/* Main Story Display */}
        <div className="mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedStory}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Image Side */}
                <div className="relative h-96 lg:h-auto">
                  <img
                    src={currentStory.image}
                    alt={currentStory.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Impact Badge */}
                  <div className="absolute top-6 left-6">
                    <div className="bg-white/95 backdrop-blur-sm px-5 py-3 rounded-full shadow-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        <span className="font-bold text-gray-900">{currentStory.impact}</span>
                      </div>
                    </div>
                  </div>

                  {/* Award Badge */}
                  <div className="absolute top-6 right-6">
                    <div className="bg-emerald-600 text-white px-4 py-2 rounded-full flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span className="text-sm font-semibold">Success Story</span>
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="p-12">
                  <div className="mb-6">
                    <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
                      {currentStory.category}
                    </span>
                    <h3 className="text-4xl font-bold text-gray-900 mb-4">
                      {currentStory.title}
                    </h3>
                    <p className="text-lg text-gray-500 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {currentStory.location}
                    </p>
                  </div>

                  <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    {currentStory.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {currentStory.stats.map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-200 text-center"
                      >
                        <div className="text-3xl font-bold text-emerald-600 mb-1">
                          {stat.value}
                        </div>
                        <div className="text-xs text-gray-600 leading-tight">
                          {stat.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/impact-stories/${currentStory.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-emerald-500/50 transition-all hover:scale-105"
                  >
                    Baca Cerita Lengkap
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Story Selector */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {stories.map((story, index) => (
            <motion.button
              key={story.id}
              onClick={() => setSelectedStory(index)}
              whileHover={{ y: -4 }}
              className={`text-left p-6 rounded-2xl transition-all ${
                selectedStory === index
                  ? 'bg-gradient-to-br from-emerald-600 to-green-600 text-white shadow-xl shadow-emerald-500/50'
                  : 'bg-white text-gray-700 hover:shadow-lg border border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  selectedStory === index ? 'bg-white/20' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {story.category}
                </span>
                {selectedStory === index && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-white rounded-full flex items-center justify-center"
                  >
                    <div className="w-3 h-3 bg-emerald-600 rounded-full" />
                  </motion.div>
                )}
              </div>
              <h4 className={`font-bold mb-2 ${selectedStory === index ? 'text-white' : 'text-gray-900'}`}>
                {story.title}
              </h4>
              <p className={`text-sm mb-2 ${selectedStory === index ? 'text-white/80' : 'text-gray-500'}`}>
                {story.location}
              </p>
              <div className={`text-sm font-semibold flex items-center gap-1 ${selectedStory === index ? 'text-white' : 'text-emerald-600'}`}>
                <TrendingUp className="w-4 h-4" />
                {story.impact}
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Overall Impact Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold mb-4">Total Dampak Konservasi 2024</h3>
              <p className="text-xl text-white/90">
                Hasil kolaborasi seluruh stakeholder konservasi Indonesia
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: TreePine, label: 'Hektar Dilindungi', value: '12,500+' },
                { icon: Heart, label: 'Spesies Diselamatkan', value: '340+' },
                { icon: Users, label: 'Komunitas Terlibat', value: '2,800+' },
                { icon: Award, label: 'Program Sukses', value: '67' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center hover:bg-white/20 transition-all"
                >
                  <stat.icon className="w-10 h-10 mx-auto mb-4" />
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

