"use client";

import Image from "next/image";
import { Badge } from "../../ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "../../ui/card";
import { Button } from "../../ui/button";
import { MapPin, Calendar, ArrowRight, Leaf } from "lucide-react";
import { formatDate } from "../../../lib/utils";
import type { TamanPublic } from "../../../types/public";
import { InstantLink } from "../../ui/instant-link";

interface TamanCardProps {
  taman: TamanPublic;
}

export function TamanCard({ taman }: TamanCardProps) {
  return (
    <Card className="group overflow-hidden border-0 bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&auto=format&fit=crop&q=80"
          alt={taman.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3">
          <Badge
            variant={taman.status === "approved" ? "default" : "secondary"}
            className="bg-white/90 text-gray-700 hover:bg-white/90"
          >
            {taman.status === "approved" ? "Aktif" : "Draft"}
          </Badge>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <CardHeader className="pb-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg leading-tight text-gray-900 group-hover:text-emerald-700 transition-colors">
            {taman.name}
          </h3>
          {taman.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {taman.description}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>Indonesia</span>
          </div>

          {taman.area_ha && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Leaf className="h-4 w-4" />
              <span>{taman.area_ha} hektar</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>
              {taman.created_at ? formatDate(taman.created_at) : "N/A"}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          asChild
          variant="outline"
          className="w-full group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:text-emerald-700 transition-all duration-200"
        >
          <InstantLink 
            href={`/taman/${taman.id}`}
            prefetchType="taman"
            prefetchId={taman.id}
            className="flex items-center gap-2"
          >
            <span>Lihat Detail</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </InstantLink>
        </Button>
      </CardFooter>
    </Card>
  );
}
