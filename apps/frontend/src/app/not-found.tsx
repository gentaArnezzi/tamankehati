"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format)",
          transform: `translateY(${scrollY * 0.5}px)`,
          transition: "transform 0.1s ease-out",
          filter: "grayscale(100%)",
        }}
      />

      {/* White Overlay untuk maintain minimalism */}
      <div className="absolute inset-0 bg-white/85" />

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full">
        {/* Minimalist Content */}
        <div className="text-center space-y-8">
          {/* Large 404 */}
          <div className="relative">
            <h1 className="text-[180px] font-light text-gray-900 leading-none tracking-tighter">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-px bg-gray-900"></div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-4 px-8">
            <h2 className="text-2xl font-light text-gray-900 tracking-wide">
              Halaman Tidak Ditemukan
            </h2>
            <p className="text-gray-500 font-light leading-relaxed max-w-md mx-auto">
              Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
            </p>
          </div>

          {/* CTA */}
          <div className="pt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white text-sm font-light tracking-wide hover:bg-gray-800 transition-colors duration-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </div>

          {/* Subtle Links */}
          <div className="pt-12 space-y-3">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-light">
              Jelajahi
            </p>
            <div className="flex gap-8 justify-center text-sm">
              <Link
                href="/flora"
                className="text-gray-600 hover:text-gray-900 font-light transition-colors"
              >
                Flora
              </Link>
              <Link
                href="/fauna"
                className="text-gray-600 hover:text-gray-900 font-light transition-colors"
              >
                Fauna
              </Link>
              <Link
                href="/taman"
                className="text-gray-600 hover:text-gray-900 font-light transition-colors"
              >
                Taman
              </Link>
              <Link
                href="/indeks"
                className="text-gray-600 hover:text-gray-900 font-light transition-colors"
              >
                Indeks
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 text-center">
          <p className="text-xs text-gray-400 font-light">
            Butuh bantuan?{" "}
            <a
              href="mailto:support@tamankehati.id"
              className="text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-300 hover:border-gray-900"
            >
              support@tamankehati.id
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
