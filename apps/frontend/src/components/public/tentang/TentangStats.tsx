export function TentangStats() {
  const stats = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
      number: "50,000+",
      label: "Spesies Flora",
      description:
        "Data tumbuhan yang telah teridentifikasi dan terdokumentasi",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
      number: "1,500+",
      label: "Spesies Fauna",
      description: "Data hewan yang telah teridentifikasi dan terdokumentasi",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      number: "200+",
      label: "Taman Konservasi",
      description: "Area konservasi yang telah terdata dan terpantau",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
      number: "10,000+",
      label: "Pengguna Aktif",
      description:
        "Peneliti, akademisi, dan masyarakat yang menggunakan platform",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gray-900 mb-6">
            Pencapaian Kami
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Data dan statistik yang menunjukkan dampak positif platform Taman
            Kehati dalam konservasi keanekaragaman hayati Indonesia.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>

              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stat.number}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {stat.label}
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16">
          <div className="bg-white rounded-3xl p-12 shadow-sm">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  95%
                </div>
                <p className="text-gray-600">Akurasi Data</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  24/7
                </div>
                <p className="text-gray-600">Akses Platform</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  100+
                </div>
                <p className="text-gray-600">Institusi Mitra</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-3xl p-12 text-white">
            <h3 className="text-3xl font-light mb-6">
              Bergabunglah dengan Komunitas Konservasi
            </h3>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Mari bersama-sama melestarikan keanekaragaman hayati Indonesia
              untuk generasi mendatang.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-emerald-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Mulai Eksplorasi
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors">
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
