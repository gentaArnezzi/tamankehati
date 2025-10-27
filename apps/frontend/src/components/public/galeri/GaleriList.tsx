'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { publicApi } from '../../../lib/public-api-client';

interface GaleriItem {
  id: string;
  judul: string;
  url: string;
  jenis: string;
  wilayah: string;
}

interface GaleriListProps {
  className?: string;
}

export function GaleriList({ className = "" }: GaleriListProps) {
  const [galeriItems, setGaleriItems] = useState<GaleriItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGaleri = async () => {
      try {
        const data = await publicApi.getGallery();
        setGaleriItems(data.items);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching galeri:', error);
        setLoading(false);
      }
    };

    fetchGaleri();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm animate-pulse aspect-square">
            <div className="w-full h-full bg-muted-foreground/20" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted-foreground/20" />
              <div className="h-3 w-full rounded bg-muted-foreground/20" />
              <div className="flex justify-between">
                <div className="h-3 w-16 rounded bg-muted-foreground/20" />
                <div className="h-3 w-20 rounded bg-muted-foreground/20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}>
      {galeriItems.map((item) => (
        <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-square relative overflow-hidden">
            <img
              src={item.url || 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800'}
              alt={item.judul}
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-1">{item.judul}</h3>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.wilayah}</p>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{item.jenis}</span>
              <span>{item.wilayah}</span>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {galeriItems.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-muted-foreground">Belum ada galeri tersedia.</p>
        </div>
      )}
    </div>
  );
}
