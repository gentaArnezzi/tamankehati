'use client';

import { FeatureSteps } from '@/components/ui/feature-section';

export function AboutTamanSection() {
  const features = [
    {
      step: 'Konservasi Keanekaragaman Hayati',
      title: 'Konservasi Keanekaragaman Hayati',
      content: 'Taman Kehati adalah inisiatif konservasi di tingkat daerah yang fokus pada penyelamatan dan pemulihan spesies lokal. Mengoleksi, menumbuhkan, dan merawat tanaman serta satwa yang mewakili identitas ekoregion setempat.',
      image: '/hero/forest.webp'
    },
    {
      step: 'Edukasi Lingkungan',
      title: 'Edukasi Lingkungan',
      content: 'Mendorong edukasi lingkungan dan riset yang bertanggung jawab. Program pembelajaran yang mengajarkan pentingnya menjaga keseimbangan ekosistem dan keanekaragaman hayati.',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop'
    },
    {
      step: 'Partisipasi Masyarakat',
      title: 'Partisipasi Masyarakat',
      content: 'Masyarakat dapat terlibat melalui kegiatan penanaman, pengamatan biodiversitas, hingga program relawan. Wisata alam yang bertanggung jawab untuk meningkatkan kesadaran lingkungan.',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop'
    },
  ];

  return (
    <section id="about-taman-section" className="pt-12 pb-32 bg-white">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-light text-slate-900 md:text-6xl mb-6">
            Apa itu Taman Kehati?
          </h2>
          <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full"></div>
        </div>

        <FeatureSteps
          features={features}
          title=""
          autoPlayInterval={5000}
          className="py-0"
        />

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 text-emerald-600 font-medium">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Pelajari lebih lanjut tentang program konservasi kami
          </div>
        </div>
      </div>
    </section>
  );
}
