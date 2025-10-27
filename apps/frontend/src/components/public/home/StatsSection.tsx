'use client';

import { useState, useEffect, useRef } from 'react';

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const [counts, setCounts] = useState({
    species: 0,
    research: 0,
    education: 0,
    conservation: 0
  });

  const targets = {
    species: 500,
    research: 50,
    education: 25,
    conservation: 100
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('stats-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const stepDuration = duration / steps;

      const animateCount = (key: keyof typeof targets) => {
        let current = 0;
        const increment = targets[key] / steps;
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= targets[key]) {
            current = targets[key];
            clearInterval(timer);
          }
          setCounts(prev => ({ ...prev, [key]: Math.floor(current) }));
        }, stepDuration);
      };

      // Animate each counter with a slight delay
      setTimeout(() => animateCount('species'), 0);
      setTimeout(() => animateCount('research'), 200);
      setTimeout(() => animateCount('education'), 400);
      setTimeout(() => animateCount('conservation'), 600);
    }
  }, [isVisible]);

  const stats = [
    {
      number: counts.species,
      suffix: '+',
      label: 'Spesies Terdata',
      description: 'Database flora dan fauna Indonesia',
      gradient: 'from-emerald-500 to-green-600'
    },
    {
      number: counts.research,
      suffix: '+',
      label: 'Penelitian Aktif',
      description: 'Proyek riset konservasi berkelanjutan',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      number: counts.education,
      suffix: '+',
      label: 'Program Edukasi',
      description: 'Workshop dan pelatihan konservasi',
      gradient: 'from-teal-500 to-green-600'
    },
    {
      number: counts.conservation,
      suffix: '%',
      label: 'Tingkat Keberhasilan',
      description: 'Program konservasi yang berhasil',
      gradient: 'from-lime-500 to-green-600'
    }
  ];

  return (
    <section id="stats-section" className="py-40 bg-white">
      <div className="container mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className={`text-center mb-32 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-6xl font-light text-slate-900 mb-8">
            Dampak Nyata Konservasi
          </h2>
          <div className="w-32 h-1 bg-emerald-500 mx-auto rounded-full mb-8"></div>
          <p className="max-w-3xl mx-auto text-xl text-slate-600 leading-relaxed">
            Data real-time yang menunjukkan komitmen kami dalam melestarikan keanekaragaman hayati Indonesia
          </p>
        </div>

        {/* Stats Grid with Images */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32">
          {/* Left Column - Stats Cards */}
          <div className="space-y-10">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`group relative bg-white border border-slate-200 rounded-3xl p-10 hover:shadow-xl transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-5xl font-light text-slate-900 mb-3">
                      {stat.number.toLocaleString()}{stat.suffix}
                    </div>
                    <div className="text-xl font-semibold text-slate-700 mb-2">
                      {stat.label}
                    </div>
                    <div className="text-base text-slate-500">
                      {stat.description}
                    </div>
                  </div>
                  
                  {/* Mini Chart */}
                  <div className="w-20 h-16 flex items-end space-x-1">
                    {[65, 45, 80, 70, 90, 85, 95].map((height, i) => (
                      <div
                        key={i}
                        className={`w-2 bg-gradient-to-t ${stat.gradient} rounded-sm`}
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Images Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="aspect-square bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop&crop=center" 
                  alt="Forest conservation"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square bg-gradient-to-br from-teal-100 to-emerald-200 rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center" 
                  alt="Wildlife research"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="aspect-square bg-gradient-to-br from-green-100 to-teal-200 rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=400&fit=crop&crop=center" 
                  alt="Education program"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square bg-gradient-to-br from-lime-100 to-green-200 rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=400&fit=crop&crop=center" 
                  alt="Conservation success"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - True Full Screen */}
        <div className={`relative w-screen left-1/2 -translate-x-1/2 overflow-hidden transition-all duration-1000 delay-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="aspect-[5/1] bg-gradient-to-r from-emerald-500 to-green-600">
            <img 
              src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop&crop=center" 
              alt="Conservation impact"
              className="w-full h-full object-cover mix-blend-overlay"
            />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-center">
            <div className="container mx-auto px-6">
              <div className="max-w-2xl">
                <h3 className="text-4xl font-light text-white mb-4">
                  Komitmen Berkelanjutan
                </h3>
                <p className="text-lg text-white/90 leading-relaxed">
                  Setiap hari, kami bekerja untuk melindungi dan melestarikan kekayaan hayati Indonesia 
                  untuk generasi mendatang
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}