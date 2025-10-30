"use client";

import { useEffect, useRef } from "react";

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

export function MapWrapper({
  center,
  zoom,
  markers,
  scrollWheelZoom = true,
  height = "600px",
}: MapWrapperProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined" || !mapRef.current) return;

    // Check if map is already initialized
    if (mapInstanceRef.current) {
      console.log("Map already initialized, skipping...");
      return;
    }

    // Dynamic import Leaflet
    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;

        // Fix default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        // Check if container already has a Leaflet instance
        if (mapRef.current && (mapRef.current as any)._leaflet_id) {
          console.log("Container already has map, cleaning up...");
          delete (mapRef.current as any)._leaflet_id;
          mapRef.current.innerHTML = "";
        }

        // Create map
        const map = L.map(mapRef.current!, {
          center,
          zoom,
          scrollWheelZoom,
          zoomControl: true,
        });

        // Add tile layer with dark filter
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          className: "map-tiles-dark",
        }).addTo(map);

        // Add CSS for dark overlay on tiles and z-index fix
        const style = document.createElement("style");
        style.textContent = `
          .map-tiles-dark {
            filter: brightness(0.6) contrast(1.1) saturate(0.8);
          }
          .leaflet-container,
          .leaflet-control-container,
          .leaflet-control-zoom {
            z-index: 10 !important;
          }
          .leaflet-pane {
            z-index: 10 !important;
          }
          @keyframes ping {
            75%, 100% {
              transform: scale(3);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);

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
            `,
            className: "",
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });
        };

        // Add real park markers from database
        if (markers && markers.length > 0) {
          // Draw connecting lines between parks for visual effect
          if (markers.length > 1) {
            const lineCoordinates: [number, number][] = markers
              .slice(0, Math.min(7, markers.length))
              .map((m) => m.position);
            const lineCoordinates2: [number, number][] = markers
              .slice(Math.max(0, markers.length - 5), markers.length)
              .map((m) => m.position);

            if (lineCoordinates.length > 1) {
              L.polyline(lineCoordinates, {
                color: "#10b981",
                weight: 3,
                opacity: 0.7,
                dashArray: "10, 10",
                smoothFactor: 1,
              }).addTo(map);
            }

            if (lineCoordinates2.length > 1) {
              L.polyline(lineCoordinates2, {
                color: "#34d399",
                weight: 3,
                opacity: 0.6,
                dashArray: "10, 10",
                smoothFactor: 1,
              }).addTo(map);
            }
          }

          // Add markers for each park with custom icons
          markers.forEach((marker) => {
            const leafletMarker = L.marker(marker.position, {
              icon: createCustomIcon(),
            }).addTo(map);

            if (marker.popup) {
              leafletMarker.bindPopup(marker.popup);
            }
          });
        }

        mapInstanceRef.current = map;
        console.log("Map initialized successfully with connected markers");
      } catch (error) {
        console.error("Error initializing map:", error);
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
        console.log("Cleaning up map...");
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (error) {
          console.error("Error cleaning up map:", error);
        }
      }

      // Clean up container
      if (mapRef.current) {
        delete (mapRef.current as any)._leaflet_id;
        mapRef.current.innerHTML = "";
      }
    };
  }, []); // Empty deps - only initialize once

  // Update markers when they change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const updateMarkers = async () => {
      try {
        const L = (await import("leaflet")).default;

        // Clear existing markers (if we want to update)
        // For now, we'll just keep the initial markers
        console.log("Markers updated");
      } catch (error) {
        console.error("Error updating markers:", error);
      }
    };

    updateMarkers();
  }, [markers]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div
        ref={mapRef}
        style={{ height, width: "100%", position: "relative", zIndex: 1 }}
        className="rounded-2xl overflow-hidden border border-emerald-100"
      />
    </>
  );
}
