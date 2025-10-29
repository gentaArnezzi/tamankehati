'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { fetchFeaturedItems, FeaturedItem } from '../../../lib/api/featured';

export function MinimalFeaturedSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  
  const [features, setFeatures] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeaturedItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchFeaturedItems();
        setFeatures(data);
      } catch (err) {
        console.error('Error loading featured items:', err);
        setError('Gagal memuat data spesies unggulan');
        // Fallback to default data if API fails
        setFeatures([
          {
            id: 1,
            category: 'Flora',
            title: 'Rafflesia Arnoldii',
            description: 'Bunga terbesar di dunia, endemik Sumatera',
            image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=400&fit=crop',
            link: '/flora/1'
          },
          {
            id: 2,
            category: 'Fauna',
            title: 'Orangutan Sumatera',
            description: 'Primata langka dengan DNA 97% mirip manusia',
            image: 'https://images.unsplash.com/photo-1551739440-5dd934d3a94a?w=600&h=400&fit=crop',
            link: '/fauna/1'
          },
          {
            id: 3,
            category: 'Konservasi',
            title: 'Taman Nasional Komodo',
            description: 'Habitat kadal terbesar di dunia',
            image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop',
            link: '/taman/1'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedItems();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-white">
      <div className="container mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-5xl md:text-6xl font-light text-slate-900 mb-6"
          >
            Spesies Unggulan
          </motion.h2>
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={isInView ? { width: '6rem', opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="h-1 bg-emerald-500 mx-auto rounded-full mb-6"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Kenali kekayaan hayati Indonesia yang dilindungi dan dilestarikan
          </motion.p>
        </div>

        {/* Features Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex items-center gap-3 text-gray-600">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Memuat spesies unggulan...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-gray-500 text-sm">Menampilkan data contoh</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ 
                  duration: 0.7, 
                  delay: 0.4 + index * 0.15,
                  ease: "easeOut"
                }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <Link href={feature.link} className="group block">
                  <div className="relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-2xl transition-shadow duration-500">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        onError={(e) => {
                          // Fallback to default image if the API image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=400&fit=crop';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Category badge on hover */}
                      <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-emerald-600 uppercase tracking-wide opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        {feature.category}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="text-xs font-medium text-emerald-600 mb-2 uppercase tracking-wide opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                        {feature.category}
                      </div>
                      <h3 className="text-xl font-medium text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors duration-300">
                        {feature.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900 group-hover:text-emerald-600 transition-all duration-300">
                        <span className="group-hover:font-semibold transition-all">Pelajari</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

