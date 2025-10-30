"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Skeleton } from "../../ui/skeleton";
import { Sprout, ArrowRight } from "lucide-react";
import { getFloraList } from "../../../lib/api/client-public";
import type { FloraPublic } from "../../../types/public";

interface ParkFloraProps {
  parkId: number;
}

export function ParkFlora({ parkId }: ParkFloraProps) {
  const [flora, setFlora] = useState<FloraPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlora = async () => {
      try {
        setLoading(true);
        const response = await getFloraList({ taman: parkId, limit: 6 });
        setFlora(response.items || []);
      } catch (err) {
        setError("Gagal memuat data flora");
        console.error("Error fetching flora:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlora();
  }, [parkId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
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

  if (flora.length === 0) {
    return (
      <div className="text-center py-8">
        <Sprout className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">Belum ada data flora untuk taman ini</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {flora.map((item) => (
        <Card
          key={item.id}
          className="group overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <Link href={`/flora/${item.id}`}>
            <CardContent className="p-0">
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={item.gambar_utama || "/placeholder.svg"}
                  alt={item.nama_umum || item.nama_ilmiah}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 right-3">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 border-green-200"
                  >
                    {item.status_iucn || "N/A"}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 group-hover:text-green-700 transition-colors">
                  {item.nama_ilmiah}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {item.nama_umum || "Nama umum tidak tersedia"}
                </p>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {item.deskripsi || "Deskripsi tidak tersedia"}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-slate-500">
                    {item.famili || "Famili tidak tersedia"}
                  </span>
                  <ArrowRight className="w-4 h-4 text-green-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}
