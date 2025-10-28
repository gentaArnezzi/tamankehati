'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { MapPin, Navigation, Search } from 'lucide-react';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
if (typeof window !== 'undefined') {
  delete (Icon.Default.prototype as any)._getIconUrl;
  Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

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

function MapClickHandler({ onMapClick, initialLat, initialLng }: MapClickHandlerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );

  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onMapClick(lat, lng);
    },
  });

  // Update map center when initialLat/initialLng change
  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition([initialLat, initialLng]);
      map.setView([initialLat, initialLng], map.getZoom());
    }
  }, [initialLat, initialLng, map]);

  return position ? <Marker position={position} /> : null;
}

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
  const [isMapMounted, setIsMapMounted] = useState(false);
  const [mapKey, setMapKey] = useState(''); // Dynamic key to force re-mount
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const containerIdRef = useRef(`map-${Date.now()}-${Math.random()}`); // Unique ID per instance

  // Initialize client-side rendering with unique key
  useEffect(() => {
    setIsClient(true);
    // Generate unique key for this mount
    setMapKey(`map-instance-${Date.now()}-${Math.random()}`);
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setIsMapMounted(true);
    }, 150);
    
    return () => {
      clearTimeout(timer);
      setIsMapMounted(false);
    };
  }, []);

  // Initialize map center with provided coordinates
  useEffect(() => {
    if (latitude && longitude) {
      setMapCenter([latitude, longitude]);
    }
  }, [latitude, longitude]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up map:', containerIdRef.current);
      
      // Cleanup any existing map instances
      if (mapContainerRef.current) {
        const mapContainer = mapContainerRef.current;
        
        // Find and destroy Leaflet map instance
        const leafletContainer = mapContainer.querySelector('.leaflet-container');
        if (leafletContainer) {
          try {
            // Remove Leaflet's internal reference
            delete (leafletContainer as any)._leaflet_id;
          } catch (e) {
            console.warn('Error removing leaflet ID:', e);
          }
          leafletContainer.remove();
        }
        
        // Clear the entire container
        mapContainer.innerHTML = '';
        
        // Remove all Leaflet classes from container
        if (mapContainer.className) {
          mapContainer.className = mapContainer.className.replace(/leaflet-\S+/g, '').trim();
        }
      }
      
      // No need to reset tracker - component is unmounting
    };
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    onCoordinatesChange(lat, lng);
    toast.success(`Koordinat dipilih: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  }, [onCoordinatesChange]);

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
        <div 
          ref={mapContainerRef} 
          id={containerIdRef.current}
          style={{ height }} 
          className="rounded-lg overflow-hidden border"
        >
          {isClient && isMapMounted && mapKey ? (
            <MapContainer
              key={mapKey}
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
              whenReady={() => {
                console.log('✅ Map initialized:', containerIdRef.current);
              }}
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
          ) : (
            <div className="flex items-center justify-center h-full bg-slate-100">
              <p className="text-slate-500 text-sm">Memuat peta...</p>
            </div>
          )}
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