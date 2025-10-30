"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  TreePine,
  Bird,
  Users,
  Eye,
  Filter,
  Layers,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  Shield,
  Calendar,
  BarChart3,
  RefreshCw,
} from "lucide-react";

// Dynamic import untuk menghindari SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// Geospatial data untuk taman nasional Indonesia
const nationalParksData = [
  {
    id: 1,
    name: "Taman Nasional Gunung Leuser",
    location: "Sumatra Utara & Aceh",
    coordinates: [3.5, 97.5],
    area: 7927,
    species: 450,
    visitors: 125000,
    endemic: 45,
    status: "World Heritage Site",
    established: 1980,
    description:
      "Rumah bagi orangutan Sumatra dan harimau Sumatra yang terancam punah.",
    flora: 320,
    fauna: 130,
    threats: ["Deforestasi", "Perburuan liar", "Konflik manusia-satwa"],
    conservation: "Kritis",
  },
  {
    id: 2,
    name: "Taman Nasional Kerinci Seblat",
    location: "Sumatra Barat, Jambi, Bengkulu, Sumatera Selatan",
    coordinates: [-2.5, 101.5],
    area: 13750,
    species: 380,
    visitors: 98000,
    endemic: 28,
    status: "World Heritage Site",
    established: 1982,
    description:
      "Melindungi ekosistem hutan hujan tropis dan gunung berapi aktif.",
    flora: 280,
    fauna: 100,
    threats: ["Pertambangan", "Perkebunan", "Perburuan"],
    conservation: "Tinggi",
  },
  {
    id: 3,
    name: "Taman Nasional Bukit Barisan Selatan",
    location: "Lampung & Bengkulu",
    coordinates: [-5.5, 104.0],
    area: 3568,
    species: 290,
    visitors: 75000,
    endemic: 23,
    status: "World Heritage Site",
    established: 1982,
    description:
      "Kawasan konservasi penting untuk harimau Sumatra dan badak Sumatra.",
    flora: 200,
    fauna: 90,
    threats: ["Perambahan", "Perburuan", "Fragmentasi habitat"],
    conservation: "Kritis",
  },
  {
    id: 4,
    name: "Taman Nasional Way Kambas",
    location: "Lampung",
    coordinates: [-4.8, 105.8],
    area: 1300,
    species: 180,
    visitors: 45000,
    endemic: 15,
    status: "Ramsar Site",
    established: 1989,
    description:
      "Sekolah gajah pertama di Indonesia dan habitat badak Sumatra.",
    flora: 120,
    fauna: 60,
    threats: ["Perambahan", "Konflik manusia-satwa"],
    conservation: "Tinggi",
  },
  {
    id: 5,
    name: "Taman Nasional Ujung Kulon",
    location: "Banten",
    coordinates: [-6.8, 105.3],
    area: 1206,
    species: 220,
    visitors: 32000,
    endemic: 18,
    status: "World Heritage Site",
    established: 1992,
    description: "Habitat terakhir badak Jawa di dunia.",
    flora: 150,
    fauna: 70,
    threats: ["Tsunami", "Perambahan", "Penyakit"],
    conservation: "Kritis",
  },
  {
    id: 6,
    name: "Taman Nasional Bromo Tengger Semeru",
    location: "Jawa Timur",
    coordinates: [-7.9, 112.9],
    area: 503,
    species: 150,
    visitors: 280000,
    endemic: 12,
    status: "Geopark",
    established: 1982,
    description: "Landscape vulkanik yang spektakuler dengan budaya Tengger.",
    flora: 100,
    fauna: 50,
    threats: ["Erupsi", "Wisata berlebihan", "Perambahan"],
    conservation: "Sedang",
  },
  {
    id: 7,
    name: "Taman Nasional Komodo",
    location: "Nusa Tenggara Timur",
    coordinates: [-8.5, 119.5],
    area: 1731,
    species: 200,
    visitors: 180000,
    endemic: 25,
    status: "World Heritage Site",
    established: 1980,
    description: "Habitat komodo, kadal terbesar di dunia.",
    flora: 140,
    fauna: 60,
    threats: ["Perburuan", "Wisata berlebihan", "Perubahan iklim"],
    conservation: "Tinggi",
  },
  {
    id: 8,
    name: "Taman Nasional Lorentz",
    location: "Papua",
    coordinates: [-4.5, 138.0],
    area: 25056,
    species: 650,
    visitors: 12000,
    endemic: 89,
    status: "World Heritage Site",
    established: 1997,
    description:
      "Taman nasional terbesar di Asia Tenggara dengan keanekaragaman hayati tinggi.",
    flora: 450,
    fauna: 200,
    threats: ["Pertambangan", "Perambahan", "Perburuan"],
    conservation: "Tinggi",
  },
  {
    id: 9,
    name: "Taman Nasional Tanjung Puting",
    location: "Kalimantan Tengah",
    coordinates: [-2.8, 111.8],
    area: 4150,
    species: 320,
    visitors: 85000,
    endemic: 35,
    status: "Biosphere Reserve",
    established: 1982,
    description: "Habitat orangutan Kalimantan dan ekosistem gambut.",
    flora: 220,
    fauna: 100,
    threats: ["Deforestasi", "Kebakaran gambut", "Perambahan"],
    conservation: "Kritis",
  },
  {
    id: 10,
    name: "Taman Nasional Bunaken",
    location: "Sulawesi Utara",
    coordinates: [1.6, 124.8],
    area: 890,
    species: 180,
    visitors: 95000,
    endemic: 22,
    status: "Marine Protected Area",
    established: 1991,
    description: "Keanekaragaman hayati laut tertinggi di dunia.",
    flora: 120,
    fauna: 60,
    threats: ["Overfishing", "Polusi laut", "Perubahan iklim"],
    conservation: "Tinggi",
  },
];

// Custom icon untuk marker menggunakan Leaflet Icon
const createCustomIcon = (
  type: "flora" | "fauna" | "mixed",
  size: number = 25,
) => {
  const colors = {
    flora: "#10B981",
    fauna: "#3B82F6",
    mixed: "#8B5CF6",
  };

  return {
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${colors[type]}" stroke="white" stroke-width="2">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="3"/>
      </svg>
    `)}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  };
};

interface InteractiveMapProps {
  className?: string;
}

export function InteractiveMap({ className }: InteractiveMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<
    "all" | "flora" | "fauna" | "endemic"
  >("all");
  const [selectedConservation, setSelectedConservation] = useState<
    "all" | "kritis" | "tinggi" | "sedang"
  >("all");
  const [mapCenter, setMapCenter] = useState<[number, number]>([-2.0, 118.0]);
  const [mapZoom, setMapZoom] = useState(5);
  const [selectedPark, setSelectedPark] = useState<any>(null);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    // Check if Leaflet is already loaded
    if (typeof window !== "undefined" && (window as any).L) {
      setMapLoaded(true);
      return;
    }

    // Load Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      // Load marker cluster CSS
      const clusterLink = document.createElement("link");
      clusterLink.rel = "stylesheet";
      clusterLink.href =
        "https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css";
      document.head.appendChild(clusterLink);

      // Load marker cluster JS
      const clusterScript = document.createElement("script");
      clusterScript.src =
        "https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js";
      clusterScript.onload = () => setMapLoaded(true);
      document.head.appendChild(clusterScript);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup - only remove if we added them
      try {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    };
  }, []);

  // Update map key when filters change to force re-render
  useEffect(() => {
    setMapKey((prev) => prev + 1);
  }, [selectedLayer, selectedConservation]);

  const filteredParks = nationalParksData.filter((park) => {
    const layerMatch =
      selectedLayer === "all" ||
      (selectedLayer === "flora" && park.flora > 200) ||
      (selectedLayer === "fauna" && park.fauna > 80) ||
      (selectedLayer === "endemic" && park.endemic > 20);

    const conservationMatch =
      selectedConservation === "all" ||
      park.conservation.toLowerCase() === selectedConservation;

    return layerMatch && conservationMatch;
  });

  const getConservationColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "kritis":
        return "#EF4444";
      case "tinggi":
        return "#F59E0B";
      case "sedang":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const getConservationIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "kritis":
        return "🔴";
      case "tinggi":
        return "🟡";
      case "sedang":
        return "🟢";
      default:
        return "⚪";
    }
  };

  if (!mapLoaded) {
    return (
      <div
        className={`h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat peta interaktif...</p>
        </div>
      </div>
    );
  }

  // Error fallback component
  const MapErrorFallback = () => (
    <div className="h-96 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <MapPin className="h-16 w-16 text-red-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Error Memuat Peta
        </h3>
        <p className="text-gray-600 mb-4">
          Terjadi kesalahan saat memuat peta interaktif
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setMapKey((prev) => prev + 1);
            setMapLoaded(false);
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Coba Lagi
        </Button>
      </div>
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <Select
            value={selectedLayer}
            onValueChange={(value: any) => setSelectedLayer(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter Layer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Data</SelectItem>
              <SelectItem value="flora">Flora Dominan</SelectItem>
              <SelectItem value="fauna">Fauna Dominan</SelectItem>
              <SelectItem value="endemic">Spesies Endemik</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedConservation}
            onValueChange={(value: any) => setSelectedConservation(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status Konservasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="kritis">🔴 Kritis</SelectItem>
              <SelectItem value="tinggi">🟡 Tinggi</SelectItem>
              <SelectItem value="sedang">🟢 Sedang</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMapCenter([-2.0, 118.0])}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMapZoom(mapZoom + 1)}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMapZoom(mapZoom - 1)}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Peta Interaktif Taman Nasional Indonesia
          </CardTitle>
          <CardDescription>
            {filteredParks.length} dari {nationalParksData.length} taman
            nasional ditampilkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full rounded-lg overflow-hidden border">
            {(() => {
              try {
                return (
                  <MapContainer
                    key={mapKey}
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {filteredParks.map((park) => (
                      <Marker
                        key={park.id}
                        position={park.coordinates as [number, number]}
                        eventHandlers={{
                          click: () => setSelectedPark(park),
                        }}
                      >
                        <Popup>
                          <div className="p-2 min-w-[300px]">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-lg text-gray-900">
                                {park.name}
                              </h3>
                              <Badge
                                variant="outline"
                                style={{
                                  backgroundColor: getConservationColor(
                                    park.conservation,
                                  ),
                                }}
                                className="text-white border-0"
                              >
                                {getConservationIcon(park.conservation)}{" "}
                                {park.conservation}
                              </Badge>
                            </div>

                            <div className="space-y-2 text-sm">
                              <p className="text-gray-600">
                                <strong>Lokasi:</strong> {park.location}
                              </p>
                              <p className="text-gray-600">
                                <strong>Luas:</strong>{" "}
                                {park.area.toLocaleString()} ha
                              </p>
                              <p className="text-gray-600">
                                <strong>Spesies:</strong> {park.species} total
                              </p>
                              <div className="flex gap-4 text-xs">
                                <span className="text-green-600">
                                  🌿 Flora: {park.flora}
                                </span>
                                <span className="text-blue-600">
                                  🐾 Fauna: {park.fauna}
                                </span>
                                <span className="text-purple-600">
                                  ⭐ Endemik: {park.endemic}
                                </span>
                              </div>
                              <p className="text-gray-600">
                                <strong>Pengunjung:</strong>{" "}
                                {park.visitors.toLocaleString()}/tahun
                              </p>
                              <p className="text-gray-600">
                                <strong>Status:</strong> {park.status}
                              </p>
                              <p className="text-gray-600">
                                <strong>Didirikan:</strong> {park.established}
                              </p>
                            </div>

                            <div className="mt-3 pt-2 border-t">
                              <p className="text-sm text-gray-700">
                                {park.description}
                              </p>
                            </div>

                            <div className="mt-2">
                              <p className="text-xs text-red-600">
                                <strong>Ancaman:</strong>{" "}
                                {park.threats.join(", ")}
                              </p>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                );
              } catch (error) {
                console.error("Map initialization error:", error);
                return <MapErrorFallback />;
              }
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Park Details Panel */}
      {selectedPark && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Detail: {selectedPark.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="biodiversity">Biodiversitas</TabsTrigger>
                <TabsTrigger value="conservation">Konservasi</TabsTrigger>
                <TabsTrigger value="threats">Ancaman</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <TreePine className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-sm font-medium">Flora</p>
                    <p className="text-lg font-bold text-green-600">
                      {selectedPark.flora}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Bird className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm font-medium">Fauna</p>
                    <p className="text-lg font-bold text-blue-600">
                      {selectedPark.fauna}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Shield className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-sm font-medium">Endemik</p>
                    <p className="text-lg font-bold text-purple-600">
                      {selectedPark.endemic}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Users className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                    <p className="text-sm font-medium">Pengunjung</p>
                    <p className="text-lg font-bold text-orange-600">
                      {selectedPark.visitors.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Deskripsi</h4>
                  <p className="text-gray-600">{selectedPark.description}</p>
                </div>
              </TabsContent>

              <TabsContent value="biodiversity" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <TreePine className="h-4 w-4 text-green-600" />
                      Keanekaragaman Flora
                    </h4>
                    <p className="text-sm text-gray-600">
                      Total spesies flora: <strong>{selectedPark.flora}</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                      Endemik:{" "}
                      <strong>{Math.round(selectedPark.flora * 0.3)}</strong>
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Bird className="h-4 w-4 text-blue-600" />
                      Keanekaragaman Fauna
                    </h4>
                    <p className="text-sm text-gray-600">
                      Total spesies fauna: <strong>{selectedPark.fauna}</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                      Endemik:{" "}
                      <strong>{Math.round(selectedPark.fauna * 0.2)}</strong>
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="conservation" className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Status Konservasi</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: getConservationColor(
                          selectedPark.conservation,
                        ),
                      }}
                      className="text-white border-0"
                    >
                      {getConservationIcon(selectedPark.conservation)}{" "}
                      {selectedPark.conservation}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {selectedPark.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Didirikan: <strong>{selectedPark.established}</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    Luas area:{" "}
                    <strong>{selectedPark.area.toLocaleString()} ha</strong>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="threats" className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 text-red-600">
                    Ancaman Utama
                  </h4>
                  <ul className="space-y-1">
                    {selectedPark.threats.map(
                      (threat: string, index: number) => (
                        <li
                          key={index}
                          className="text-sm text-gray-600 flex items-center gap-2"
                        >
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          {threat}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Map Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Legenda Peta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              <span className="text-sm">Taman Nasional</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm">Status Kritis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Status Tinggi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm">Status Sedang</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
