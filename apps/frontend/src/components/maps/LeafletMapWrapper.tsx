"use client";

import dynamic from "next/dynamic";
import { LatLngExpression } from "leaflet";

const DynamicLeafletMap = dynamic(
  () => import("./LeafletMap").then((mod) => ({ default: mod.LeafletMap })),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 w-full bg-gray-200 animate-pulse rounded-2xl flex items-center justify-center">
        <p className="text-gray-500">Memuat peta...</p>
      </div>
    ),
  },
);

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

export function LeafletMapWrapper(props: LeafletMapProps) {
  return <DynamicLeafletMap {...props} />;
}
