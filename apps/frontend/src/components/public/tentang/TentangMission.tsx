export function TentangMission() {
  const missions = [
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Akurasi Data",
      description:
        "Memastikan semua data yang tersedia akurat, terverifikasi, dan selalu diperbarui oleh para ahli.",
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
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      title: "Akses Terbuka",
      description:
        "Menyediakan akses gratis untuk peneliti, akademisi, dan masyarakat umum yang peduli konservasi.",
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
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: "Inovasi Teknologi",
      description:
        "Menggunakan teknologi terdepan untuk mempermudah pencarian, analisis, dan visualisasi data.",
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      title: "Kolaborasi",
      description:
        "Membangun jaringan kolaborasi dengan berbagai institusi dan komunitas konservasi.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gray-900 mb-6">
            Komitmen Kami
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Kami berkomitmen untuk memberikan layanan terbaik dalam melestarikan
            keanekaragaman hayati Indonesia.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {missions.map((mission, index) => (
            <div
              key={index}
              className="text-center group hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-green-800 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 group-hover:shadow-lg">
                {mission.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {mission.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {mission.description}
              </p>
            </div>
          ))}
        </div>

        {/* Values Section */}
        <div className="mt-20">
          <div className="bg-gray-50 rounded-3xl p-12">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-light text-gray-900 mb-6">
                Nilai-Nilai Kami
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Prinsip-prinsip yang memandu setiap langkah kami dalam
                melestarikan keanekaragaman hayati Indonesia.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-white"
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
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  Passion
                </h4>
                <p className="text-gray-600">
                  Kecintaan mendalam terhadap alam dan keanekaragaman hayati
                  Indonesia.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  Integritas
                </h4>
                <p className="text-gray-600">
                  Menjaga kejujuran dan transparansi dalam setiap aspek
                  pekerjaan kami.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  Inovasi
                </h4>
                <p className="text-gray-600">
                  Terus berinovasi untuk memberikan solusi terbaik dalam
                  konservasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
