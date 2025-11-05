import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ketentuan Penggunaan | Taman Kehati",
  description: "Ketentuan dan syarat penggunaan platform Taman Kehati",
};

export default function KetentuanPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">
          Ketentuan Penggunaan
        </h1>
        
        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              Penerimaan Ketentuan
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Dengan mengakses dan menggunakan platform Taman Kehati, Anda menyetujui 
              untuk terikat oleh ketentuan penggunaan ini. Jika Anda tidak setuju 
              dengan ketentuan ini, mohon untuk tidak menggunakan platform ini.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              Penggunaan Platform
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Anda diizinkan untuk:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 mb-4">
              <li>Mengakses dan melihat konten publik yang tersedia</li>
              <li>Mengunggah data dan konten yang relevan dengan keanekaragaman hayati</li>
              <li>Berpartisipasi dalam diskusi dan forum</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mb-4">
              Anda dilarang untuk:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2">
              <li>Menggunakan platform untuk tujuan yang melanggar hukum</li>
              <li>Mengunggah konten yang menyesatkan, merugikan, atau melanggar hak cipta</li>
              <li>Mengganggu atau merusak sistem dan keamanan platform</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              Konten Pengguna
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Dengan mengunggah konten ke platform, Anda memberikan izin kepada 
              Taman Kehati untuk menggunakan, menampilkan, dan membagikan konten 
              tersebut untuk tujuan konservasi keanekaragaman hayati dan pendidikan.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              Keterbatasan Tanggung Jawab
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Platform Taman Kehati disediakan "sebagaimana adanya". Kami tidak 
              memberikan jaminan apapun mengenai keakuratan, kelengkapan, atau 
              ketersediaan konten di platform ini.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              Perubahan Ketentuan
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Kami berhak untuk mengubah ketentuan penggunaan ini kapan saja. 
              Perubahan akan diumumkan melalui platform. Penggunaan berkelanjutan 
              setelah perubahan berarti Anda menerima ketentuan yang baru.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              Kontak
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Jika Anda memiliki pertanyaan tentang ketentuan penggunaan ini, silakan 
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

