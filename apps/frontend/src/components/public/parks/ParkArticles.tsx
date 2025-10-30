"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Skeleton } from "../../ui/skeleton";
import { BookOpen, ArrowRight, Calendar } from "lucide-react";
import { formatDate } from "../../../lib/utils";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  image?: string;
  published_at: string;
  author: string;
  category: string;
}

interface ParkArticlesProps {
  parkId: number;
}

export function ParkArticles({ parkId }: ParkArticlesProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        // TODO: Implement actual API call when articles endpoint is available
        // For now, we'll show a placeholder
        setArticles([]);
      } catch (err) {
        setError("Gagal memuat data artikel");
        console.error("Error fetching articles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [parkId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">{error}</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">Belum ada artikel untuk taman ini</p>
        <p className="text-xs text-slate-400 mt-2">
          Artikel akan muncul di sini ketika tersedia
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <Card
          key={article.id}
          className="group overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <Link href={`/artikel/${article.id}`}>
            <CardContent className="p-0">
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={article.image || "/placeholder.svg"}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 right-3">
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-green-100 to-blue-100 text-slate-800 border-slate-200"
                  >
                    {article.category}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 group-hover:text-green-700 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(article.published_at)}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}
