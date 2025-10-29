'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { TanyaKehatiButton } from './chat/TanyaKehatiChat';
import { Logo } from '../ui/logo';

export function PublicHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  
  // Check if we're on a page with hero section (list pages, not detail pages)
  // Detail pages have pattern like /flora/123, /fauna/456, /taman/789
  const isDetailPage = pathname.match(/\/(flora|fauna|taman|artikel|kegiatan)\/\d+/);
  
  // Pages with hero section where navbar can be transparent at top
  const hasHeroSection = pathname === '/' || 
                         pathname === '/flora' || 
                         pathname === '/fauna' || 
                         pathname === '/taman' ||
                         pathname === '/artikel' ||
                         pathname === '/kegiatan';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navbar is transparent when:
  // - On a page with hero section (not detail page)
  // - User hasn't scrolled yet
  const shouldBeTransparent = hasHeroSection && !isDetailPage && !isScrolled;

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        !shouldBeTransparent
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm' 
          : 'bg-transparent border-b border-transparent'
      }`}>
        <div className="container mx-auto flex items-center justify-between px-6 py-4 max-w-7xl">
          <a 
            className="transition-opacity hover:opacity-80" 
            href="/"
          >
            <Logo 
              size="md" 
              className={!shouldBeTransparent ? 'text-slate-900' : 'text-white'} 
            />
          </a>
          
          {/* Navigation - Always Visible */}
          <nav className="flex items-center gap-8">
            <a 
              className={`text-sm font-medium transition-colors hover:text-slate-600 ${
                !shouldBeTransparent ? 'text-slate-700' : 'text-white'
              }`} 
              href="/"
            >
              Beranda
            </a>
            
            {/* Eksplorasi Dropdown */}
            <div className="relative group">
              <button className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-slate-600 ${
                !shouldBeTransparent ? 'text-slate-700' : 'text-white/90'
              }`}>
                Eksplorasi
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              <div className="absolute top-full left-0 mt-3 w-72 bg-white/98 backdrop-blur-xl rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-slate-200 z-[110]">
                <div className="py-4">
                  <a href="/flora" className="block px-5 py-4 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors border-b border-slate-100">
                    <div className="font-medium text-slate-900">Flora Indonesia</div>
                    <div className="text-xs text-slate-500 mt-1">Keanekaragaman tumbuhan</div>
                  </a>
                  <a href="/fauna" className="block px-5 py-4 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors border-b border-slate-100">
                    <div className="font-medium text-slate-900">Fauna Indonesia</div>
                    <div className="text-xs text-slate-500 mt-1">Keanekaragaman hewan</div>
                  </a>
                  <a href="/taman" className="block px-5 py-4 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors border-b border-slate-100">
                    <div className="font-medium text-slate-900">Taman Konservasi</div>
                    <div className="text-xs text-slate-500 mt-1">Area perlindungan alam</div>
                  </a>
                  <a href="/kegiatan" className="block px-5 py-4 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors border-b border-slate-100">
                    <div className="font-medium text-slate-900">Kegiatan Konservasi</div>
                    <div className="text-xs text-slate-500 mt-1">Aktivitas dan program konservasi</div>
                  </a>
                  <a href="/artikel" className="block px-5 py-4 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    <div className="font-medium text-slate-900">Artikel</div>
                    <div className="text-xs text-slate-500 mt-1">Informasi dan berita</div>
                  </a>
                </div>
              </div>
            </div>

            {/* Informasi Dropdown */}
            <div className="relative group">
              <button className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-slate-600 ${
                !shouldBeTransparent ? 'text-slate-700' : 'text-white/90'
              }`}>
                Informasi
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              <div className="absolute top-full left-0 mt-3 w-64 bg-white/98 backdrop-blur-xl rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-slate-200 z-[110]">
                <div className="py-4">
                  <a href="/tentang" className="block px-5 py-4 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors border-b border-slate-100">
                    <div className="font-medium text-slate-900">Indeks Kehati</div>
                    <div className="text-xs text-slate-500 mt-1">Dashboard data publik</div>
                  </a>
                  <a href="/misi" className="block px-5 py-4 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors border-b border-slate-100">
                    <div className="font-medium text-slate-900">Misi Kami</div>
                    <div className="text-xs text-slate-500 mt-1">Visi dan tujuan konservasi</div>
                  </a>
                  <a href="/kontak" className="block px-5 py-4 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    <div className="font-medium text-slate-900">Kontak</div>
                    <div className="text-xs text-slate-500 mt-1">Hubungi kami</div>
                  </a>
                </div>
              </div>
            </div>

            {/* Tanya Kehati Button */}
            <a 
              href="/tanya-kehati"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                !shouldBeTransparent
                  ? 'text-slate-700 hover:bg-slate-100' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Tanya Kehati
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <a 
              className={`text-sm font-medium transition-colors hover:text-slate-600 ${
                !shouldBeTransparent ? 'text-slate-700' : 'text-white'
              }`} 
              href="/login"
            >
              Masuk
            </a>
          </div>
        </div>
      </header>
      
      {/* Floating Chat Button */}
      <TanyaKehatiButton />
    </>
  );
}