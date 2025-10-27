import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown } from 'lucide-react';

export function ParkHero() {
  return (
    <section className="relative isolate overflow-hidden min-h-[70vh] w-full -mt-16 pt-16 flex items-center">
      {/* Background Image with Parallax */}
      <div className="absolute inset-0">
        <Image
          src="/hero/forest.webp"
          alt="Taman Kehati Indonesia"
          fill
          priority
          className="object-cover object-center parallax-bg"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/90 px-6 py-3 text-sm font-medium uppercase tracking-widest backdrop-blur mb-8 text-black">
              Jaringan Taman Kehati
            </div>

            {/* Title */}
            <h1 className="text-5xl font-light leading-tight text-white mb-6 md:text-7xl">
              Taman Kehati
            </h1>

            {/* Description */}
            <p className="text-lg leading-relaxed text-white/85 md:text-xl max-w-2xl">
              Jelajahi jaringan taman konservasi keanekaragaman hayati di seluruh Indonesia. Temukan taman-taman yang melindungi spesies lokal dan mendukung upaya konservasi.
            </p>

            {/* Stats Indicators */}
            <div className="mt-10 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <span className="block h-3 w-3 rounded-full bg-emerald-400" />
                <span className="text-sm text-white/80">50+ Taman</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="block h-3 w-3 rounded-full bg-blue-400" />
                <span className="text-sm text-white/80">15+ Provinsi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="block h-3 w-3 rounded-full bg-orange-400" />
                <span className="text-sm text-white/80">1000+ Spesies</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowDown className="h-8 w-8 text-white" />
      </div>
    </section>
  );
}
