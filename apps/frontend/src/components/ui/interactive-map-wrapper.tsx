'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { MapPin, Navigation, Search, Save, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface InteractiveMapWrapperProps {
  latitude?: number | null;
  longitude?: number | null;
  onCoordinatesChange: (lat: number, lng: number) => void;
  height?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

export function InteractiveMapWrapper({
  latitude,
  longitude,
  onCoordinatesChange,
  height = '400px',
}: InteractiveMapWrapperProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  
  // State for coordinate selection
  const [tempLat, setTempLat] = useState<number | null>(latitude || null);
  const [tempLng, setTempLng] = useState<number | null>(longitude || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Initialize client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync tempLat/tempLng with initial props
  useEffect(() => {
    if (latitude != null && longitude != null && tempLat === null && tempLng === null) {
      setTempLat(latitude);
      setTempLng(longitude);
    }
  }, [latitude, longitude, tempLat, tempLng]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;
    
    if (mapInstanceRef.current) {
      console.log('⚠️ Map already initialized, skipping...');
      return;
    }

    const initializeMap = async () => {
      try {
        const L = (await import('leaflet')).default;

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        const defaultCenter: [number, number] = latitude && longitude 
          ? [latitude, longitude] 
          : [-6.200000, 106.816666];

        console.log('🗺️ Initializing Leaflet map at:', defaultCenter);

        const map = L.map(mapContainerRef.current!, {
          center: defaultCenter,
          zoom: 13,
          scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        if (latitude && longitude) {
          const marker = L.marker([latitude, longitude]).addTo(map);
          markerRef.current = marker;
        }

        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          
          if (markerRef.current) {
            markerRef.current.remove();
          }
          
          markerRef.current = L.marker([lat, lng]).addTo(map);
          setTempLat(lat);
          setTempLng(lng);
          
          toast.info(`Koordinat dipilih: ${lat.toFixed(6)}, ${lng.toFixed(6)}. Klik "Simpan Koordinat" untuk menyimpan.`);
        });

        mapInstanceRef.current = map;
        console.log('✅ Map initialized successfully');

      } catch (error) {
        console.error('❌ Failed to initialize map:', error);
      }
    };

    initializeMap();

    return () => {
      console.log('🧹 Cleaning up Leaflet map...');
      
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      
      if (mapContainerRef.current) {
        mapContainerRef.current.innerHTML = '';
      }
    };
  }, [isClient]);

  // Update marker when props change
  useEffect(() => {
    if (!mapInstanceRef.current || !latitude || !longitude) return;

    const L = require('leaflet');
    
    if (markerRef.current) {
      markerRef.current.remove();
    }
    
    markerRef.current = L.marker([latitude, longitude]).addTo(mapInstanceRef.current);
    mapInstanceRef.current.setView([latitude, longitude], mapInstanceRef.current.getZoom());
    
    console.log('📍 Updated marker to:', latitude, longitude);
  }, [latitude, longitude]);

  // Handle search input change with debounce using Nominatim
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      
      try {
        // Nominatim API - Free OpenStreetMap geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(searchQuery)}` +
          `&format=json` +
          `&addressdetails=1` +
          `&limit=5` +
          `&countrycodes=id` + // Restrict to Indonesia
          `&accept-language=id`,
          {
            headers: {
              'User-Agent': 'TamanKehati/1.0', // Required by Nominatim
            },
          }
        );

        if (response.ok) {
          const data: NominatimResult[] = await response.json();
          setSearchResults(data);
          setShowResults(data.length > 0);
        } else {
          setSearchResults([]);
          setShowResults(false);
        }
      } catch (error) {
        console.error('❌ Nominatim search error:', error);
        setSearchResults([]);
        setShowResults(false);
      } finally {
        setIsSearching(false);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Select place from search results
  const handleSelectPlace = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    setShowResults(false);
    setSearchQuery(result.display_name);

    // Update map
    if (mapInstanceRef.current) {
      const L = require('leaflet');
      
      if (markerRef.current) {
        markerRef.current.remove();
      }
      
      markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
      mapInstanceRef.current.setView([lat, lng], 15);
    }

    setTempLat(lat);
    setTempLng(lng);
    
    toast.success(`Lokasi ditemukan: ${result.display_name}`);
  };

  // Get current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Browser Anda tidak mendukung geolocation');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;

        if (mapInstanceRef.current) {
          const L = require('leaflet');
          
          if (markerRef.current) {
            markerRef.current.remove();
          }
          
          markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
          mapInstanceRef.current.setView([lat, lng], 15);
        }

        setTempLat(lat);
        setTempLng(lng);
        setIsGettingLocation(false);
        toast.success(`Lokasi saat ini: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      },
      (error) => {
        setIsGettingLocation(false);
        
        let errorMessage = 'Gagal mendapatkan lokasi';
        if (error.code === 1) {
          errorMessage = 'Izin lokasi ditolak. Aktifkan izin lokasi di browser Anda.';
        } else if (error.code === 2) {
          errorMessage = 'Lokasi tidak tersedia.';
        } else if (error.code === 3) {
          errorMessage = 'Timeout mendapatkan lokasi.';
        }
        
        toast.error(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Save coordinates
  const handleSaveCoordinates = () => {
    if (tempLat === null || tempLng === null) {
      toast.error('Pilih lokasi terlebih dahulu');
      return;
    }

    onCoordinatesChange(tempLat, tempLng);
    toast.success('✅ Koordinat berhasil disimpan!');
  };

  if (!isClient) {
    return (
      <div 
        style={{ height }} 
        className="flex items-center justify-center bg-slate-100 rounded-lg border"
      >
        <p className="text-slate-500 text-sm">Memuat peta...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="space-y-3">
        {/* Search Location with Autocomplete */}
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                placeholder="Cari lokasi (contoh: Taman Kehati Jakarta)"
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowResults(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {isSearching && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => handleSelectPlace(result)}
                  className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0 flex items-start gap-3"
                >
                  <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{result.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
          >
            {isGettingLocation ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Mendapatkan Lokasi...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4" />
                Gunakan Lokasi Saat Ini
              </>
            )}
          </button>
          
          <button
            onClick={handleSaveCoordinates}
            disabled={tempLat === null || tempLng === null}
            className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Save className="h-4 w-4" />
            Simpan Koordinat
          </button>
        </div>

        {/* Coordinate Display */}
        {tempLat !== null && tempLng !== null && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
            <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Koordinat Terpilih:
              </p>
              <div className="flex items-center gap-4 text-xs text-blue-700">
                <span className="font-mono">
                  <span className="font-semibold">Lat:</span> {tempLat.toFixed(6)}
                </span>
                <span className="font-mono">
                  <span className="font-semibold">Lng:</span> {tempLng.toFixed(6)}
                </span>
              </div>
              {latitude !== tempLat || longitude !== tempLng ? (
                <p className="text-xs text-blue-600 mt-1.5 italic">
                  ⚠️ Koordinat belum disimpan. Klik "Simpan Koordinat" untuk menyimpan.
                </p>
              ) : (
                <p className="text-xs text-green-600 mt-1.5 font-medium">
                  ✓ Koordinat tersimpan
                </p>
              )}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          Ketik nama lokasi untuk pencarian otomatis, atau klik pada peta
        </p>
      </div>

      {/* Map */}
      <div 
        ref={mapContainerRef} 
        style={{ height }} 
        className="rounded-lg overflow-hidden border border-gray-300 shadow-sm"
      />
    </div>
  );
}
