import Image from "next/image";
import Link from "next/link";
import { Badge } from "../../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { MapPin, Ruler } from "lucide-react";
import type { ParkPublic } from "../../../types/public";

interface ParkCardProps {
  park: ParkPublic;
}

export function ParkCard({ park }: ParkCardProps) {
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <div className="relative aspect-video overflow-hidden rounded-t-lg">
        <Image
          src="/placeholder-park.jpg"
          alt={`Gambar ${park.name}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          <Link href={`/parks/${park.id}`} className="hover:underline">
            {park.name}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2 text-sm">
          {park.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-4 flex-1">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
          <span className="truncate">Indonesia</span>
        </div>

        {park.area_ha && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Ruler className="mr-1 h-4 w-4 flex-shrink-0" />
            <span>Luas: {park.area_ha.toLocaleString()} ha</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Link
          href={`/parks/${park.id}`}
          className="w-full text-sm font-medium text-primary hover:underline"
        >
          Lihat Detail →
        </Link>
      </CardFooter>
    </Card>
  );
}
