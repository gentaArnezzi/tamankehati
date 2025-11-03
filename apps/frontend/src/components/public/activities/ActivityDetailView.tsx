"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "../../ui/badge";
import { imageUrl } from "../../../lib/api-url";
import {
  Calendar,
  MapPin,
  Clock,
  Activity as ActivityIcon,
  ArrowRight,
} from "lucide-react";

type ActivityDetail = {
  id: string;
  title: string;
  description: string;
  activity_date: string;
  location: string;
  park_name: string;
  images?: string[];
  created_at: string;
  updated_at: string;
};

type ActivityDetailViewProps = {
  activity: ActivityDetail;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function ActivityDetailView({ activity }: ActivityDetailViewProps) {
  const heroImage =
    activity.images && activity.images.length > 0
      ? imageUrl(activity.images[0])
      : "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&auto=format&fit=crop";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: activity.title,
    description: activity.description,
    startDate: activity.activity_date,
    location: {
      "@type": "Place",
      name: activity.location,
    },
    organizer: {
      "@type": "Organization",
      name: activity.park_name,
    },
    image:
      activity.images && activity.images.length > 0
        ? activity.images[0]
        : undefined,
  };

  return (
    <div className="space-y-12">
      <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
        <div className="relative h-[320px] w-full md:h-[420px]">
          <Image
            src={heroImage}
            alt={activity.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 960px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-500">
                {formatDate(activity.activity_date)}
              </Badge>
              <Badge
                variant="outline"
                className="border-white/40 bg-white/10 text-white"
              >
                {activity.location}
              </Badge>
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl lg:text-5xl">
              {activity.title}
            </h1>
            <p className="text-lg text-white/80 md:text-xl">
              {activity.park_name}
            </p>
          </div>
        </div>

        <div className="grid gap-8 p-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:p-12">
          <article className="space-y-8">
            {/* Deskripsi */}
            {activity.description && (
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-slate-900">
                  Deskripsi Kegiatan
                </h2>
                <p className="whitespace-pre-line text-base leading-relaxed text-slate-700">
                  {activity.description}
                </p>
              </div>
            )}
          </article>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6">
              <h2 className="text-lg font-semibold text-emerald-900">
                Informasi Kegiatan
              </h2>
              <dl className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-slate-600">Tanggal</dt>
                  <dd className="text-right text-slate-800">
                    {formatDate(activity.activity_date)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-slate-600">Waktu</dt>
                  <dd className="text-right text-slate-800">
                    {formatTime(activity.activity_date)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-slate-600">Lokasi</dt>
                  <dd className="text-right text-slate-800">
                    {activity.location}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-slate-600">Taman</dt>
                  <dd className="text-right text-slate-800">
                    {activity.park_name}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Tentang Taman
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Kegiatan ini dilaksanakan di {activity.park_name}, sebuah taman
                konservasi yang berdedikasi untuk melestarikan keanekaragaman
                hayati Indonesia.
              </p>
              <div className="mt-4 pt-4 border-t border-blue-100">
                <Link
                  href="/taman"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  Lihat Semua Taman
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Kegiatan Lainnya
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Temukan berbagai kegiatan konservasi dan edukasi lainnya yang
                dilaksanakan di taman-taman konservasi Indonesia.
              </p>
              <Link
                href="/kegiatan"
                className="mt-4 inline-flex text-sm font-semibold text-emerald-600 hover:text-emerald-500"
              >
                Lihat Semua Kegiatan
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Gallery Section */}
      {activity.images && activity.images.length > 1 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Galeri Foto
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Koleksi {activity.images.length} foto untuk kegiatan{" "}
                <span className="italic">{activity.title}</span>
              </p>
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex">
              {activity.images.length}{" "}
              {activity.images.length === 1 ? "Foto" : "Foto"}
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activity.images.slice(1).map((image, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm transition-all hover:shadow-lg hover:border-emerald-200"
              >
                <div className="aspect-square relative overflow-hidden bg-slate-100">
                  <Image
                    src={imageUrl(image)}
                    alt={`${activity.title} - Foto ${index + 2}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 text-slate-700 hover:bg-white">
                      #{index + 2}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="font-medium text-slate-900 text-sm line-clamp-1">
                    {activity.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    Foto dokumentasi kegiatan
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty Gallery State */}
      {(!activity.images || activity.images.length <= 1) && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Galeri Foto
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Koleksi foto untuk kegiatan{" "}
              <span className="italic">{activity.title}</span>
            </p>
          </div>
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-4 text-sm font-medium text-slate-900">
              Belum ada foto galeri
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Galeri foto untuk kegiatan ini belum tersedia atau masih dalam
              proses persetujuan.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
