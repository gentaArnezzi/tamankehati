'use client';

// No icons needed for minimalist design

export function MisiHero() {
  return (
    <section 
      className="py-24 md:py-32 bg-cover bg-center bg-no-repeat border-b border-gray-200 relative"
      style={{
        backgroundImage: "url('/hero/forest.webp')"
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/90" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="text-sm text-gray-500 mb-6 tracking-wide uppercase">
            Misi Konservasi
          </div>
          
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-8 leading-tight">
            Misi Kami
          </h1>
          
          <p className="text-lg text-gray-600 mb-10 leading-relaxed">
            Melestarikan keanekaragaman hayati Indonesia melalui teknologi, kolaborasi, 
            dan aksi nyata yang berkelanjutan untuk generasi mendatang.
          </p>

          {/* Mission Pillars */}
          <div className="space-y-4 mb-8">
            <div className="text-sm text-gray-600">
              Konservasi Flora
            </div>
            <div className="text-sm text-gray-600">
              Konservasi Fauna
            </div>
            <div className="text-sm text-gray-600">
              Ekosistem Berkelanjutan
            </div>
          </div>

          {/* Ministry Info */}
          <div className="text-gray-500 text-sm">
            Dikelola oleh Kementerian Lingkungan Hidup dan Kehutanan
          </div>
        </div>
      </div>
    </section>
  );
}
