'use client';

import { FileText } from 'lucide-react';
import Image from 'next/image';

export function ArtikelHero() {
  return (
    <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/tamankehati_images/task_01k8anse77f03bb23rej2dm5xz_1761295090_img_0.webp"
          alt="Artikel Keanekaragaman Hayati Indonesia"
          fill
          className="object-cover"
          priority
        />
      </div>

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
                <FileText className="w-4 h-4" />
                Artikel Keanekaragaman Hayati
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white mb-8 leading-tight animate-slide-up">
              <span className="block">Artikel</span>
              <span className="block font-normal text-amber-50">Kehati</span>
            </h1>

            <p className="text-lg md:text-xl text-amber-50 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in delay-300">
              Kurasi kisah konservasi, pembelajaran lapangan, dan penelitian terbaru dari jejaring Taman Kehati.
              Temukan wawasan mendalam tentang keanekaragaman hayati Indonesia.
            </p>

            <div className="flex flex-wrap justify-center gap-8 text-amber-100 animate-fade-in delay-500">
              <div className="text-center">
                <div className="text-lg font-medium text-white mb-1">Edukasi</div>
                <div className="text-sm text-amber-100 uppercase tracking-wide">& Riset</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-white mb-1">Konservasi</div>
                <div className="text-sm text-amber-100 uppercase tracking-wide">Alam</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-white mb-1">Cerita</div>
                <div className="text-sm text-amber-100 uppercase tracking-wide">Lapangan</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}