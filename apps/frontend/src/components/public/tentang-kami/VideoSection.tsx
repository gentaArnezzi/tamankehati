"use client";

import { useState, useEffect } from "react";

export default function VideoSection() {
  const [videoError, setVideoError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-200 shadow-xl">
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
          <div className="text-center p-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-600 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium mb-2">
              Memuat video...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-200 shadow-xl">
      {!videoError ? (
        <video
          controls
          className="w-full h-full object-cover"
          poster="/videos/tentang-kami/poster.jpg"
          onError={() => setVideoError(true)}
        >
          {/* Video akan diambil dari folder public/videos/tentang-kami/ */}
          {/* Format yang didukung: MP4 (utama), WebM (fallback) */}
          <source
            src="/videos/tentang-kami/taman-kehati.mp4"
            type="video/mp4"
          />
          <source
            src="/videos/tentang-kami/taman-kehati.webm"
            type="video/webm"
          />
          {/* Fallback text jika browser tidak support video */}
          Browser Anda tidak mendukung video player.
        </video>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
          <div className="text-center p-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-600 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium mb-2">
              Video Taman Kehati
            </p>
            <p className="text-sm text-slate-500">
              Upload video ke:{" "}
              <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                public/videos/tentang-kami/taman-kehati.mp4
              </code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

