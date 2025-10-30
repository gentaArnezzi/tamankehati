import Link from "next/link";
import { type ArtikelPublic } from "../../../types/public";
import { Calendar } from "lucide-react";

type LatestArticlesSectionProps = {
  articles: ArtikelPublic[];
};

export function LatestArticlesSection({
  articles,
}: LatestArticlesSectionProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="bg-[var(--bg,#f8f7f5)] py-20">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              Artikel Terbaru
            </h2>
            <p className="mt-2 text-base text-slate-600">
              Sorotan cerita konservasi, riset terbaru, dan praktik lapangan
              dari seluruh penjuru Indonesia.
            </p>
          </div>
          <Link
            href="/artikel"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-500"
            aria-label="Lihat semua artikel konservasi"
          >
            Lihat semua artikel
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
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

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.id}
              className="flex h-full flex-col rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:shadow-md focus-within:outline focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-emerald-500"
            >
              <div className="text-sm font-medium uppercase tracking-wide text-emerald-600">
                {article.kategori}
              </div>
              <h3 className="mt-3 text-xl font-semibold text-slate-900">
                <Link
                  href={`/artikel/${article.slug}`}
                  className="focus:outline-none"
                >
                  {article.judul}
                </Link>
              </h3>
              <div className="mt-3 inline-flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <time dateTime={article.tanggal_publish}>
                  {new Date(article.tanggal_publish).toLocaleDateString(
                    "id-ID",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </time>
              </div>
              <p className="mt-4 line-clamp-3 text-base leading-relaxed text-slate-600">
                {article.excerpt}
              </p>
              <Link
                href={`/artikel/${article.slug}`}
                className="mt-6 text-sm font-semibold text-emerald-600 transition hover:text-emerald-500"
                aria-label={`Baca artikel ${article.judul}`}
              >
                Baca selengkapnya
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
