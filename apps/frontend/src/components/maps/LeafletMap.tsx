'use client';

import { useEffect, useId, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletMapProps {
  center?: LatLngExpression;
  zoom?: number;
  scrollWheelZoom?: boolean;
  className?: string;
  height?: string;
  markers?: Array<{
    position: LatLngExpression;
    popup?: string;
    key?: string;
  }>;
  children?: React.ReactNode;
}

export function LeafletMap({
  center = [-2.5489, 118.0149], // Indonesia center
  zoom = 4,
  scrollWheelZoom = false,
  className = "",
  height = "h-96",
  markers = [],
  children
}: LeafletMapProps) {
  const [isClient, setIsClient] = useState(false);
  const renderKey = useId(); // Move useId() to top level

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`overflow-hidden rounded-2xl border border-emerald-100 shadow-sm ${className}`}>
        <div className={`w-full ${height} bg-gray-200 animate-pulse flex items-center justify-center`}>
          <p className="text-gray-500">Memuat peta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-emerald-100 shadow-sm ${className}`}>
      <MapContainer
        key={`map-${renderKey}`} // Use the renderKey from useId()
        center={center}
        zoom={zoom}
        scrollWheelZoom={scrollWheelZoom}
        className={`w-full ${height}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render markers */}
        {markers.map((marker, index) => (
          <Marker key={marker.key || index} position={marker.position}>
            {marker.popup && <Popup>{marker.popup}</Popup>}
          </Marker>
        ))}

        {/* Render children */}
        {children}
      </MapContainer>
    </div>
  );
}
