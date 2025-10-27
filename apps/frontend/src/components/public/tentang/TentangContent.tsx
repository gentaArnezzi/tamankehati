'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export function TentangContent() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const functions = [
    {
      title: "Konservasi",
      description: "Melindungi dan melestarikan spesies tumbuhan dan satwa lokal yang terancam punah atau langka, serta menjaga keberlangsungan ekosistem pendukungnya seperti penyerbuk dan pemencar biji.",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop",
      isEmergency: true,
      emergencyText: "TERANCAM PUNAH"
    },
    {
      title: "Edukasi", 
      description: "Menjadi tempat pembelajaran bagi masyarakat, terutama pelajar, untuk mengenal jenis-jenis tanaman lokal, manfaatnya, dan pentingnya menjaga keanekaragaman hayati.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070&auto=format&fit=crop",
      isEmergency: false
    },
    {
      title: "Rekreasi",
      description: "Menyediakan ruang hijau yang nyaman bagi masyarakat untuk bersantai, beraktivitas fisik, dan menikmati keindahan alam.",
      image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2070&auto=format&fit=crop",
      isEmergency: false
    },
    {
      title: "Pengembangan Berbasis Teknologi",
      description: "Beberapa taman kehati memanfaatkan teknologi seperti barcode, sistem hologram, atau aplikasi virtual untuk memberikan informasi lengkap kepada pengunjung tentang koleksi flora dan fauna di dalamnya.",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=2025&auto=format&fit=crop",
      isEmergency: false
    }
  ];

  return (
    <div className="bg-white">
      {/* Emergency Conservation Alert */}
      <section className="py-20 bg-red-600">
        <div className="container mx-auto max-w-6xl px-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-4 bg-white text-red-600 px-8 py-4 rounded-lg text-xl font-black uppercase tracking-widest mb-8">
              URGENT: KONSERVASI SPESIES TERANCAM PUNAH
            </div>
            <p className="text-xl text-white font-semibold max-w-5xl mx-auto leading-relaxed">
              Taman Kehati Indonesia berperan kritis dalam melindungi dan melestarikan spesies tumbuhan dan satwa yang terancam punah, menjaga keberlangsungan ekosistem yang mendukung kehidupan di Indonesia.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-40">
        <div className="container mx-auto max-w-6xl px-12">
          <div className="text-center">
            <h2 className="text-5xl font-thin text-gray-900 mb-12">
              Fungsi dan Tujuan Utama
            </h2>
            <div className="w-24 h-px bg-gray-300 mx-auto mb-16"></div>
            <p className="text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto font-light">
              Taman Kehati berfungsi sebagai pusat konservasi in-situ dan ex-situ serta menjadi sarana edukasi dan rekreasi bagi masyarakat untuk memperkenalkan keanekaragaman hayati Indonesia secara lebih dekat, termasuk penggunaan teknologi informasi untuk edukasi.
            </p>
          </div>
        </div>
      </section>

      {/* Functions - Clean Design */}
      {functions.map((func, index) => (
        <section key={index} className={`py-20 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
          <div className="container mx-auto max-w-6xl px-12">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Content */}
              <div className={`${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                {/* Emergency Badge for Conservation */}
                {func.isEmergency && (
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-lg text-sm font-black uppercase tracking-widest">
                      {func.emergencyText}
                    </div>
                  </div>
                )}

                <h3 className={`text-4xl font-bold mb-6 ${
                  func.isEmergency ? 'text-red-600' : 'text-green-800'
                }`}>
                  {func.title}
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed font-medium">
                  {func.description}
                </p>
              </div>

              {/* Image */}
              <div className={`${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src={func.image}
                    alt={func.title}
                    width={600}
                    height={450}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Ministry Section - Dark Green Design */}
      <section className="py-40 bg-green-800">
        <div className="container mx-auto max-w-6xl px-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-12">
              Pengelolaan
            </h2>
            <div className="w-20 h-px bg-white mx-auto mb-16"></div>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-white font-semibold leading-relaxed mb-12">
                Taman Kehati dikelola oleh <span className="font-black">Kementerian Lingkungan Hidup</span> sebagai bagian dari upaya nasional untuk melestarikan keanekaragaman hayati Indonesia dan mendukung pembangunan berkelanjutan.
              </p>
              <div className="bg-white rounded-2xl p-12 shadow-2xl border-l-8 border-green-800">
                <h3 className="text-2xl font-bold text-green-800 mb-6">Kementerian Lingkungan Hidup</h3>
                <p className="text-gray-700 font-medium leading-relaxed">
                  Bertanggung jawab dalam pengelolaan, pengawasan, dan pengembangan Taman Kehati di seluruh Indonesia untuk memastikan konservasi keanekaragaman hayati yang efektif dan berkelanjutan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
