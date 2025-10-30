"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-2xl bg-emerald-100/60" />
    ),
  },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);

import "leaflet/dist/leaflet.css";

export function LeafletPreview() {
  useEffect(() => {
    // Ensure leaflet CSS is loaded; nothing else required
  }, []);

  return (
    <div className="h-72 overflow-hidden rounded-2xl border border-emerald-100 shadow-sm">
      <MapContainer
        center={[-2.5489, 118.0149]}
        zoom={4}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        aria-label="Pratinjau peta taman konservasi"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
}
