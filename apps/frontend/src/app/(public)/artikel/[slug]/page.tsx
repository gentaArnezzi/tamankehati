import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArtikelDetailView } from "@/components/public/artikel/ArtikelDetailView";
import { JsonLd } from "@/components/public/seo/JsonLd";
import { getArtikelDetail, getArtikelPage } from "@/lib/api/public";

type ArtikelDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ArtikelDetailPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const artikel = await getArtikelDetail(slug);
    return {
      title: `${artikel.judul} | Artikel Taman Kehati`,
      description: artikel.excerpt,
      openGraph: {
        title: artikel.judul,
        description: artikel.excerpt,
        images: artikel.gambar_cover
          ? [{ url: artikel.gambar_cover }]
          : undefined,
      },
    };
  } catch {
    return {
      title: "Artikel Taman Kehati",
      description: "Artikel keanekaragaman hayati dari Taman Kehati.",
    };
  }
}

export default async function ArtikelDetailPage({
  params,
}: ArtikelDetailPageProps) {
  try {
    const { slug } = await params;
    const artikel = await getArtikelDetail(slug);
    const related = await getArtikelPage({
      kategori: artikel.kategori,
      search: artikel.kategori ? undefined : artikel.judul,
      limit: 4,
      offset: 0,
    }).catch(() => null);

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://tamankehati.id";
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: artikel.judul,
      description: artikel.excerpt,
      datePublished: artikel.tanggal_publish,
      author: artikel.penulis
        ? { "@type": "Person", name: artikel.penulis }
        : undefined,
      image: artikel.gambar_cover,
      articleSection: artikel.kategori,
      url: `${siteUrl}/artikel/${artikel.slug}`,
    };

    return (
      <section className="bg-[var(--bg,#f8f7f5)] py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <JsonLd data={jsonLd} />
          <ArtikelDetailView artikel={artikel} related={related?.items ?? []} />
        </div>
      </section>
    );
  } catch (error) {
    console.error("Artikel detail not found", error);
    notFound();
  }
}
