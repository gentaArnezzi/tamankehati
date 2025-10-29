'use client';

import { useEffect, useRef } from 'react';

interface MapWrapperProps {
  center: [number, number];
  zoom: number;
  markers: Array<{
    position: [number, number];
    popup: string;
    key: string;
  }>;
  scrollWheelZoom?: boolean;
  height?: string;
}

export function MapWrapper({ center, zoom, markers, scrollWheelZoom = true, height = '600px' }: MapWrapperProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Check if map is already initialized
    if (mapInstanceRef.current) {
      console.log('Map already initialized, skipping...');
      return;
    }

    // Dynamic import Leaflet
    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        
        // Fix default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Check if container already has a Leaflet instance
        if (mapRef.current && (mapRef.current as any)._leaflet_id) {
          console.log('Container already has map, cleaning up...');
          delete (mapRef.current as any)._leaflet_id;
          mapRef.current.innerHTML = '';
        }

        // Create map
        const map = L.map(mapRef.current!, {
          center,
          zoom,
          scrollWheelZoom,
          zoomControl: true,
        });

        // Add tile layer with dark filter
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          className: 'map-tiles-dark',
        }).addTo(map);

        // Add CSS for dark overlay on tiles
        const style = document.createElement('style');
        style.textContent = `
          .map-tiles-dark {
            filter: brightness(0.6) contrast(1.1) saturate(0.8);
          }
        `;
        document.head.appendChild(style);

        // Add dummy connected markers for visual effect
        const dummyLocations = [
          { lat: 3.5952, lng: 98.6722, name: 'Taman Sumatera Utara' },      // Medan area
          { lat: -6.2088, lng: 106.8456, name: 'Taman Jakarta' },           // Jakarta
          { lat: -7.2575, lng: 112.7521, name: 'Taman Jawa Timur' },        // Surabaya area
          { lat: 0.5071, lng: 101.4478, name: 'Taman Riau' },               // Riau
          { lat: -0.9471, lng: 113.9213, name: 'Taman Kalimantan' },        // Kalimantan Tengah
          { lat: -2.5489, lng: 118.0149, name: 'Taman Sulawesi' },          // Sulawesi Tengah
          { lat: -3.3194, lng: 114.5906, name: 'Taman Kalimantan Selatan' },// Kalimantan Selatan
          { lat: -0.8917, lng: 119.8707, name: 'Taman Sulawesi Tengah' },   // Sulawesi
          { lat: -5.1477, lng: 119.4327, name: 'Taman Sulawesi Selatan' },  // Makassar area
          { lat: -2.9761, lng: 140.7187, name: 'Taman Papua' },             // Papua
        ];

        // Create custom emerald pin icon (larger and brighter)
        const createCustomIcon = () => {
          return L.divIcon({
            html: `
              <div style="position: relative;">
                <!-- Outer glow -->
                <div style="
                  position: absolute;
                  top: -4px;
                  left: -4px;
                  width: 24px;
                  height: 24px;
                  background: rgba(16, 185, 129, 0.3);
                  border-radius: 50%;
                  filter: blur(4px);
                "></div>
                
                <!-- Main dot -->
                <div style="
                  width: 16px;
                  height: 16px;
                  background: #10b981;
                  border: 4px solid white;
                  border-radius: 50%;
                  box-shadow: 0 0 12px rgba(16, 185, 129, 0.8), 0 0 24px rgba(16, 185, 129, 0.4);
                  position: relative;
                  z-index: 1000;
                "></div>
                
                <!-- Ping animation -->
                <div class="ping" style="
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 16px;
                  height: 16px;
                  background: #10b981;
                  border-radius: 50%;
                  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                  opacity: 0.75;
                "></div>
              </div>
              <style>
                @keyframes ping {
                  75%, 100% {
                    transform: scale(3);
                    opacity: 0;
                  }
                }
              </style>
            `,
            className: '',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });
        };

        // Add connecting lines between locations
        const lineCoordinates: [number, number][] = [
          [dummyLocations[0].lat, dummyLocations[0].lng], // Medan
          [dummyLocations[3].lat, dummyLocations[3].lng], // Riau
          [dummyLocations[4].lat, dummyLocations[4].lng], // Kalimantan Tengah
          [dummyLocations[6].lat, dummyLocations[6].lng], // Kalimantan Selatan
          [dummyLocations[7].lat, dummyLocations[7].lng], // Sulawesi Tengah
          [dummyLocations[8].lat, dummyLocations[8].lng], // Sulawesi Selatan
          [dummyLocations[9].lat, dummyLocations[9].lng], // Papua
        ];

        const lineCoordinates2: [number, number][] = [
          [dummyLocations[0].lat, dummyLocations[0].lng], // Medan
          [dummyLocations[1].lat, dummyLocations[1].lng], // Jakarta
          [dummyLocations[2].lat, dummyLocations[2].lng], // Surabaya
          [dummyLocations[5].lat, dummyLocations[5].lng], // Sulawesi Tengah
        ];

        // Draw connection lines with dashed style (brighter and thicker)
        L.polyline(lineCoordinates, {
          color: '#10b981',
          weight: 3,
          opacity: 0.7,
          dashArray: '10, 10',
          smoothFactor: 1,
        }).addTo(map);

        L.polyline(lineCoordinates2, {
          color: '#34d399',
          weight: 3,
          opacity: 0.6,
          dashArray: '10, 10',
          smoothFactor: 1,
        }).addTo(map);

        // Add dummy markers with custom icons
        dummyLocations.forEach((location) => {
          const marker = L.marker([location.lat, location.lng], {
            icon: createCustomIcon(),
          }).addTo(map);
          
          marker.bindPopup(`
            <div style="text-align: center; padding: 4px;">
              <div style="font-weight: 600; color: #064e3b; font-size: 13px;">${location.name}</div>
            </div>
          `);
        });

        // Add real park markers if provided (with different style)
        if (markers && markers.length > 0) {
          markers.forEach((marker) => {
            const leafletMarker = L.marker(marker.position).addTo(map);
            if (marker.popup) {
              leafletMarker.bindPopup(marker.popup);
            }
          });
        }

        mapInstanceRef.current = map;
        console.log('Map initialized successfully with connected markers');
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initMap();
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      
      if (mapInstanceRef.current) {
        console.log('Cleaning up map...');
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }

      // Clean up container
      if (mapRef.current) {
        delete (mapRef.current as any)._leaflet_id;
        mapRef.current.innerHTML = '';
      }
    };
  }, []); // Empty deps - only initialize once

  // Update markers when they change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const updateMarkers = async () => {
      try {
        const L = (await import('leaflet')).default;
        
        // Clear existing markers (if we want to update)
        // For now, we'll just keep the initial markers
        console.log('Markers updated');
      } catch (error) {
        console.error('Error updating markers:', error);
      }
    };

    updateMarkers();
  }, [markers]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="rounded-2xl overflow-hidden border border-emerald-100"
      />
    </>
  );
}

