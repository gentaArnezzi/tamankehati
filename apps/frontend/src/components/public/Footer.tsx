import Link from 'next/link';
import { Logo } from '../ui/logo';

const NAV_LINKS = [
  { label: 'Flora', href: '/flora' },
  { label: 'Fauna', href: '/fauna' },
  { label: 'Taman', href: '/taman' },
  { label: 'Artikel', href: '/artikel' },
];

const SUPPORT_LINKS = [
  { label: 'Tentang', href: '/tentang' },
  { label: 'Kontak', href: '/kontak' },
];

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto max-w-6xl px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Brand Section */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-block mb-6">
              <Logo size="lg" />
            </Link>
            <p className="text-slate-600 leading-relaxed max-w-md text-sm">
              Portal nasional untuk data flora, fauna, dan taman konservasi Indonesia. 
              Memperkuat riset, edukasi, dan aksi lapangan keanekaragaman hayati.
            </p>
            <div className="mt-6">
              <p className="text-sm text-slate-500 mb-1">Kontak</p>
              <a 
                href="mailto:info@tamankehati.id" 
                className="text-slate-700 hover:text-emerald-600 transition-colors text-sm"
              >
                info@tamankehati.id
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Navigasi</h3>
            <ul className="space-y-3">
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className="text-slate-600 hover:text-emerald-600 transition-colors text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="lg:col-span-4">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Dukungan</h3>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className="text-slate-600 hover:text-emerald-600 transition-colors text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Taman Kehati. Semua hak dilindungi.
            </p>
            <div className="flex gap-6">
              <Link 
                href="/kebijakan-privasi" 
                className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                Kebijakan Privasi
              </Link>
              <Link 
                href="/ketentuan" 
                className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                Ketentuan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
