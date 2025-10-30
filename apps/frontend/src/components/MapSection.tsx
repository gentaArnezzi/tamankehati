"use client";

import { LeafletPreview } from "./maps/LeafletPreview";

interface MapSectionProps {
  parkCount: number;
}

export function MapSection({ parkCount }: MapSectionProps) {
  return (
    <>
      {/* Map temporarily disabled for testing other components */}
      {/* <div className="mt-10">
        <LeafletPreview />
      </div> */}
      <div className="mt-10">
        <div className="h-72 w-full bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-200">
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-gray-600 font-medium">Peta Taman Kehati</p>
            <p className="text-sm text-gray-500 mt-1">
              Akan ditampilkan setelah testing selesai
            </p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">
        Tersedia {parkCount} taman dengan data publik. Peta lengkap menampilkan
        informasi batas zona, koleksi flora/fauna, dan infrastruktur.
      </p>
    </>
  );
}
