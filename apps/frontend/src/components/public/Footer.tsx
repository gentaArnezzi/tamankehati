import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Flora', href: '/flora' },
  { label: 'Fauna', href: '/fauna' },
  { label: 'Taman', href: '/taman' },
  { label: 'Artikel', href: '/artikel' },
  { label: 'Galeri', href: '/galeri' },
];

const SUPPORT_LINKS = [
  { label: 'Indeks Kehati', href: '/tentang' },
  { label: 'Kontak', href: '/kontak' },
];

export function Footer() {
  return (
    <footer className="bg-white py-20">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid gap-16 md:grid-cols-4">
          <div className="md:col-span-2 space-y-6">
            <Link href="/" className="text-2xl font-semibold text-emerald-700">
              Taman Kehati
            </Link>
            <p className="text-base leading-relaxed text-slate-600 max-w-md">
              Portal nasional untuk data flora, fauna, dan taman konservasi. Dibangun untuk memperkuat riset, edukasi, serta
              aksi lapangan keanekaragaman hayati Indonesia.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold uppercase tracking-wide text-slate-700 mb-6">Navigasi</h3>
            <ul className="space-y-4 text-base text-slate-600">
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-emerald-600 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-base font-semibold uppercase tracking-wide text-slate-700 mb-6">Dukungan</h3>
            <ul className="space-y-4 text-base text-slate-600">
              {SUPPORT_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-emerald-600 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-4">
                <p className="text-sm uppercase tracking-wide text-slate-500 mb-2">Kontak</p>
                <p className="text-base text-slate-600">info@tamankehati.id</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-slate-200 pt-8 text-base text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} Taman Kehati. Semua hak dilindungi.</p>
          <div className="flex gap-8">
            <Link href="/kebijakan-privasi" className="hover:text-emerald-600 transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/ketentuan" className="hover:text-emerald-600 transition-colors">
              Ketentuan Penggunaan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
