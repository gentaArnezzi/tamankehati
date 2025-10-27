'use client';

import { useState, useEffect } from 'react';
import { ArcGalleryHero } from '@/components/ui/arc-gallery-hero-component';

export function AboutSection() {
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

    const element = document.getElementById('about-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  // Array of forest and nature images from Unsplash
  const forestImages = [
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=400&auto=format&fit=crop', // tropical rainforest
    'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?q=80&w=400&auto=format&fit=crop', // colorful parrot
    'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=400&auto=format&fit=crop', // jungle ferns
    'https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=400&auto=format&fit=crop', // orchid flower
    'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?q=80&w=400&auto=format&fit=crop', // butterfly macro
    'https://images.unsplash.com/photo-1456926631375-92c8ce872def?q=80&w=400&auto=format&fit=crop', // misty jungle
    'https://images.unsplash.com/photo-1552083375-1447ce886485?q=80&w=400&auto=format&fit=crop', // hummingbird
    'https://images.unsplash.com/photo-1509005084666-3cbc75184cbb?q=80&w=400&auto=format&fit=crop', // waterfall forest
    'https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=400&auto=format&fit=crop', // monkey fauna
    'https://images.unsplash.com/photo-1509023464722-18d996393ca8?q=80&w=400&auto=format&fit=crop', // palm trees
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=400&auto=format&fit=crop', // tiger wildlife
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=400&auto=format&fit=crop', // forest landscape

  ];
    

  return (
    <section id="about-section" className="relative min-h-[120vh] py-32">
      {/* Arc Gallery Background */}
      <div className="absolute inset-0 z-0 -top-40">
        <ArcGalleryHero 
          images={forestImages}
          startAngle={20}
          endAngle={160}
          radiusLg={700}
          radiusMd={550}
          radiusSm={400}
          cardSizeLg={180}
          cardSizeMd={140}
          cardSizeSm={110}
        />
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10 flex min-h-[120vh] items-end justify-center pb-40 pointer-events-none">
        <div className="container mx-auto max-w-7xl px-8 pointer-events-auto">
          <div className={`text-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {/* Badge */}
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/95 px-8 py-4 text-sm font-medium text-slate-800 mb-32 shadow-sm backdrop-blur-sm">
              Selamat Datang di Taman Kehati Indonesia
            </div>
            
            {/* Main Content */}
            <div className="max-w-5xl mx-auto">
              <p className="text-3xl leading-relaxed text-slate-800 mb-32 font-light tracking-wide">
                Sebuah benteng konservasi yang didedikasikan untuk melindungi dan melestarikan kekayaan flora dan fauna asli Nusantara. 
                Temukan laboratorium alam kami, tempat spesies langka dirawat dan generasi baru terinspirasi untuk menjaga bumi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
