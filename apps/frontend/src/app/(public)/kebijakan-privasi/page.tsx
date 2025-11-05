import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | Taman Kehati",
  description: "Kebijakan privasi dan perlindungan data pribadi Taman Kehati",
};

export default function KebijakanPrivasiPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">
          Kebijakan Privasi
        </h1>
        
        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              Pendahuluan
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Taman Kehati menghormati privasi pengguna dan berkomitmen untuk melindungi 
              data pribadi yang dikumpulkan melalui platform ini. Kebijakan privasi ini 
              menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi 
              informasi Anda.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              Informasi yang Dikumpulkan
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Kami mengumpulkan informasi berikut:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2">
              <li>Informasi yang Anda berikan saat registrasi (nama, email, dll)</li>
              <li>Data yang Anda unggah (gambar, artikel, konten)</li>
              <li>Informasi penggunaan platform (log, cookies)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              Penggunaan Informasi
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Informasi yang dikumpulkan digunakan untuk:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 mt-4">
              <li>Menyediakan dan meningkatkan layanan platform</li>
              <li>Memproses dan menampilkan data keanekaragaman hayati</li>
              <li>Mengirim notifikasi dan komunikasi terkait layanan</li>
              <li>Memenuhi kewajiban hukum dan regulasi</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              Perlindungan Data
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Kami menggunakan langkah-langkah keamanan yang sesuai untuk melindungi 
              data pribadi Anda dari akses, perubahan, pengungkapan, atau penghancuran 
              yang tidak sah.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              Kontak
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan 
              hubungi kami di{" "}
              <a 
                href="mailto:info@tamankehati.id" 
                className="text-emerald-600 hover:text-emerald-700"
              >
                info@tamankehati.id
              </a>
            </p>
          </section>

          <section className="mb-8">
            <p className="text-sm text-slate-500 italic">
              Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

