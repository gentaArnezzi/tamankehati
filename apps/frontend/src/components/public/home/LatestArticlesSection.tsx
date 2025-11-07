"use client";

import { useRef, memo } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { type ArtikelPublic } from "../../../types/public";
import { imageUrl } from "../../../lib/api-url";
import { cleanArticleExcerpt } from "@/utils/text";

interface LatestArticlesSectionProps {
  initialArticles?: ArtikelPublic[];
}

export const LatestArticlesSection = memo(function LatestArticlesSection({
  initialArticles = [],
}: LatestArticlesSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const hasArticles = initialArticles && initialArticles.length > 0;

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Get category label
  const getCategoryLabel = (kategori: string) => {
    const labels: Record<string, string> = {
      news: "Berita",
      education: "Edukasi",
      research: "Riset",
      conservation: "Konservasi",
    };
    return labels[kategori.toLowerCase()] || kategori;
  };

  // Get category color
  const getCategoryColor = (kategori: string) => {
    const colors: Record<string, string> = {
      news: "text-blue-600",
      education: "text-emerald-600",
      research: "text-purple-600",
      conservation: "text-amber-600",
    };
    return colors[kategori.toLowerCase()] || "text-slate-600";
  };

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-slate-900 mb-4 sm:mb-6"
          >
            Artikel & Berita Terbaru
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: "6rem" } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="h-0.5 bg-emerald-500 mx-auto rounded-full mb-6 sm:mb-8"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="text-slate-500 max-w-2xl mx-auto px-4"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.5rem)" }}
          >
            Ikuti perkembangan terkini tentang konservasi dan keanekaragaman hayati Indonesia
          </motion.p>
        </div>

        {/* Articles Grid or Empty State */}
        {hasArticles ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
              {initialArticles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.5,
                    delay: 0.2 + index * 0.1,
                    ease: "easeOut",
                  }}
                >
                  <Link
                    href={`/artikel/${article.slug}`}
                    className="group block h-full"
                    prefetch={true}
                  >
                    <div className="bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-all duration-300 overflow-hidden h-full flex flex-col shadow-sm hover:shadow-md">
                      {/* Image */}
                      {article.gambar_cover && (
                        <div className="relative aspect-[16/9] overflow-hidden bg-gray-50">
                          <Image
                            src={imageUrl(article.gambar_cover)}
                            alt={article.judul}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 400px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-6 sm:p-8 flex flex-col flex-1">
                        {/* Category & Date */}
                        <div className="flex items-center justify-between mb-4">
                          <span
                            className={`text-xs font-medium uppercase tracking-wide ${getCategoryColor(article.kategori)}`}
                            style={{
                              fontSize: "clamp(0.75rem, 1vw, 0.875rem)",
                            }}
                          >
                            {getCategoryLabel(article.kategori)}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Calendar className="w-3.5 h-3.5" />
                            <time dateTime={article.tanggal_publish}>
                              {formatDate(article.tanggal_publish)}
                            </time>
                          </div>
                        </div>

                        {/* Title */}
                        <h3
                          className="font-medium text-slate-900 mb-3 group-hover:text-slate-700 transition-colors duration-300 line-clamp-2"
                          style={{
                            fontSize: "clamp(1.25rem, 1.8vw, 1.75rem)",
                          }}
                        >
                          {article.judul}
                        </h3>

                        {/* Excerpt */}
                        <p
                          className="text-slate-500 mb-6 flex-1 text-sm leading-relaxed line-clamp-3"
                          style={{ fontSize: "clamp(0.875rem, 1.2vw, 1rem)" }}
                        >
                          {cleanArticleExcerpt(article.excerpt)}
                        </p>

                        {/* Link */}
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 group-hover:text-emerald-600 transition-colors duration-300 mt-auto">
                          <span>Baca selengkapnya</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>

            {/* View All Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
              className="text-center mt-12 sm:mt-16"
            >
              <Link
                href="/artikel"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-slate-700 hover:text-emerald-600 border border-slate-200 hover:border-emerald-300 rounded-lg transition-all duration-300"
              >
                <span>Lihat Semua Artikel</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="text-center py-16 sm:py-20"
          >
            <p
              className="text-slate-500 text-lg sm:text-xl"
              style={{ fontSize: "clamp(1rem, 1.5vw, 1.5rem)" }}
            >
              Belum ada artikel terbaru
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
});
