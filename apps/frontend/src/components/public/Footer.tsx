import Link from "next/link";
import { Logo } from "../ui/logo";

const NAV_LINKS = [
  { label: "Flora", href: "/flora" },
  { label: "Fauna", href: "/fauna" },
  { label: "Taman", href: "/taman" },
  { label: "Artikel", href: "/artikel" },
];

const SUPPORT_LINKS = [
  { label: "Indeks Kehati", href: "/indeks" },
  { label: "Kontak", href: "/kontak" },
];

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Brand Section */}
          <div className="lg:col-span-5">
            <Link href="/" prefetch={true} className="inline-block mb-4 sm:mb-6">
              <Logo size="lg" />
            </Link>
                <p className="text-slate-500 leading-relaxed max-w-md" style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)' }}>
              Portal nasional untuk data flora, fauna, dan taman konservasi
              Indonesia. Memperkuat riset, edukasi, dan aksi lapangan
              keanekaragaman hayati.
            </p>
            <div className="mt-4 sm:mt-6">
                  <p className="text-slate-500 mb-1" style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)' }}>Kontak</p>
                  <a
                    href="mailto:info@tamankehati.id"
                    className="text-slate-600 hover:text-emerald-600 transition-colors break-all" style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)' }}
              >
                info@tamankehati.id
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-3">
            <h3 className="font-medium text-slate-700 mb-3 sm:mb-4" style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)' }}>
              Navigasi
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={true}
                    className="text-slate-500 hover:text-emerald-600 transition-colors min-h-[44px] flex items-center"
                    style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)' }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="lg:col-span-4">
            <h3 className="font-medium text-slate-700 mb-3 sm:mb-4" style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)' }}>
              Dukungan
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {SUPPORT_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={true}
                    className="text-slate-500 hover:text-emerald-600 transition-colors min-h-[44px] flex items-center"
                    style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)' }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-slate-400 text-center sm:text-left text-sm" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>
              © {new Date().getFullYear()} Taman Kehati. Semua hak dilindungi.
            </p>
            <div className="flex flex-wrap gap-4 sm:gap-6 justify-center sm:justify-end">
              <Link
                href="/kebijakan-privasi"
                prefetch={true}
                className="text-slate-400 hover:text-slate-600 transition-colors min-h-[44px] flex items-center text-sm"
                style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
              >
                Kebijakan Privasi
              </Link>
              <Link
                href="/ketentuan"
                prefetch={true}
                className="text-slate-400 hover:text-slate-600 transition-colors min-h-[44px] flex items-center text-sm"
                style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
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
