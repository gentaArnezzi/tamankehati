'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export function FeaturesSection() {
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

    const element = document.getElementById('features-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const features = [
    {
      title: 'Konservasi Ex-Situ',
      description: 'Melindungi spesies langka di luar habitat alami dengan teknologi terdepan',
      image: '/hero/forest.webp'

    },
    {
      title: 'Laboratorium Hidup',
      description: 'Pusat penelitian dan pengembangan untuk keanekaragaman hayati Indonesia',
      image: '/hero/forest.webp'

    },
    {
      title: 'Edukasi Interaktif',
      description: 'Program pembelajaran yang menginspirasi generasi muda untuk menjaga alam',
      image: '/hero/forest.webp'
    }
  ];

  return (
    <section id="features-section" className="py-32 bg-white">
      <div className="container mx-auto max-w-7xl px-6">
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-4xl font-light text-gray-900 mb-6">
            Mengapa Taman Kehati Penting?
          </h2>
          <p className="max-w-3xl mx-auto text-lg text-gray-600">
            Dalam era perubahan iklim dan hilangnya habitat, Taman Kehati menjadi benteng terakhir 
            untuk melindungi kekayaan hayati Indonesia yang tak ternilai.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 delay-${index * 200} ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {/* Image Background */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-light text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-600 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
        </div>
      </div>
    </section>
  );
}