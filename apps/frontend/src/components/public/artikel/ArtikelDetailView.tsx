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

type ArtikelDetailViewProps = {
  artikel: ArtikelDetail;
  related?: ArtikelPublic[];
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tamankehati.id";

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ");

const processHtmlContent = (html: string) => {
  const headings: MarkdownHeading[] = [];
  let index = 0;
  const htmlWithIds = html.replace(
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

  const contentClassName =
    "prose prose-slate mt-10 max-w-none text-base leading-relaxed md:prose-lg prose-headings:font-semibold prose-headings:text-slate-900 prose-blockquote:text-slate-700 prose-a:text-emerald-600 prose-img:rounded-3xl";

  if (artikel.konten_markdown && artikel.konten_markdown.trim()) {
    const parsed = parseMarkdown(artikel.konten_markdown);
    headings = parsed.headings;
    wordCount = parsed.wordCount;
    contentNode = (
      <MarkdownRenderer
        markdown={artikel.konten_markdown}
        className={contentClassName}
      />
    );
  } else if (artikel.konten_html && artikel.konten_html.trim()) {
    const processed = processHtmlContent(artikel.konten_html);
    headings = processed.headings;
    wordCount = processed.wordCount;
    contentNode = (
      <div
        className={contentClassName}
        dangerouslySetInnerHTML={{ __html: sanitizeHtmlRich(processed.html) }}
      />
    );
  } else {
    wordCount = artikel.excerpt.split(/\s+/).filter(Boolean).length;
    contentNode = (
      <p className="mt-10 text-lg leading-relaxed text-slate-700">
        {artikel.excerpt}
      </p>
    );
  }

  const readingMinutes =
    artikel.estimasi_waktu_baca ?? Math.max(1, Math.round(wordCount / 200));
  const tags = Array.isArray(artikel.tag) ? artikel.tag : [];
  const formattedWordCount = wordCount
    ? wordCount.toLocaleString("id-ID")
    : null;
  const authorName = artikel.penulis?.trim() || "Tim Taman Kehati";
  const authorInitial = authorName.charAt(0).toUpperCase();
  const metaItems = [
    publishDate,
    formattedWordCount ? `${formattedWordCount} kata` : null,
    `${readingMinutes} menit baca`,
  ].filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: artikel.judul,
    description: artikel.excerpt,
    author: artikel.penulis
      ? { "@type": "Person", name: artikel.penulis }
      : undefined,
    image: artikel.gambar_cover,
    wordCount,
    datePublished: artikel.tanggal_publish,
    timeRequired: `PT${readingMinutes}M`,
  };

  return (
    <article className="space-y-16">
      <JsonLd data={jsonLd} />
      <header className="space-y-6">
        <div className="relative h-[420px] w-full overflow-hidden rounded-[32px] border border-slate-200 bg-slate-900/40 shadow-2xl">
          <Image
            src={heroImage}
            alt={artikel.judul}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 960px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/25 to-transparent" />
          <div className="relative flex h-full flex-col justify-end gap-5 p-8 md:p-12">
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
              {kategori && (
                <Badge className="bg-white/15 text-white" variant="default">
                  {kategori}
                </Badge>
              )}
              {metaItems.map((item, index) => (
                <div key={`meta-${index}`} className="flex items-center gap-3">
                  {index > 0 && <span className="text-white/60">•</span>}
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">
              {artikel.judul}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-base font-semibold text-white">
                {authorInitial}
              </div>
              <div>
                <p className="text-base font-medium text-white">{authorName}</p>
                {publishDate && (
                  <p className="text-sm text-white/80">Diterbitkan {publishDate}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(260px,1fr)] lg:gap-12">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
            <span>Kata kunci</span>
            {tags.length === 0 && (
              <Badge variant="outline" className="border-slate-200 text-slate-600">
                Konservasi
              </Badge>
            )}
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

        <aside className="mt-10 lg:mt-0 lg:pl-8">
          <div className="space-y-6 lg:sticky lg:top-24">
            <TableOfContents headings={headings} />
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
                Bagikan tulisan
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Sebarkan artikel ini agar semakin banyak orang peduli pada
                upaya konservasi keanekaragaman hayati.
              </p>
              <div className="mt-4">
                <ShareButtons
                  title={artikel.judul}
                  baseUrl={SITE_URL}
                  direction="column"
                />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {related.length ? (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-slate-900">
            Artikel terkait
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {related.slice(0, 4).map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm transition hover:border-emerald-200"
              >
                <p className="text-xs uppercase tracking-wide text-emerald-600">
                  {item.kategori}
                </p>
                <Link
                  href={`/artikel/${item.slug}`}
                  className="mt-2 block text-lg font-semibold text-slate-900 hover:text-emerald-600"
                >
                  {item.judul}
                </Link>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                  {item.excerpt}
                </p>
                <Link
                  href={`/artikel/${item.slug}`}
                  className="mt-4 inline-flex text-sm font-semibold text-emerald-600 hover:text-emerald-500"
                >
                  Baca selengkapnya
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
