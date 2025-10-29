'use client';

import { MapPin } from 'lucide-react';
import Image from 'next/image';

export function TamanHero() {
  return (
    <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/tamankehati_images/task_01k8anse77f03bb23rej2dm5xz_1761295090_img_0.webp"
          alt="Taman Kehati Indonesia"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Dark black overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Subtle bottom overlay with standard dark brown */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-950/30 via-transparent to-transparent" />

      {/* Floating elements with brown theme */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-2 h-2 bg-amber-400 rounded-full animate-float"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-amber-500 rounded-full animate-float delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-amber-300 rounded-full animate-float delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-950/40 backdrop-blur-sm border border-amber-800/30 rounded-full text-amber-50 text-sm font-medium">
                <MapPin className="w-4 h-4" />
                Taman Kehati Indonesia
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white mb-8 leading-tight animate-slide-up">
              <span className="block">Taman</span>
              <span className="block font-normal text-amber-50">Konservasi</span>
            </h1>

            <p className="text-lg md:text-xl text-amber-50 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in delay-300">
              Jelajahi taman-taman keanekaragaman hayati Indonesia yang menakjubkan. 
              Dari hutan tropis hingga ekosistem unik, temukan kekayaan alam yang menjadi kebanggaan Nusantara.
            </p>

            <div className="flex flex-wrap justify-center gap-8 text-amber-100 animate-fade-in delay-500">
              <div className="text-center">
                <div className="text-lg font-medium text-white mb-1">8+</div>
                <div className="text-sm text-amber-100 uppercase tracking-wide">Taman Terdata</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-white mb-1">5+</div>
                <div className="text-sm text-amber-100 uppercase tracking-wide">Provinsi</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-white mb-1">Konservasi</div>
                <div className="text-sm text-amber-100 uppercase tracking-wide">Alam</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
