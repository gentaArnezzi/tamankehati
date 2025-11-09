import Image from "next/image";
import Link from "next/link";
import { Badge } from "../../ui/badge";
import { ShareButtons } from "./ShareButtons";
import { TableOfContents } from "./TableOfContents";
import { MarkdownRenderer } from "./MarkdownRenderer";
import {
  parseMarkdown,
  slugify,
  type MarkdownHeading,
} from "../../../lib/markdown";
import { type ArtikelDetail } from "../../../types/articles";
import { type ArtikelPublic } from "../../../types/public";
import { JsonLd } from "../seo/JsonLd";
import { sanitizeHtmlRich } from "../../../utils/sanitizeHtml";
import { imageUrl } from "../../../lib/api-url";
import { cleanArticleExcerpt } from "../../../utils/text";

type ArtikelDetailViewProps = {
  artikel: ArtikelDetail;
  related?: ArtikelPublic[];
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tamankehati.id";

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ");

const processHtmlContent = (html: string) => {
  const headings: MarkdownHeading[] = [];
  let index = 0;
  let htmlWithIds = html.replace(
    /<(h[1-4])(.*?)>([\s\S]*?)<\/\1>/gi,
    (match, tag: string, attrs: string, inner: string) => {
      const text = stripHtml(inner).trim();
      const level = Number(tag.substring(1));
      const id = `${slugify(text)}-${index++}`;
      headings.push({ id, text, level });

      let attributes = attrs ?? "";
      const hasId = /\sid=/i.test(attributes);
      if (hasId) {
        attributes = attributes.replace(/\sid=["'][^"']*["']/i, ` id="${id}"`);
      } else {
        attributes = `${attributes} id="${id}"`;
      }

      const normalizedAttributes = attributes.replace(/\s+/g, " ").trim();
      const prefix = normalizedAttributes ? ` ${normalizedAttributes}` : "";

      return `<${tag}${prefix}>${inner}</${tag}>`;
    },
  );

  // Standardize all images in HTML content
  htmlWithIds = htmlWithIds.replace(/<img[^>]+src="([^"]+)"[^>]*>/gi, (match, url) => {
    const processedUrl = imageUrl(url);
    return `<img src="${processedUrl}" style="max-width: 100%; width: 100%; height: auto; display: block; margin: 20px auto; border-radius: 8px; object-fit: contain; max-height: 600px;" />`;
  });

  const wordCount = stripHtml(htmlWithIds).split(/\s+/).filter(Boolean).length;

  return { html: htmlWithIds, headings, wordCount };
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export function ArtikelDetailView({
  artikel,
  related = [],
}: ArtikelDetailViewProps) {
  const heroImage =
    artikel.gambar_cover && artikel.gambar_cover.trim()
      ? imageUrl(artikel.gambar_cover)
      : "https://images.unsplash.com/photo-1493815793585-d94ccbc86df0?w=1600&auto=format&fit=crop";

  const kategori = artikel.kategori;
  const publishDate = artikel.tanggal_publish
    ? formatDate(artikel.tanggal_publish)
    : null;
  let headings: MarkdownHeading[] = [];
  let contentNode: React.ReactNode;
  let wordCount = 0;

  if (artikel.konten_markdown && artikel.konten_markdown.trim()) {
    const parsed = parseMarkdown(artikel.konten_markdown);
    headings = parsed.headings;
    wordCount = parsed.wordCount;
    contentNode = (
      <MarkdownRenderer markdown={artikel.konten_markdown} className="mt-6" />
    );
  } else if (artikel.konten_html && artikel.konten_html.trim()) {
    const processed = processHtmlContent(artikel.konten_html);
    headings = processed.headings;
    wordCount = processed.wordCount;
    contentNode = (
      <div
        className="prose prose-slate max-w-none mt-6 prose-headings:text-slate-900 prose-a:text-emerald-600"
        dangerouslySetInnerHTML={{ __html: sanitizeHtmlRich(processed.html) }}
      />
    );
  } else {
    const cleanExcerpt = cleanArticleExcerpt(artikel.excerpt);
    wordCount = cleanExcerpt.split(/\s+/).filter(Boolean).length;
    contentNode = (
      <p className="mt-6 text-base leading-relaxed text-slate-700">
        {cleanExcerpt}
      </p>
    );
  }

  const readingMinutes =
    artikel.estimasi_waktu_baca ?? Math.max(1, Math.round(wordCount / 200));
  const tags = Array.isArray(artikel.tag) ? artikel.tag : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: artikel.judul,
    description: cleanArticleExcerpt(artikel.excerpt),
    author: artikel.penulis
      ? { "@type": "Person", name: artikel.penulis }
      : undefined,
    image: artikel.gambar_cover,
    wordCount,
    datePublished: artikel.tanggal_publish,
    timeRequired: `PT${readingMinutes}M`,
  };

  return (
    <article className="space-y-12">
      <JsonLd data={jsonLd} />
      <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
        <div className="relative h-[320px] w-full md:h-[420px]">
          <Image
            src={heroImage}
            alt={artikel.judul}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 960px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
              {kategori && (
                <Badge className="bg-emerald-600 text-white hover:bg-emerald-500">
                  {kategori}
                </Badge>
              )}
              {publishDate && <span>{publishDate}</span>}
              <span>•</span>
              <span>{readingMinutes} menit baca</span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl lg:text-5xl">
              {artikel.judul}
            </h1>
            {artikel.penulis && (
              <p className="mt-2 text-base text-white/80">
                Ditulis oleh {artikel.penulis}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-10 p-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:p-12">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
              <span>Kata kunci</span>
              {tags.length === 0 && <Badge variant="outline">Konservasi</Badge>}
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-emerald-200 text-emerald-700"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {contentNode}
          </div>

          <aside className="space-y-6">
            <TableOfContents headings={headings} />
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                Bagikan
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Bagikan artikel ini untuk mendukung penyebaran informasi
                konservasi keanekaragaman hayati Indonesia.
              </p>
              <ShareButtons title={artikel.judul} baseUrl={SITE_URL} />
            </div>
          </aside>
        </div>
      </div>

      {related.length ? (
        <section className="mt-16 pt-12 border-t border-slate-200 px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Artikel terkait
            </h2>
            <p className="text-slate-600">
              Artikel lain yang mungkin menarik untuk Anda
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {related.slice(0, 6).map((item) => {
              const coverImage = item.gambar_cover
                ? imageUrl(item.gambar_cover)
                : null;
              return (
                <Link
                  key={item.id}
                  href={`/artikel/${item.slug}`}
                  className="group block"
                >
                  <article className="h-full rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:border-emerald-300 hover:-translate-y-1">
                    {coverImage && (
                      <div className="relative w-full h-48 overflow-hidden bg-slate-100">
                        <Image
                          src={coverImage}
                          alt={item.judul}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge
                          variant="outline"
                          className="text-xs font-medium text-emerald-700 border-emerald-200 bg-emerald-50"
                        >
                          {item.kategori}
                        </Badge>
                        {item.tanggal_publish && (
                          <span className="text-xs text-slate-500">
                            {formatDate(item.tanggal_publish)}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {item.judul}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                        {cleanArticleExcerpt(item.excerpt)}
                      </p>
                      <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 group-hover:text-emerald-700">
                        Baca selengkapnya
                        <svg
                          className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </article>
  );
}
