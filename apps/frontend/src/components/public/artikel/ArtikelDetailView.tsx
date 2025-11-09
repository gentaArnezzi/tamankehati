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

// Check if HTML is escaped and unescape it if needed
const unescapeHtml = (html: string): string => {
  // More aggressive unescaping - handle all HTML entities
  // Order matters: handle numeric/hex first, then named entities, &amp; last
  let unescaped = html;
  
  // First pass: handle numeric and hex entities (they might contain &)
  unescaped = unescaped.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10));
  });
  
  unescaped = unescaped.replace(/&#x([0-9a-fA-F]+);/gi, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  // Second pass: unescape common named entities (but not &amp; yet)
  unescaped = unescaped
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, '/')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ');
  
  // Third pass: unescape &amp; (must be last to avoid breaking other entities)
  unescaped = unescaped.replace(/&amp;/g, '&');
  
  return unescaped;
};

const processHtmlContent = (html: string) => {
  // Unescape HTML if it's escaped
  const unescapedHtml = unescapeHtml(html);
  const headings: MarkdownHeading[] = [];
  let index = 0;
  const htmlWithIds = unescapedHtml.replace(
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

  // Normalize image URLs in HTML (replace localhost:8000 with proper API URL)
  // Also add responsive styling to images and wrap them in containers
  const htmlWithNormalizedImages = htmlWithIds.replace(
    /<img\s+([^>]*?)>/gi,
    (match, attributes: string) => {
      // Extract src attribute value
      const srcMatch = attributes.match(/src=["']([^"']*?)["']/i);
      if (srcMatch && srcMatch[1]) {
        const originalSrc = srcMatch[1];
        // Normalize the image URL using the imageUrl helper
        const normalizedSrc = imageUrl(originalSrc);
        // Replace the src attribute with normalized URL
        let updatedAttributes = attributes.replace(
          /src=["'][^"']*?["']/i,
          `src="${normalizedSrc}"`
        );
        
        // Remove any absolute positioning or problematic styles
        updatedAttributes = updatedAttributes.replace(
          /style=["'][^"']*?["']/gi,
          ''
        );
        
        // Remove position, top, left, right, bottom, z-index attributes
        updatedAttributes = updatedAttributes.replace(
          /(position|top|left|right|bottom|z-index|float)=["'][^"']*?["']/gi,
          ''
        );
        
        // Clean up any extra spaces
        updatedAttributes = updatedAttributes.trim();
        
        // Add proper responsive styling - ensure no absolute positioning
        updatedAttributes += ' style="max-width: 100%; width: 100%; height: auto; display: block; margin: 20px auto; border-radius: 8px; object-fit: contain; max-height: 600px; position: relative !important; top: auto !important; left: auto !important; right: auto !important; bottom: auto !important; z-index: auto !important; float: none !important;"';
        
        // Wrap image in a container div to prevent positioning issues
        // Ensure container also has no absolute positioning
        return `<div style="position: relative !important; width: 100%; margin: 20px 0; overflow: hidden; border-radius: 8px; top: auto !important; left: auto !important; right: auto !important; bottom: auto !important; z-index: auto !important; float: none !important;" class="article-image-container"><img ${updatedAttributes}></div>`;
      }
      // If no src found, return as-is
      return match;
    },
  );

  const wordCount = stripHtml(htmlWithNormalizedImages).split(/\s+/).filter(Boolean).length;

  return { html: htmlWithNormalizedImages, headings, wordCount };
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
    const sanitizedHtml = sanitizeHtmlRich(processed.html);
    // Debug in development
    if (process.env.NODE_ENV === "development") {
      console.log("Original HTML:", artikel.konten_html.substring(0, 500));
      console.log("Processed HTML:", processed.html.substring(0, 500));
      console.log("Sanitized HTML:", sanitizedHtml.substring(0, 500));
      console.log("Has images in original:", /<img/i.test(artikel.konten_html));
      console.log("Has images in processed:", /<img/i.test(processed.html));
      console.log("Has images in sanitized:", /<img/i.test(sanitizedHtml));
    }
    contentNode = (
      <div
        className="prose prose-lg prose-slate max-w-none mt-6 prose-headings:text-slate-900 prose-a:text-emerald-600 prose-img:rounded-lg prose-img:shadow-md article-content"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        style={{
          position: 'relative',
          overflow: 'visible',
        }}
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
        <div className="relative w-full min-h-[300px] max-h-[600px] md:max-h-[700px] flex items-center justify-center bg-slate-100">
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={heroImage}
              alt={artikel.judul}
              width={1200}
              height={800}
              priority
              className="w-full h-auto max-h-[600px] md:max-h-[700px] object-contain"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-10">
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
          <div className="relative overflow-visible">
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

            <div className="relative overflow-visible">
              {contentNode}
            </div>
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
