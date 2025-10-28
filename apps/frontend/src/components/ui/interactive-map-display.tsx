'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface InteractiveMapDisplayProps {
  latitude: number;
  longitude: number;
  height?: string;
  className?: string;
}

/**
 * Read-only map display component for showing a marker at specific coordinates
 * Uses manual Leaflet initialization to avoid React Strict Mode double-mount issues
 */
export function InteractiveMapDisplay({
  latitude,
  longitude,
  height = '450px',
  className = '',
}: InteractiveMapDisplayProps) {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize map manually with proper cleanup for React Strict Mode
  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    // Prevent re-initialization if map already exists
    if (mapInstanceRef.current) {
      console.log('⚠️ Map already exists, skipping initialization');
      return;
    }

    let map: any = null;
    let L: any = null;

    // Import and initialize Leaflet
    const initMap = async () => {
      try {
        // Dynamic import to avoid SSR issues
        L = (await import('leaflet')).default;

        // Fix for default marker icon
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        if (!mapContainerRef.current) return;

        // Check if container already has a map
        const existingMap = (mapContainerRef.current as any)._leaflet_id;
        if (existingMap) {
          console.log('⚠️ Container already has a map, cleaning up first');
          delete (mapContainerRef.current as any)._leaflet_id;
          mapContainerRef.current.innerHTML = '';
        }

        // Create map instance
        map = L.map(mapContainerRef.current, {
          center: [latitude, longitude],
          zoom: 13,
          scrollWheelZoom: true,
          zoomControl: true,
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        // Add marker
        L.marker([latitude, longitude]).addTo(map);

        // Store map instance
        mapInstanceRef.current = map;
        setIsLoading(false);

        console.log('✅ Map initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing map:', error);
        setIsLoading(false);
      }
    };

    // Small delay to ensure DOM is ready and React Strict Mode cleanup is complete
    const timer = setTimeout(() => {
      initMap();
    }, 150);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      
      if (mapInstanceRef.current) {
        console.log('🧹 Cleaning up map instance');
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (error) {
          console.error('Error removing map:', error);
        }
      }

      // Clean up container
      if (mapContainerRef.current) {
        try {
          delete (mapContainerRef.current as any)._leaflet_id;
          mapContainerRef.current.innerHTML = '';
        } catch (e) {
          // ignore
        }
      }
    };
  }, [isClient, latitude, longitude]);

  if (!isClient) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Peta Lokasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center bg-gray-50 rounded-lg" style={{ height }}>
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
          <MapPin className="w-5 h-5" />
          Peta Lokasi Taman
        </CardTitle>
        <CardDescription>
          Koordinat: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          ref={mapContainerRef}
          style={{ height }} 
          className="rounded-lg overflow-hidden border relative"
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Memuat peta...</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
