"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Menu, X } from "lucide-react";
import { TanyaKehatiButton } from "./chat/TanyaKehatiChat";
import { Logo } from "../ui/logo";

export function PublicHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const pathname = usePathname();

  // Check if we're on a page with hero section (list pages, not detail pages)
  // Detail pages have pattern like /flora/123, /fauna/456, /taman/789
  const isDetailPage = pathname.match(
    /\/(flora|fauna|taman|artikel|kegiatan)\/\d+/,
  );

  // Pages with hero section where navbar can be transparent at top
  const hasHeroSection =
    pathname === "/" ||
    pathname === "/flora" ||
    pathname === "/fauna" ||
    pathname === "/taman" ||
    pathname === "/artikel" ||
    pathname === "/kegiatan";

  // Detect desktop vs mobile
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Navbar is transparent when:
  // - On a page with hero section (not detail page)
  // - User hasn't scrolled yet
  const shouldBeTransparent = hasHeroSection && !isDetailPage && !isScrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          !shouldBeTransparent
            ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-4 max-w-7xl">
          {/* Left: Logo + Mobile Menu Button */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Mobile Menu Button - Only visible on mobile/tablet (< 1024px) */}
            {!isDesktop && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  !shouldBeTransparent
                    ? "text-slate-700 hover:bg-slate-100"
                    : "text-white hover:bg-white/10"
                }`}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            )}

            <Link href="/" prefetch={true} className="transition-opacity hover:opacity-80">
              <Logo
                size="md"
                textColor={shouldBeTransparent ? "text-white" : "text-slate-900"}
              />
            </Link>
          </div>

          {/* Desktop Navigation - Visible on desktop (>= 1024px) */}
          {isDesktop && (
            <nav className="flex items-center gap-8">
            <Link
              href="/"
              prefetch={true}
              className={`text-sm font-medium transition-colors hover:text-slate-600 ${
                !shouldBeTransparent ? "text-slate-700" : "text-white"
              }`}
            >
              Beranda
            </Link>

            {/* Eksplorasi Dropdown */}
            <div className="relative group">
              <button
                className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-slate-600 ${
                  !shouldBeTransparent ? "text-slate-700" : "text-white/90"
                }`}
              >
                Eksplorasi
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              <div className="absolute top-full left-0 mt-3 w-72 bg-white/98 backdrop-blur-xl rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-slate-200 z-[110]">
                <div className="py-4">
                  <Link
                    href="/flora"
                    prefetch={true}
                    className="block px-5 py-4 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors border-b border-slate-100"
                  >
                    <div className="font-medium text-slate-900">
                      Flora Indonesia
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Keanekaragaman tumbuhan
                    </div>
                  </Link>
                  <Link
                    href="/fauna"
                    prefetch={true}
                    className="block px-5 py-4 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors border-b border-slate-100"
                  >
                    <div className="font-medium text-slate-900">
                      Fauna Indonesia
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Keanekaragaman hewan
                    </div>
                  </Link>
                  <Link
                    href="/taman"
                    prefetch={true}
                    className="block px-5 py-4 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors border-b border-slate-100"
                  >
                    <div className="font-medium text-slate-900">
                      Taman Konservasi
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Area perlindungan alam
                    </div>
                  </Link>
                  <Link
                    href="/kegiatan"
                    prefetch={true}
                    className="block px-5 py-4 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors border-b border-slate-100"
                  >
                    <div className="font-medium text-slate-900">
                      Kegiatan Konservasi
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Aktivitas dan program konservasi
                    </div>
                  </Link>
                  <Link
                    href="/artikel"
                    prefetch={true}
                    className="block px-5 py-4 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <div className="font-medium text-slate-900">Artikel</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Informasi dan berita
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Informasi Dropdown */}
            <div className="relative group">
              <button
                className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-slate-600 ${
                  !shouldBeTransparent ? "text-slate-700" : "text-white/90"
                }`}
              >
                Informasi
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              <div className="absolute top-full left-0 mt-3 w-64 bg-white/98 backdrop-blur-xl rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-slate-200 z-[110]">
                <div className="py-4">
                  <Link
                    href="/indeks"
                    prefetch={true}
                    className="block px-5 py-4 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors border-b border-slate-100"
                  >
                    <div className="font-medium text-slate-900">
                      Indeks Kehati
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Dashboard data publik
                    </div>
                  </Link>
                  <Link
                    href="/tentang-kami"
                    prefetch={true}
                    className="block px-5 py-4 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors border-b border-slate-100"
                  >
                    <div className="font-medium text-slate-900">
                      Tentang Kami
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Informasi tentang Taman Kehati dan pangkalan data
                    </div>
                  </Link>
                  <Link
                    href="/misi"
                    prefetch={true}
                    className="block px-5 py-4 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors border-b border-slate-100"
                  >
                    <div className="font-medium text-slate-900">
                      Visi & Misi
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Visi, Misi dan tujuan konservasi
                    </div>
                  </Link>
                  <Link
                    href="/kontak"
                    prefetch={true}
                    className="block px-5 py-4 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <div className="font-medium text-slate-900">Kontak</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Hubungi kami
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          )}

          {/* Actions - Desktop */}
          {isDesktop && (
          <div className="flex items-center flex-shrink-0">
            {/* Tanya Kehati Button with Logo */}
            <Link
              href="/tanya-kehati"
              prefetch={true}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 min-h-[44px] ${
                !shouldBeTransparent ? "hover:bg-slate-50" : "hover:bg-white/10"
              }`}
            >
              <img
                src="/logo/logo_tanyakehati.png"
                alt="Tanya Kehati"
                className="w-8 h-8 object-contain"
              />
              <span
                className={`text-sm font-medium ${
                  !shouldBeTransparent ? "text-slate-700" : "text-white"
                }`}
              >
                Tanya Kehati
              </span>
            </Link>
          </div>
          )}

          {/* Actions - Mobile: Tanya Kehati button di mobile (optional, bisa dihilangkan jika tidak perlu) */}
          {!isDesktop && (
            <div className="flex items-center">
              <Link
                href="/tanya-kehati"
                prefetch={true}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 min-h-[44px] ${
                  !shouldBeTransparent ? "hover:bg-slate-50" : "hover:bg-white/10"
                }`}
              >
                <img
                  src="/logo/logo_tanyakehati.png"
                  alt="Tanya Kehati"
                  className="w-6 h-6 object-contain"
                />
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay - Outside header to ensure proper z-index */}
      {!isDesktop && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[199]"
          onClick={() => setMobileMenuOpen(false)}
          style={{ top: 0, left: 0, right: 0, bottom: 0 }}
        />
      )}

      {/* Mobile Menu Drawer - Outside header to ensure proper z-index */}
      {!isDesktop && (
        <div
          className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-[200] transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ top: 0 }}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <Logo size="md" className="text-slate-900" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-slate-700" />
              </button>
            </div>

            {/* Mobile Menu Content */}
            <nav className="flex-1 overflow-y-auto py-4">
              <div className="px-4 space-y-1">
                <Link
                  href="/"
                  prefetch={true}
                  className="block px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px] flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Beranda
                </Link>

                {/* Eksplorasi Section */}
                <div className="px-4 py-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Eksplorasi
                  </div>
                  <div className="space-y-1">
                    <Link
                      href="/flora"
                      prefetch={true}
                      className="block px-4 py-3 text-base text-slate-700 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px] flex flex-col justify-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="font-medium text-slate-900">Flora Indonesia</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Keanekaragaman tumbuhan
                      </div>
                    </Link>
                    <Link
                      href="/fauna"
                      prefetch={true}
                      className="block px-4 py-3 text-base text-slate-700 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px] flex flex-col justify-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="font-medium text-slate-900">Fauna Indonesia</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Keanekaragaman hewan
                      </div>
                    </Link>
                    <Link
                      href="/taman"
                      prefetch={true}
                      className="block px-4 py-3 text-base text-slate-700 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px] flex flex-col justify-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="font-medium text-slate-900">Taman Konservasi</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Area perlindungan alam
                      </div>
                    </Link>
                    <Link
                      href="/kegiatan"
                      prefetch={true}
                      className="block px-4 py-3 text-base text-slate-700 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px] flex flex-col justify-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="font-medium text-slate-900">Kegiatan Konservasi</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Aktivitas dan program konservasi
                      </div>
                    </Link>
                    <Link
                      href="/artikel"
                      prefetch={true}
                      className="block px-4 py-3 text-base text-slate-700 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px] flex flex-col justify-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="font-medium text-slate-900">Artikel</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Informasi dan berita
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Informasi Section */}
                <div className="px-4 py-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Informasi
                  </div>
                  <div className="space-y-1">
                    <Link
                      href="/indeks"
                      prefetch={true}
                      className="block px-4 py-3 text-base text-slate-700 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px] flex flex-col justify-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="font-medium text-slate-900">Indeks Kehati</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Dashboard data publik
                      </div>
                    </Link>
                    <Link
                      href="/tentang-kami"
                      prefetch={true}
                      className="block px-4 py-3 text-base text-slate-700 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px] flex flex-col justify-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="font-medium text-slate-900">Tentang Kami</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Informasi tentang Taman Kehati dan pangkalan data
                      </div>
                    </Link>
                    <Link
                      href="/misi"
                      prefetch={true}
                      className="block px-4 py-3 text-base text-slate-700 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px] flex flex-col justify-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="font-medium text-slate-900">Visi & Misi</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Visi, Misi dan tujuan konservasi
                      </div>
                    </Link>
                    <Link
                      href="/kontak"
                      prefetch={true}
                      className="block px-4 py-3 text-base text-slate-700 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px] flex flex-col justify-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="font-medium text-slate-900">Kontak</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Hubungi kami
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Tanya Kehati Button - Mobile */}
                <div className="px-4 pt-4 mt-4 border-t border-slate-200">
                  <Link
                    href="/tanya-kehati"
                    prefetch={true}
                    className="flex items-center gap-3 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors min-h-[44px]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <img
                      src="/logo/logo_tanyakehati.png"
                      alt="Tanya Kehati"
                      className="w-8 h-8 object-contain"
                    />
                    <span className="text-sm font-medium text-emerald-700">
                      Tanya Kehati
                    </span>
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <TanyaKehatiButton />
    </>
  );
}
