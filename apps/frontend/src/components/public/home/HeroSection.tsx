import Link from 'next/link';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden min-h-screen w-full -mt-20 pt-20">
      <Image
        src="/home/hero.jpg"
        alt="Taman Kehati Indonesia - Keanekaragaman Hayati dengan papan jalan kayu melintasi hutan tropis yang subur dengan bunga-bunga berwarna-warni dan burung macaw"
        fill
        className="object-cover"
        priority
      />
      
      {/* White gradient overlay from bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-white/20 to-transparent" />

      <div className="relative flex min-h-screen w-full items-center">
        <div className="container mx-auto max-w-7xl px-6 py-40 md:py-48">
          <div className="max-w-4xl space-y-8 text-black">
            <h1 className="text-balance text-5xl font-light leading-tight text-white md:text-7xl lg:text-8xl">
              Portal Keanekaragaman Hayati Indonesia
            </h1>
            <p className="text-xl leading-relaxed text-white/90 md:text-2xl max-w-3xl">
              Jelajahi data flora, fauna, dan taman konservasi dari seluruh nusantara. Dukung riset, edukasi, dan aksi
              konservasi berdampak melalui satu sumber data terpadu.
            </p>

            <div className="flex flex-col gap-6 pt-8 sm:flex-row sm:items-center">
              <Link
                href="/flora"
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-10 py-4 text-lg font-semibold text-white transition-all hover:bg-emerald-700 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white shadow-lg"
              >
                Jelajahi Flora
              </Link>
              <Link
                href="/taman"
                className="inline-flex items-center justify-center rounded-full border-2 border-white/30 bg-white/10 px-10 py-4 text-lg font-semibold text-white transition-all hover:bg-white/20 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white backdrop-blur-sm"
              >
                Lihat Peta Taman
              </Link>
              <Link
                href="/artikel"
                className="inline-flex items-center justify-center rounded-full border-2 border-white/20 bg-transparent px-10 py-4 text-lg font-semibold text-white transition-all hover:bg-white/10 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Baca Artikel
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />
    </section>
  );
}
