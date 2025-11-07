"use client";

import { useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchArtikelPage } from "../../../lib/api/public-client";
import { type ArtikelPaginated } from "../../../types/articles";
import { trackEvent } from "../../../lib/analytics";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import Link from "next/link";
import Image from "next/image";
import { imageUrl as getImageUrl } from "../../../lib/api-url";
import { cleanArticleExcerpt } from "@/utils/text";

const CATEGORIES = ["Artikel Edukasi", "Berita Konservasi", "Riset", "Opini"];

const formatPublishDate = (value?: string | null) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return value;
  }
};

type ArtikelExploreProps = {
  initialData: ArtikelPaginated;
  initialParams: URLSearchParams;
};

export function ArtikelExplore({
  initialData,
  initialParams,
}: ArtikelExploreProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure initialParams is a proper URLSearchParams object
  const params = useMemo(() => {
    if (initialParams instanceof URLSearchParams) {
      return initialParams;
    }
    // If it's not a URLSearchParams, create one from the current search params or empty
    return new URLSearchParams();
  }, [initialParams]);

  const paramObj = useMemo(() => {
    const entries: Record<string, string> = {};
    searchParams?.forEach?.((value, key) => {
      entries[key] = value;
    });
    return entries;
  }, [searchParams]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["artikel", paramObj],
      queryFn: ({ pageParam }) =>
        fetchArtikelPage({
          ...paramObj,
          offset: pageParam?.offset ?? 0,
          limit: 12,
        }),
      getNextPageParam: (lastPage, allPages) => {
        const totalFetched = allPages.reduce(
          (sum, page) => sum + page.items.length,
          0,
        );
        if (totalFetched < lastPage.total) {
          return { offset: totalFetched };
        }
        return undefined;
      },
      initialPageParam: { offset: Number(params.get("offset") ?? 0) },
      initialData:
        initialData.total > 0
          ? {
              pages: [initialData],
              pageParams: [{ offset: Number(params.get("offset") ?? 0) }],
            }
          : undefined,
      refetchOnWindowFocus: false,
    });

  const allArticles = data?.pages.flatMap((page) => page.items) ?? [];

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = (formData.get("search") as string) ?? "";
    const kategori = (formData.get("kategori") as string) ?? "";
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (kategori && kategori !== "__all__") query.set("kategori", kategori);
    trackEvent({
      event: "public_articles_search",
      payload: {
        search,
        kategori: kategori === "__all__" ? "" : kategori,
      },
    });
    router.push(query.toString() ? `/artikel?${query.toString()}` : "/artikel");
  };

  return (
    <div className="bg-slate-50">
      <div className="container mx-auto max-w-7xl px-6 py-20">
        {/* Filters Section */}
        <div className="mb-16">
          <form
            onSubmit={handleSearch}
            className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]"
          >
            <div>
              <label
                htmlFor="search"
                className="text-sm font-medium text-slate-700"
              >
                Kata kunci
              </label>
              <Input
                id="search"
                name="search"
                value={params.get("search") ?? ""}
                onChange={(e) => {
                  const query = new URLSearchParams();
                  const kategori = params.get("kategori");
                  if (e.target.value) query.set("search", e.target.value);
                  if (kategori) query.set("kategori", kategori);
                  query.set("offset", "0"); // Reset offset when searching

                  // Clear previous debounce
                  if (debounceRef.current) {
                    clearTimeout(debounceRef.current);
                  }

                  // Set new debounce
                  debounceRef.current = setTimeout(() => {
                    router.push(
                      query.toString()
                        ? `/artikel?${query.toString()}`
                        : "/artikel",
                    );
                  }, 300);
                }}
                placeholder="Cari judul atau topik"
                className="mt-2 border-slate-300 focus:border-slate-500"
              />
            </div>
            <div>
              <label
                htmlFor="kategori"
                className="text-sm font-medium text-slate-700"
              >
                Kategori
              </label>
              <Select
                name="kategori"
                value={params.get("kategori") ?? "__all__"}
                onValueChange={(value) => {
                  const query = new URLSearchParams();
                  const search = params.get("search");
                  if (search) query.set("search", search);
                  if (value && value !== "__all__")
                    query.set("kategori", value);
                  query.set("offset", "0"); // Reset offset when changing category
                  router.push(
                    query.toString()
                      ? `/artikel?${query.toString()}`
                      : "/artikel",
                  );
                }}
              >
                <SelectTrigger
                  id="kategori"
                  className="mt-2 border-slate-300 focus:border-slate-500"
                >
                  <SelectValue placeholder="Semua kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Semua kategori</SelectItem>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800"
              >
                Terapkan
              </Button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div>
          {/* Header with Results Count */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-light text-slate-900 mb-3">
                Hasil Pencarian
              </h2>
              <p className="text-slate-600 text-lg" suppressHydrationWarning>
                {allArticles.length} artikel ditemukan
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isFetchingNextPage && allArticles.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-4"></div>
              <div className="text-slate-600 font-medium mb-2">
                Memuat Artikel
              </div>
              <p className="text-slate-500">Sedang mengambil data artikel...</p>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
              <div className="text-red-600 font-medium mb-2">
                Terjadi Kesalahan
              </div>
              <p className="text-red-500">
                Gagal memuat data artikel. Silakan coba lagi nanti.
              </p>
            </div>
          )}

          {/* Empty State */}
          {allArticles.length === 0 &&
            status !== "error" &&
            !isFetchingNextPage && (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
                <div className="text-slate-600 font-medium mb-2">
                  Tidak Ada Artikel
                </div>
                <p className="text-slate-500">
                  Coba ubah kata kunci atau kategori pencarian.
                </p>
              </div>
            )}

          {/* Results List */}
          {allArticles.length > 0 && (
            <div className="space-y-8">
              {allArticles.map((artikel, index) => {
                const publishDate = formatPublishDate(artikel.tanggal_publish);
                return (
                  <article
                    key={artikel.id}
                    className="group animate-fade-in rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-xl"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(210px,1fr)] md:items-stretch">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <Badge
                            variant="outline"
                            className="border-slate-200 bg-slate-50 text-slate-700"
                          >
                            {artikel.kategori}
                          </Badge>
                          {publishDate && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500 normal-case">
                                {publishDate}
                              </span>
                            </>
                          )}
                        </div>
                        <Link
                          href={`/artikel/${artikel.slug}`}
                          className="text-2xl font-semibold leading-snug text-slate-900 transition-colors hover:text-emerald-600"
                        >
                          {artikel.judul}
                        </Link>
                        <p className="text-base leading-relaxed text-slate-600 line-clamp-3 md:line-clamp-2">
                          {cleanArticleExcerpt(artikel.excerpt)}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <Link
                            href={`/artikel/${artikel.slug}`}
                            className="inline-flex items-center gap-2 font-semibold text-emerald-600 hover:text-emerald-500"
                          >
                            Baca selengkapnya
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M5 12h14M13 6l6 6-6 6"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </Link>
                        </div>
                      </div>
                      <Link
                        href={`/artikel/${artikel.slug}`}
                        className="relative block h-40 w-full overflow-hidden rounded-2xl bg-slate-100 transition focus-visible:ring-2 focus-visible:ring-emerald-500 md:h-48"
                        aria-label={`Buka ${artikel.judul}`}
                      >
                        <Image
                          src={getImageUrl(artikel.gambar_cover)}
                          alt={artikel.judul}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 40vw, 320px"
                        />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {hasNextPage && (
            <div className="mt-16 flex justify-center">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-full transition-colors"
              >
                {isFetchingNextPage ? "Memuat..." : "Muat Lebih Banyak"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
