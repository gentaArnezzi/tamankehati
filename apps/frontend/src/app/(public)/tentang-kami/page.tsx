import { Metadata } from "next";
import { TentangKamiHero } from "@/components/public/tentang-kami/TentangKamiHero";

export const metadata: Metadata = {
  title: "Tentang Kami | Taman Kehati",
  description:
    "Pelajari tentang Taman Kehati, pangkalan data keanekaragaman hayati Indonesia yang dikembangkan untuk mendukung pelaporan tahunan dan 5 tahunan sesuai Permen LH No 3 Tahun 2012.",
  openGraph: {
    title: "Tentang Kami | Taman Kehati",
    description:
      "Pangkalan data keanekaragaman hayati Indonesia untuk pelaporan tahunan dan 5 tahunan sesuai Permen LH No 3 Tahun 2012.",
    images: [
      {
        url: "/hero/forest.webp",
        width: 1200,
        height: 630,
        alt: "Taman Kehati - Konservasi Keanekaragaman Hayati Indonesia",
      },
    ],
  },
};

export const revalidate = 3600;

export default function TentangKamiPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Parallax */}
      <TentangKamiHero />

      {/* Tentang Pangkalan Data - Card Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8 md:p-12 shadow-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Tentang Pangkalan Data Taman Kehati
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              Pangkalan Data Taman Kehati adalah platform nasional untuk menghimpun, mengelola, dan menyajikan data keanekaragaman hayati dari Taman Kehati di seluruh Indonesia. Tujuannya: memperkuat konservasi, memudahkan pelaporan resmi, dan membuka akses informasi yang akurat bagi pengambil kebijakan, pengelola taman, peneliti, dan masyarakat.
            </p>
          </div>
        </div>
      </section>

      {/* Video Section - Placeholder untuk video Taman Kehati */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Video Taman Kehati
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Tonton video tentang Taman Kehati dan upaya konservasi keanekaragaman hayati Indonesia
            </p>
          </div>
          
          {/* Video Placeholder - Nanti bisa diganti dengan video embed */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-200 shadow-xl">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-600 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-slate-600 font-medium">
                  Video Taman Kehati akan ditampilkan di sini
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  {/* Nanti bisa ditambahkan embed video YouTube/Vimeo di sini */}
                  {/* Contoh: <iframe src="..." className="absolute inset-0 w-full h-full" /> */}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kehati & Taman Kehati - Grid Layout */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Apa itu Kehati */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                Apa itu Keanekaragaman Hayati (Kehati)?
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Keanekaragaman hayati adalah variasi kehidupan pada tingkat gen, spesies, hingga ekosistem. Sebagai negara megabiodiversitas, Indonesia memiliki ribuan spesies endemik yang berperan penting dalam kestabilan ekosistem, ketahanan pangan, sumber obat, dan keberlanjutan ekonomi. Karena itu, konservasi dan pengelolaan kehati menjadi prioritas dalam pembangunan berkelanjutan.
              </p>
            </div>

            {/* Apa itu Taman Kehati */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                Apa itu Taman Kehati?
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Taman Kehati (Taman Keanekaragaman Hayati) adalah kawasan konservasi yang dikembangkan untuk melestarikan kehati lokal—terutama flora dan fauna—melalui:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li><strong>Konservasi ex-situ:</strong> perlindungan spesies di luar habitat aslinya</li>
                <li><strong>Bank genetik:</strong> pelestarian sumber daya genetik</li>
                <li><strong>Pusat edukasi:</strong> pembelajaran dan literasi kehati</li>
                <li><strong>Riset & pengembangan:</strong> mendukung penelitian dan pemanfaatan berkelanjutan</li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-4">
                Taman Kehati tersebar di berbagai wilayah Indonesia dengan karakteristik ekosistem dan fokus konservasi yang berbeda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tujuan Platform - Card Grid */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tujuan Platform
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Platform ini dirancang untuk mendukung berbagai aspek konservasi dan pengelolaan keanekaragaman hayati
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Integrasi Data",
                desc: "Mengonsolidasikan data flora, fauna, ekosistem, dan aktivitas konservasi dari seluruh Taman Kehati",
                bgColor: "bg-emerald-100",
                dotColor: "bg-emerald-500",
              },
              {
                title: "Pelaporan Berkala",
                desc: "Mendukung penyusunan laporan tahunan dan lima tahunan secara efisien dan konsisten",
                bgColor: "bg-blue-100",
                dotColor: "bg-blue-500",
              },
              {
                title: "Transparansi & Akuntabilitas",
                desc: "Menyediakan informasi yang dapat ditelusuri sumbernya (traceable) untuk publik",
                bgColor: "bg-purple-100",
                dotColor: "bg-purple-500",
              },
              {
                title: "Dukungan Pengambilan Keputusan",
                desc: "Menyajikan data yang andal untuk perencanaan dan kebijakan konservasi",
                bgColor: "bg-amber-100",
                dotColor: "bg-amber-500",
              },
              {
                title: "Edukasi & Kolaborasi",
                desc: "Mendorong literasi kehati dan kerja sama lintas pemangku kepentingan",
                bgColor: "bg-teal-100",
                dotColor: "bg-teal-500",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-lg ${item.bgColor} flex items-center justify-center mb-4`}>
                  <div className={`w-6 h-6 rounded ${item.dotColor}`}></div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dukungan Laporan - Two Column Cards */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Dukungan Laporan Tahunan & Lima Tahunan
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
              Platform ini dirancang untuk memudahkan penyusunan laporan berkala
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border border-blue-200 shadow-lg">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">
                Laporan Tahunan
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Rekap populasi flora/fauna, kegiatan konservasi, indikator kinerja, dan capaian program.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 border border-purple-200 shadow-lg">
              <h3 className="text-2xl font-bold text-purple-900 mb-4">
                Laporan Lima Tahunan
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Analisis tren, evaluasi efektivitas program, serta perencanaan strategi periode berikutnya.
              </p>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <p className="text-slate-700 leading-relaxed text-center">
              <strong>Data yang tersimpan sudah terstruktur</strong> sehingga siap diekspor dan digunakan dalam dokumen resmi instansi terkait.
            </p>
          </div>
        </div>
      </section>

      {/* Dasar Hukum & Tata Kelola - Side by Side */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Dasar Hukum */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                Dasar Hukum
              </h2>
              <div className="space-y-4">
                <p className="text-slate-700 leading-relaxed">
                  Mengacu pada <strong className="text-slate-900">Peraturan Menteri Lingkungan Hidup Republik Indonesia Nomor 3 Tahun 2012 tentang Pangkalan Data Taman Keanekaragaman Hayati</strong>, yang mengatur bahwa:
                </p>
                <ul className="list-disc list-inside text-slate-700 space-y-2">
                  <li>Setiap Taman Kehati wajib memiliki pangkalan data berisi informasi flora, fauna, dan ekosistem</li>
                  <li>Data dikelola secara sistematis dan dapat diakses untuk keperluan pelaporan serta evaluasi</li>
                  <li>Pelaporan tahunan dan lima tahunan dilakukan berdasarkan data yang terintegrasi</li>
                  <li>Pangkalan data menunjang transparansi dan akuntabilitas pengelolaan konservasi</li>
                </ul>
                <p className="text-sm text-slate-600 italic pt-4 border-t border-slate-200">
                  Untuk rujukan lengkap, silakan melihat dokumen resmi yang diterbitkan oleh Kementerian Lingkungan Hidup (KLH).
                </p>
              </div>
            </div>

            {/* Tata Kelola & Kualitas Data */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                Tata Kelola & Kualitas Data
              </h2>
              <ul className="space-y-4">
                <li>
                  <strong className="text-slate-900 block mb-2">Pengelolaan:</strong>
                  <span className="text-slate-600">Data diinputkan oleh pengelola Taman Kehati dan diverifikasi berjenjang untuk memastikan akurasi.</span>
                </li>
                <li>
                  <strong className="text-slate-900 block mb-2">Kualitas Data:</strong>
                  <span className="text-slate-600">Menerapkan standar metadata, validasi, dan jejak audit agar data konsisten dan dapat ditelusuri.</span>
                </li>
                <li>
                  <strong className="text-slate-900 block mb-2">Akses Informasi:</strong>
                  <span className="text-slate-600">Penyajian informasi publik mengikuti ketentuan peraturan perundang-undangan yang berlaku.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Hubungi Kami - CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Hubungi Kami
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Ada pertanyaan atau membutuhkan informasi lebih lanjut? Silakan menghubungi kami melalui halaman kontak.
            </p>
            <a
              href="/kontak"
              className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg"
            >
              Kunjungi Halaman Kontak
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="py-8 bg-white border-t border-slate-200">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500 text-center">
            Terakhir diperbarui: 6 November 2025
          </p>
        </div>
      </section>
    </div>
  );
}
