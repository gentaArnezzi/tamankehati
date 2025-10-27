"use client";

import { LatLngExpression } from 'leaflet';
import { LeafletMapWrapper } from './LeafletMapWrapper';

interface LeafletPreviewProps {
  center?: LatLngExpression;
  zoom?: number;
  height?: string;
  markers?: Array<{
    position: LatLngExpression;
    popup?: string;
  }>;
}

export function LeafletPreview({
  center = [-2.5489, 118.0149], // Indonesia center
  zoom = 4,
  height = "h-72",
  markers = []
}: LeafletPreviewProps) {
  return (
    <LeafletMapWrapper
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      height={height}
      markers={markers}
    />
  );
}
