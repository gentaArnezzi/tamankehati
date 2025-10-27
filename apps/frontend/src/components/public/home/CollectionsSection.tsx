'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThreeDPhotoCarousel, type CarouselItem } from '@/components/ui/3d-carousel';

export function CollectionsSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('collections-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const collections: CarouselItem[] = [
    {
      imgUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=600&fit=crop',
      name: 'Rafflesia Arnoldii',
      scientificName: 'Rafflesia arnoldii',
      category: 'flora',
      status: 'Endemik',
      region: 'Sumatera',
      description: 'Bunga terbesar di dunia yang endemik di hutan Sumatera dengan diameter mencapai 1 meter'
    },
    {
      imgUrl: 'https://images.unsplash.com/photo-1551739440-5dd934d3a94a?w=600&h=600&fit=crop',
      name: 'Orangutan Sumatera',
      scientificName: 'Pongo abelii',
      category: 'fauna',
      status: 'Kritis',
      region: 'Sumatera',
      description: 'Primata besar yang terancam punah di hutan Sumatera, dikenal dengan kecerdasan dan perilaku sosialnya'
    },
    {
      imgUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&h=600&fit=crop',
      name: 'Anggrek Hitam',
      scientificName: 'Coelogyne pandurata',
      category: 'flora',
      status: 'Lindungi',
      region: 'Kalimantan',
      description: 'Anggrek endemik Kalimantan dengan bunga berwarna hitam yang langka dan eksotis'
    },
    {
      imgUrl: 'https://images.unsplash.com/photo-1534188753412-5de315c1f1c0?w=600&h=600&fit=crop',
      name: 'Komodo',
      scientificName: 'Varanus komodoensis',
      category: 'fauna',
      status: 'Endemik',
      region: 'Nusa Tenggara',
      description: 'Kadal terbesar di dunia yang hanya ditemukan di Indonesia, dapat tumbuh hingga 3 meter'
    },
    {
      imgUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop',
      name: 'Bunga Bangkai',
      scientificName: 'Amorphophallus titanum',
      category: 'flora',
      status: 'Lindungi',
      region: 'Sumatera',
      description: 'Bunga dengan perbungaan tertinggi di dunia, dapat mencapai tinggi 3 meter'
    },
    {
      imgUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&h=600&fit=crop',
      name: 'Jalak Bali',
      scientificName: 'Leucopsar rothschildi',
      category: 'fauna',
      status: 'Kritis',
      region: 'Bali',
      description: 'Burung endemik Bali yang menjadi simbol konservasi dengan bulu putih yang indah'
    },
    {
      imgUrl: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=600&h=600&fit=crop',
      name: 'Harimau Sumatera',
      scientificName: 'Panthera tigris sumatrae',
      category: 'fauna',
      status: 'Kritis',
      region: 'Sumatera',
      description: 'Subspesies harimau terkecil yang hanya hidup di Pulau Sumatera'
    },
    {
      imgUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=600&fit=crop',
      name: 'Kantong Semar',
      scientificName: 'Nepenthes',
      category: 'flora',
      status: 'Lindungi',
      region: 'Kalimantan',
      description: 'Tumbuhan karnivora unik yang dapat menangkap serangga dengan kantongnya'
    },
    {
      imgUrl: 'https://images.unsplash.com/photo-1503066211613-c17ebc9daef0?w=600&h=600&fit=crop',
      name: 'Elang Jawa',
      scientificName: 'Nisaetus bartelsi',
      category: 'fauna',
      status: 'Kritis',
      region: 'Jawa',
      description: 'Burung nasional Indonesia yang menjadi simbol keberanian dan kekuatan'
    },
    {
      imgUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=600&fit=crop',
      name: 'Edelweiss Jawa',
      scientificName: 'Anaphalis javanica',
      category: 'flora',
      status: 'Lindungi',
      region: 'Jawa',
      description: 'Bunga abadi yang tumbuh di puncak gunung-gunung tinggi di Jawa'
    }
  ];

  return (
    <section id="collections-section" className="py-40 bg-slate-50">
      <div className="container mx-auto max-w-7xl px-6">
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-6xl font-light text-slate-900 mb-8">
            Koleksi Taman Kehati
          </h2>
          <div className="w-32 h-1 bg-emerald-500 mx-auto rounded-full mb-8"></div>
          <p className="max-w-3xl mx-auto text-xl text-slate-600 leading-relaxed">
            Jelajahi kekayaan flora dan fauna Indonesia yang dilindungi di taman-taman konservasi 
            di seluruh Nusantara. Setiap spesies memiliki cerita unik tentang evolusi dan adaptasi.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            🖱️ Geser carousel untuk melihat lebih banyak • Klik kartu untuk detail lengkap
          </p>
        </div>

        {/* 3D Carousel */}
        <div className={`mb-20 transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="max-w-6xl mx-auto">
            <ThreeDPhotoCarousel items={collections} />
          </div>
        </div>

        {/* Call to Action */}
        <div className={`text-center transition-all duration-1000 delay-600 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="rounded-3xl p-12">
            <h3 className="text-3xl font-semibold text-slate-900 mb-6">
              Temukan Lebih Banyak Koleksi
            </h3>
            <p className="text-slate-600 mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
              Jelajahi ribuan spesies flora dan fauna yang telah didokumentasikan 
              dalam database Taman Kehati. Setiap penemuan baru membuka wawasan 
              tentang keanekaragaman hayati Indonesia.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/flora"
                className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all hover:scale-105 shadow-lg"
              >
                Jelajahi Flora
              </Link>
              <Link
                href="/fauna"
                className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all hover:scale-105 shadow-lg"
              >
                Jelajahi Fauna
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
