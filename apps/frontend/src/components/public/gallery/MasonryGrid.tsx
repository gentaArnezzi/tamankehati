import Image from "next/image";
import { imageUrl } from "../../../lib/api-url";
import { cn } from "../../ui/utils";
import type { GalleryItem } from "../../../types/gallery";

type MasonryGridProps = {
  items: GalleryItem[];
  onSelect?: (item: GalleryItem) => void;
  className?: string;
};

export function MasonryGrid({ items, onSelect, className }: MasonryGridProps) {
  return (
    <div className={cn("columns-1 gap-4 sm:columns-2 lg:columns-3", className)}>
      {items.map((item) => {
        const rawImageSrc =
          item.thumbnail && item.thumbnail.trim()
            ? item.thumbnail
            : item.url && item.url.trim()
              ? item.url
              : "/hero/forest.webp";
        const imageSrc = imageUrl(rawImageSrc);
        return (
          <figure
            key={item.id}
            className="mb-4 break-inside-avoid rounded-3xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <button
              type="button"
              className="group relative block w-full overflow-hidden rounded-t-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500"
              onClick={() => onSelect?.(item)}
              aria-label={`Lihat detail media ${item.judul}`}
            >
              <Image
                src={imageSrc}
                alt={item.judul}
                width={640}
                height={400}
                className="h-full max-h-[440px] w-full object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 320px"
                loading="lazy"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
            </button>

            <figcaption className="space-y-2 p-4">
              <p className="text-sm font-semibold text-slate-800">
                {item.judul}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                {item.wilayah && <span>{item.wilayah}</span>}
                {item.jenis && (
                  <span className="rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
                    {item.jenis}
                  </span>
                )}
                {item.entitas && (
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                    {item.entitas}
                  </span>
                )}
              </div>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
