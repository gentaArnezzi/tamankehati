'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@radix-ui/react-icons';

export function PublicHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/98 backdrop-blur-md border-b border-slate-200 shadow-lg' 
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="container mx-auto flex items-center justify-between px-6 py-5 max-w-7xl">
        <a 
          className={`text-xl font-medium transition-colors hover:text-emerald-600 ${
            isScrolled ? 'text-slate-900' : 'text-white'
          }`} 
          href="/"
        >
          Taman Kehati
        </a>
        
        {/* Navigation - Always Visible */}
        <nav className="flex items-center gap-8">
          <a 
            className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
              isScrolled ? 'text-slate-800' : 'text-white'
            }`} 
            href="/"
          >
            Beranda
          </a>
          
          {/* Eksplorasi Dropdown */}
          <div className="relative group">
            <button className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-emerald-600 ${
              isScrolled ? 'text-slate-800' : 'text-white/90'
            }`}>
              Eksplorasi
              <ChevronDownIcon className="h-4 w-4" />
            </button>
            <div className="absolute top-full left-0 mt-3 w-72 bg-white/98 backdrop-blur-xl rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-slate-200">
              <div className="py-4">
                <a href="/flora" className="block px-5 py-4 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-b border-slate-100">
                  <div className="font-medium text-emerald-700">Flora Indonesia</div>
                  <div className="text-xs text-slate-500 mt-1">Keanekaragaman tumbuhan</div>
                </a>
                <a href="/fauna" className="block px-5 py-4 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-b border-slate-100">
                  <div className="font-medium text-emerald-700">Fauna Indonesia</div>
                  <div className="text-xs text-slate-500 mt-1">Keanekaragaman hewan</div>
                </a>
                <a href="/taman" className="block px-5 py-4 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-b border-slate-100">
                  <div className="font-medium text-emerald-700">Taman Konservasi</div>
                  <div className="text-xs text-slate-500 mt-1">Area perlindungan alam</div>
                </a>
                <a href="/galeri" className="block px-5 py-4 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-b border-slate-100">
                  <div className="font-medium text-emerald-700">Galeri Foto</div>
                  <div className="text-xs text-slate-500 mt-1">Koleksi foto keanekaragaman</div>
                </a>
                <a href="/artikel" className="block px-5 py-4 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                  <div className="font-medium text-emerald-700">Artikel</div>
                  <div className="text-xs text-slate-500 mt-1">Informasi dan berita</div>
                </a>
              </div>
            </div>
          </div>


          {/* Informasi Dropdown */}
          <div className="relative group">
            <button className={`flex items-center gap-1 text-sm transition-colors hover:text-emerald-600 ${
              isScrolled ? 'text-slate-800' : 'text-white/80'
            }`}>
              Informasi
              <ChevronDownIcon className="h-4 w-4" />
            </button>
            <div className="absolute top-full left-0 mt-2 w-64 bg-white/98 backdrop-blur-xl rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200">
              <div className="py-3">
                <a href="/tentang" className="block px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-b border-gray-100">
                  <div className="font-light text-emerald-700">Indeks Kehati</div>
                  <div className="text-xs text-gray-500">Dashboard data publik</div>
                </a>
                <a href="/kontak" className="block px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                  <div className="font-light text-emerald-700">Kontak</div>
                  <div className="text-xs text-gray-500">Hubungi kami</div>
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <a 
            className={`text-sm font-light transition-colors hover:text-emerald-600 ${
              isScrolled ? 'text-slate-800' : 'text-white'
            }`} 
            href="/login"
          >
            Masuk
          </a>
        </div>
      </div>
    </header>
  );
}