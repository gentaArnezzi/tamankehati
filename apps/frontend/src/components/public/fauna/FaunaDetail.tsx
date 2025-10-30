"use client";

import { useEffect, useState } from "react";
import { Badge } from "../../ui/badge";
import { publicApi } from "../../../lib/public-api-client";

interface Fauna {
  id: string;
  nama_spesies: string;
  nama_ilmiah: string;
  nama_umum: string;
  status_konservasi: string;
  habitat?: string;
  deskripsi?: string;
  klasifikasi?: string;
  makanan?: string;
  ciri_fisik?: string;
  perilaku?: string;
  reproduksi?: string;
  penyebaran?: string;
  ancaman?: string;
  upaya_konservasi?: string;
  gambar_utama?: string;
  galeri_gambar?: string[];
  kategori?: string;
  lokasi?: string;
}

interface FaunaDetailProps {
  id: string;
}

export function FaunaDetail({ id }: FaunaDetailProps) {
  const [fauna, setFauna] = useState<Fauna | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFauna = async () => {
      try {
        setLoading(true);
        const data = await publicApi.getFaunaById(id);
        setFauna(data as Fauna);
      } catch (error) {
        console.error("Error fetching fauna:", error);
        setFauna(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFauna();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
          <p className="text-muted-foreground">Memuat fauna...</p>
        </div>
      </div>
    );
  }

  if (!fauna) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Fauna tidak ditemukan</h2>
        <p className="text-muted-foreground">
          Fauna yang Anda cari tidak ditemukan.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={
            fauna.gambar_utama
              ? fauna.gambar_utama.startsWith("http")
                ? fauna.gambar_utama
                : `${process.env.NEXT_PUBLIC_API_URL || "https://tamankehati-backend-pxnu.onrender.com"}${fauna.gambar_utama}`
              : "https://images.unsplash.com/photo-1535931735360-24c79a9f4d26?w=1200"
          }
          alt={fauna.nama_spesies}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-6">
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-bold">
              {fauna.nama_umum}
            </h1>
            <Badge
              variant={
                fauna.status_konservasi === "Terancam Punah"
                  ? "destructive"
                  : "default"
              }
              className="text-lg px-4 py-1"
            >
              {fauna.status_konservasi}
            </Badge>
          </div>
          <p className="text-xl text-muted-foreground italic">
            {fauna.nama_ilmiah}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div>
            <h3
              className="font-semibold text-lg mb-2"
              style={{ color: "#233c2b" }}
            >
              Klasifikasi
            </h3>
            <p>{fauna.klasifikasi || "-"}</p>
          </div>
          <div>
            <h3
              className="font-semibold text-lg mb-2"
              style={{ color: "#233c2b" }}
            >
              Habitat
            </h3>
            <p>{fauna.habitat || "-"}</p>
          </div>
          <div>
            <h3
              className="font-semibold text-lg mb-2"
              style={{ color: "#233c2b" }}
            >
              Makanan
            </h3>
            <p>{fauna.makanan || "-"}</p>
          </div>
        </div>

        <div className="mb-8">
          <h3
            className="font-semibold text-lg mb-4"
            style={{ color: "#233c2b" }}
          >
            Deskripsi
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {fauna.deskripsi || "Data tidak tersedia"}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3
              className="font-semibold text-lg mb-4"
              style={{ color: "#233c2b" }}
            >
              Ciri Fisik
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {fauna.ciri_fisik || "Data tidak tersedia"}
            </p>
          </div>

          <div>
            <h3
              className="font-semibold text-lg mb-4"
              style={{ color: "#233c2b" }}
            >
              Perilaku
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {fauna.perilaku || "Data tidak tersedia"}
            </p>
          </div>

          <div>
            <h3
              className="font-semibold text-lg mb-4"
              style={{ color: "#233c2b" }}
            >
              Reproduksi
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {fauna.reproduksi || "Data tidak tersedia"}
            </p>
          </div>

          <div>
            <h3
              className="font-semibold text-lg mb-4"
              style={{ color: "#233c2b" }}
            >
              Penyebaran
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {fauna.penyebaran || "Data tidak tersedia"}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3
            className="font-semibold text-lg mb-4"
            style={{ color: "#233c2b" }}
          >
            Ancaman
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {fauna.ancaman || "Data tidak tersedia"}
          </p>
        </div>

        <div>
          <h3
            className="font-semibold text-lg mb-4"
            style={{ color: "#233c2b" }}
          >
            Upaya Konservasi
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {fauna.upaya_konservasi || "Data tidak tersedia"}
          </p>
        </div>
      </div>
    </div>
  );
}
