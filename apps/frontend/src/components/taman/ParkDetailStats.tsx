"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import {
  TreePine,
  Bird,
  MapPin,
  AlertCircle,
  CheckCircle,
  Leaf,
  Eye,
} from "lucide-react";

interface ParkDetailStatsProps {
  park: {
    id: number;
    name: string;
    area_ha: number | null;
    status: string;
  };
  zones: {
    id: number;
    name: string;
    park_id: number;
    zone_type: string | null;
    area_ha: number | null;
    created_at: string;
    updated_at: string;
  }[];
}

export function ParkDetailStats({ park, zones }: ParkDetailStatsProps) {
  const totalZones = zones.length;
  const totalArea = zones.reduce((sum, zone) => sum + (zone.area_ha || 0), 0);

  const getZoneBadgeVariant = (zoneType: string | null) => {
    switch (zoneType) {
      case "core":
        return "default";
      case "buffer":
        return "secondary";
      case "utilization":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Park Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Taman</CardTitle>
          <CardDescription>Detail informasi taman {park.name}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Zona</span>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{totalZones}</div>
            <p className="text-xs text-muted-foreground">Zona konservasi</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Luas</span>
              <TreePine className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{totalArea.toFixed(2)} ha</div>
            <p className="text-xs text-muted-foreground">Luas total zona</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status Taman</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold capitalize">{park.status}</div>
            <p className="text-xs text-muted-foreground">Status publikasi</p>
          </div>
        </CardContent>
      </Card>

      {/* Park Zones */}
      <Card>
        <CardHeader>
          <CardTitle>Zona Konservasi</CardTitle>
          <CardDescription>Pembagian zona di {park.name}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {zones.map((zone) => (
            <Card key={zone.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{zone.name}</h4>
                <Badge variant={getZoneBadgeVariant(zone.zone_type)}>
                  {zone.zone_type || "Unknown"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                Luas: {zone.area_ha ? `${zone.area_ha} ha` : "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">
                ID: {zone.id} | Park ID: {zone.park_id}
              </p>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity (Placeholder for now) */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru di Taman</CardTitle>
          <CardDescription>
            Log aktivitas observasi dan perubahan data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Belum ada aktivitas terbaru untuk taman ini.
          </p>
          {/* This section would ideally fetch real activity data related to the specific park */}
        </CardContent>
      </Card>
    </div>
  );
}
