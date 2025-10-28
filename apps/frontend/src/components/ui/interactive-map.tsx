'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { MapPin, Navigation, Search } from 'lucide-react';
import { toast } from 'sonner';

// Dynamic import untuk menghindari SSR issues - hanya import saat client-side
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const useMapEvents = dynamic(() => import('react-leaflet').then(mod => mod.useMapEvents), { ssr: false });

interface InteractiveMapProps {
  latitude?: number | null;
  longitude?: number | null;
  onCoordinatesChange: (lat: number, lng: number) => void;
  height?: string;
  className?: string;
}

interface MapClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

// Dynamic MapClickHandler component
const MapClickHandler = dynamic(() => {
  return Promise.resolve(function MapClickHandlerComponent({ onMapClick, initialLat, initialLng }: MapClickHandlerProps) {
    const [position, setPosition] = useState<[number, number] | null>(
      initialLat && initialLng ? [initialLat, initialLng] : null
    );

    // Dynamic import untuk react-leaflet hooks
    const useMapEvents = require('react-leaflet').useMapEvents;
    const Marker = require('react-leaflet').Marker;

    useMapEvents({
      click: (e: any) => {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onMapClick(lat, lng);
      },
    });

    return position ? <Marker position={position} /> : null;
  });
}, { ssr: false });

export function InteractiveMap({
  latitude,
  longitude,
  onCoordinatesChange,
  height = '400px',
  className = '',
}: InteractiveMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([-6.200000, 106.816666]); // Default to Jakarta
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef<any>(null);

  // Initialize client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize map center with provided coordinates or default to Jakarta
  useEffect(() => {
    if (latitude && longitude) {
      setMapCenter([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handleMapClick = (lat: number, lng: number) => {
    onCoordinatesChange(lat, lng);
    toast.success(`Koordinat dipilih: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Use Nominatim (OpenStreetMap) geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=id`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        
        setMapCenter([newLat, newLng]);
        onCoordinatesChange(newLat, newLng);
        
        if (mapRef.current) {
          mapRef.current.setView([newLat, newLng], 15);
        }
        
        toast.success(`Lokasi ditemukan: ${data[0].display_name}`);
      } else {
        toast.error('Lokasi tidak ditemukan. Coba dengan kata kunci yang berbeda.');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Gagal mencari lokasi. Silakan coba lagi.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolokasi tidak didukung oleh browser ini.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setMapCenter([lat, lng]);
        onCoordinatesChange(lat, lng);
        
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 15);
        }
        
        toast.success('Lokasi saat ini ditemukan!');
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Gagal mendapatkan lokasi saat ini. Pastikan izin geolokasi diaktifkan.');
      }
    );
  };

  // Show loading state during SSR
  if (!isClient) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Pilih Koordinat Taman
          </CardTitle>
          <CardDescription>
            Memuat peta interaktif...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Memuat peta...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Pilih Koordinat Taman
        </CardTitle>
        <CardDescription>
          Klik pada peta atau gunakan pencarian untuk memilih koordinat taman konservasi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Location Controls */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="location-search" className="sr-only">
              Cari Lokasi
            </Label>
            <Input
              id="location-search"
              placeholder="Cari lokasi (contoh: Jakarta, Bandung, Taman Nasional...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            variant="outline"
            size="sm"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleCurrentLocation}
            variant="outline"
            size="sm"
            title="Gunakan lokasi saat ini"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>

        {/* Current Coordinates Display */}
        {(latitude && longitude) && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium">Koordinat Terpilih:</p>
            <p className="text-sm text-muted-foreground">
              Latitude: {latitude.toFixed(6)} | Longitude: {longitude.toFixed(6)}
            </p>
          </div>
        )}

        {/* Map Container */}
        <div style={{ height }} className="rounded-lg overflow-hidden border">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler
              onMapClick={handleMapClick}
              initialLat={latitude || undefined}
              initialLng={longitude || undefined}
            />
          </MapContainer>
        </div>

        {/* Instructions */}
        <div className="text-sm text-muted-foreground">
          <p>• Klik pada peta untuk memilih koordinat</p>
          <p>• Gunakan pencarian untuk menemukan lokasi spesifik</p>
          <p>• Gunakan tombol navigasi untuk lokasi saat ini</p>
        </div>
      </CardContent>
    </Card>
  );
}
