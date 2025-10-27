'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  ExternalLink
} from 'lucide-react';

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
    description: "Rumah bagi orangutan Sumatra dan harimau Sumatra yang terancam punah.",
    flora: 320,
    fauna: 130,
    threats: ["Deforestasi", "Perburuan liar", "Konflik manusia-satwa"],
    conservation: "Kritis"
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
    description: "Melindungi ekosistem hutan hujan tropis dan gunung berapi aktif.",
    flora: 280,
    fauna: 100,
    threats: ["Pertambangan", "Perkebunan", "Perburuan"],
    conservation: "Tinggi"
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
    description: "Kawasan konservasi penting untuk harimau Sumatra dan badak Sumatra.",
    flora: 200,
    fauna: 90,
    threats: ["Perambahan", "Perburuan", "Fragmentasi habitat"],
    conservation: "Kritis"
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
    description: "Sekolah gajah pertama di Indonesia dan habitat badak Sumatra.",
    flora: 120,
    fauna: 60,
    threats: ["Perambahan", "Konflik manusia-satwa"],
    conservation: "Tinggi"
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
    conservation: "Kritis"
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
    conservation: "Sedang"
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
    conservation: "Tinggi"
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
    description: "Taman nasional terbesar di Asia Tenggara dengan keanekaragaman hayati tinggi.",
    flora: 450,
    fauna: 200,
    threats: ["Pertambangan", "Perambahan", "Perburuan"],
    conservation: "Tinggi"
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
    conservation: "Kritis"
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
    conservation: "Tinggi"
  }
];

interface InteractiveMapProps {
  className?: string;
}

export function InteractiveMapSimple({ className }: InteractiveMapProps) {
  const [selectedLayer, setSelectedLayer] = useState<'all' | 'flora' | 'fauna' | 'endemic'>('all');
  const [selectedConservation, setSelectedConservation] = useState<'all' | 'kritis' | 'tinggi' | 'sedang'>('all');
  const [selectedPark, setSelectedPark] = useState<any>(null);
  const [mapView, setMapView] = useState<'grid' | 'list'>('grid');

  const filteredParks = nationalParksData.filter(park => {
    const layerMatch = selectedLayer === 'all' || 
      (selectedLayer === 'flora' && park.flora > 200) ||
      (selectedLayer === 'fauna' && park.fauna > 80) ||
      (selectedLayer === 'endemic' && park.endemic > 20);
    
    const conservationMatch = selectedConservation === 'all' || 
      park.conservation.toLowerCase() === selectedConservation;
    
    return layerMatch && conservationMatch;
  });

  const getConservationColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'kritis': return '#EF4444';
      case 'tinggi': return '#F59E0B';
      case 'sedang': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getConservationIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'kritis': return '🔴';
      case 'tinggi': return '🟡';
      case 'sedang': return '🟢';
      default: return '⚪';
    }
  };

  const openInGoogleMaps = (coordinates: [number, number], name: string) => {
    const [lat, lng] = coordinates;
    const url = `https://www.google.com/maps?q=${lat},${lng}&z=10`;
    window.open(url, '_blank');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <Select value={selectedLayer} onValueChange={(value: any) => setSelectedLayer(value)}>
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

          <Select value={selectedConservation} onValueChange={(value: any) => setSelectedConservation(value)}>
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
            variant={mapView === 'grid' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setMapView('grid')}
          >
            <Layers className="h-4 w-4 mr-1" />
            Grid
          </Button>
          <Button 
            variant={mapView === 'list' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setMapView('list')}
          >
            <Search className="h-4 w-4 mr-1" />
            List
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
            {filteredParks.length} dari {nationalParksData.length} taman nasional ditampilkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full rounded-lg overflow-hidden border bg-gradient-to-br from-green-50 to-blue-50">
            {mapView === 'grid' ? (
              <div className="h-full p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 h-full overflow-y-auto">
                  {filteredParks.map((park) => (
                    <div
                      key={park.id}
                      className="bg-white rounded-lg p-3 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedPark(park)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">{park.name}</h3>
                        <Badge 
                          variant="outline" 
                          style={{ backgroundColor: getConservationColor(park.conservation) }}
                          className="text-white border-0 text-xs"
                        >
                          {getConservationIcon(park.conservation)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-600">
                        <p><strong>Lokasi:</strong> {park.location}</p>
                        <p><strong>Luas:</strong> {park.area.toLocaleString()} ha</p>
                        <div className="flex gap-2 text-xs">
                          <span className="text-green-600">🌿 {park.flora}</span>
                          <span className="text-blue-600">🐾 {park.fauna}</span>
                          <span className="text-purple-600">⭐ {park.endemic}</span>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          openInGoogleMaps(park.coordinates as [number, number], park.name);
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Buka di Maps
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full p-4">
                <div className="space-y-2 h-full overflow-y-auto">
                  {filteredParks.map((park) => (
                    <div
                      key={park.id}
                      className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedPark(park)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{park.name}</h3>
                            <Badge 
                              variant="outline" 
                              style={{ backgroundColor: getConservationColor(park.conservation) }}
                              className="text-white border-0"
                            >
                              {getConservationIcon(park.conservation)} {park.conservation}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{park.location}</p>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>Luas: {park.area.toLocaleString()} ha</span>
                            <span>Spesies: {park.species}</span>
                            <span>Pengunjung: {park.visitors.toLocaleString()}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            openInGoogleMaps(park.coordinates as [number, number], park.name);
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Maps
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                    <p className="text-lg font-bold text-green-600">{selectedPark.flora}</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Bird className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm font-medium">Fauna</p>
                    <p className="text-lg font-bold text-blue-600">{selectedPark.fauna}</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Shield className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-sm font-medium">Endemik</p>
                    <p className="text-lg font-bold text-purple-600">{selectedPark.endemic}</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Users className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                    <p className="text-sm font-medium">Pengunjung</p>
                    <p className="text-lg font-bold text-orange-600">{selectedPark.visitors.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Deskripsi</h4>
                  <p className="text-gray-600">{selectedPark.description}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => openInGoogleMaps(selectedPark.coordinates, selectedPark.name)}
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Buka di Google Maps
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPark(null)}
                  >
                    Tutup
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="biodiversity" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <TreePine className="h-4 w-4 text-green-600" />
                      Keanekaragaman Flora
                    </h4>
                    <p className="text-sm text-gray-600">Total spesies flora: <strong>{selectedPark.flora}</strong></p>
                    <p className="text-sm text-gray-600">Endemik: <strong>{Math.round(selectedPark.flora * 0.3)}</strong></p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Bird className="h-4 w-4 text-blue-600" />
                      Keanekaragaman Fauna
                    </h4>
                    <p className="text-sm text-gray-600">Total spesies fauna: <strong>{selectedPark.fauna}</strong></p>
                    <p className="text-sm text-gray-600">Endemik: <strong>{Math.round(selectedPark.fauna * 0.2)}</strong></p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="conservation" className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Status Konservasi</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant="outline" 
                      style={{ backgroundColor: getConservationColor(selectedPark.conservation) }}
                      className="text-white border-0"
                    >
                      {getConservationIcon(selectedPark.conservation)} {selectedPark.conservation}
                    </Badge>
                    <span className="text-sm text-gray-600">{selectedPark.status}</span>
                  </div>
                  <p className="text-sm text-gray-600">Didirikan: <strong>{selectedPark.established}</strong></p>
                  <p className="text-sm text-gray-600">Luas area: <strong>{selectedPark.area.toLocaleString()} ha</strong></p>
                </div>
              </TabsContent>
              
              <TabsContent value="threats" className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 text-red-600">Ancaman Utama</h4>
                  <ul className="space-y-1">
                    {selectedPark.threats.map((threat: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        {threat}
                      </li>
                    ))}
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
