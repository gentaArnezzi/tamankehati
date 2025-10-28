import Image from 'next/image';
import Link from 'next/link';
import { type GalleryItem } from '@/types/gallery';

type GalleryHighlightProps = {
  items: GalleryItem[];
};

export function GalleryHighlight({ items }: GalleryHighlightProps) {
  if (items.length === 0) return null;

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">Cuplikan Galeri</h2>
            <p className="mt-2 text-base text-slate-600">Potret konservasi dari lapangan; gunakan tombol panah untuk menelusuri.</p>
          </div>
        </div>

        <div className="mt-10 overflow-x-auto">
          <div className="flex gap-6 pb-4">
            {items.map((item) => {
              const imageSrc =
                item.thumbnail && item.thumbnail.trim()
                  ? item.thumbnail
                  : item.url && item.url.trim()
                    ? item.url
                    : '/hero/forest.webp';
              return (
                <figure
                  key={item.id}
                  className="min-w-[240px] max-w-xs flex-1 rounded-2xl border border-emerald-100 bg-white shadow-sm"
                >
                  <div className="relative h-40 w-full overflow-hidden rounded-t-2xl">
                    <Image
                      src={imageSrc}
                      alt={item.judul}
                      fill
                      className="object-cover transition duration-500 hover:scale-105"
                      sizes="(max-width: 768px) 60vw, 240px"
                      loading="lazy"
                    />
                  </div>
                  <figcaption className="space-y-2 p-4">
                    <p className="text-sm font-semibold text-slate-800">{item.judul}</p>
                    <p className="text-xs text-slate-500">{item.wilayah ?? 'Wilayah tidak disebutkan'}</p>
                    <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                      {item.jenis}
                    </span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
