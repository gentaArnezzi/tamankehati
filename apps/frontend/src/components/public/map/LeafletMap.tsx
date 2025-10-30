"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import type { FeatureCollection } from "geojson";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L, { type LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "../../ui/utils";

type MarkerData = {
  id: string;
  position: [number, number];
  title: string;
  description?: string;
  url?: string;
};

type LeafletMapProps = {
  className?: string;
  height?: string;
  center?: [number, number];
  zoom?: number;
  scrollWheelZoom?: boolean;
  markers?: MarkerData[];
  geojson?: FeatureCollection | null;
  bounds?: LatLngBoundsExpression;
  showControls?: boolean;
  ariaLabel?: string;
};

type ClusterGroup = {
  id: string;
  position: [number, number];
  markers: MarkerData[];
};

const INDONESIA_CENTER: [number, number] = [-2.5489, 118.0149];

const markerIconAssets = {
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
};

if (typeof window !== "undefined") {
  const defaultIcon = L.Icon.Default.prototype as unknown as {
    _getIconUrl?: unknown;
  };
  if (defaultIcon._getIconUrl) {
    delete defaultIcon._getIconUrl;
  }
  L.Icon.Default.mergeOptions(markerIconAssets);
}

function FitBounds({ bounds }: { bounds?: LatLngBoundsExpression }) {
  const map = useMap();

  useEffect(() => {
    if (!bounds) return;
    map.fitBounds(bounds, { padding: [24, 24] });
  }, [bounds, map]);

  return null;
}

const clusterPrecision = 1; // decimal degrees ~11km

const createClusterIcon = (count: number) =>
  L.divIcon({
    html: `<div style="
      background:#166534;
      color:white;
      border-radius:9999px;
      font-weight:600;
      display:flex;
      align-items:center;
      justify-content:center;
      width:40px;
      height:40px;
      border:2px solid rgba(255,255,255,0.9);
      box-shadow:0 6px 14px rgba(15,23,42,0.2);
    ">${count}</div>`,
    className: "",
    iconSize: [40, 40],
  });

function ClusterMarker({ cluster }: { cluster: ClusterGroup }) {
  const map = useMap();
  const isCluster = cluster.markers.length > 1;

  return (
    <Marker
      position={cluster.position}
      icon={isCluster ? createClusterIcon(cluster.markers.length) : undefined}
      eventHandlers={
        isCluster
          ? {
              click: () => {
                const nextZoom = Math.min(map.getZoom() + 2, 12);
                map.flyTo(cluster.position, nextZoom, { duration: 0.5 });
              },
            }
          : undefined
      }
    >
      <Popup className="space-y-2">
        {isCluster ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-800">
              Taman terdekat
            </p>
            <ul className="space-y-1 text-xs text-slate-600">
              {cluster.markers.map((marker) => (
                <li key={marker.id}>
                  <span className="font-medium text-slate-700">
                    {marker.title}
                  </span>
                  {marker.description && (
                    <span className="block text-slate-500">
                      {marker.description}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-800">
              {cluster.markers[0]?.title}
            </p>
            {cluster.markers[0]?.description && (
              <p className="text-xs text-slate-600">
                {cluster.markers[0]?.description}
              </p>
            )}
            {cluster.markers[0]?.url && (
              <a
                href={cluster.markers[0].url}
                className="inline-flex text-xs font-semibold text-emerald-600 hover:text-emerald-500"
              >
                Buka detail
              </a>
            )}
          </div>
        )}
      </Popup>
    </Marker>
  );
}

export function LeafletMap({
  className,
  height = "420px",
  center = INDONESIA_CENTER,
  zoom = 5,
  scrollWheelZoom = true,
  markers = [],
  geojson,
  bounds,
  showControls = false,
  ariaLabel = "Peta interaktif",
}: LeafletMapProps) {
  const [basemap, setBasemap] = useState<"default" | "satellite">("default");

  const computedBounds = useMemo<LatLngBoundsExpression | undefined>(() => {
    if (bounds) return bounds;
    if (!markers.length) return undefined;
    const lats = markers.map((marker) => marker.position[0]);
    const lngs = markers.map((marker) => marker.position[1]);
    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ];
  }, [bounds, markers]);

  const clusters = useMemo<ClusterGroup[]>(() => {
    if (!markers.length) return [];
    const grouped = new Map<string, ClusterGroup>();
    markers.forEach((marker) => {
      const key = `${marker.position[0].toFixed(clusterPrecision)}-${marker.position[1].toFixed(clusterPrecision)}`;
      const existing = grouped.get(key);
      if (existing) {
        const count = existing.markers.length;
        const avgLat =
          (existing.position[0] * count + marker.position[0]) / (count + 1);
        const avgLng =
          (existing.position[1] * count + marker.position[1]) / (count + 1);
        existing.position = [avgLat, avgLng];
        existing.markers.push(marker);
      } else {
        grouped.set(key, {
          id: key,
          position: marker.position,
          markers: [marker],
        });
      }
    });
    return Array.from(grouped.values());
  }, [markers]);

  const toggleBasemap = useCallback(() => {
    setBasemap((prev) => (prev === "default" ? "satellite" : "default"));
  }, []);

  const tileConfig =
    basemap === "satellite"
      ? {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attribution:
            '&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics',
        }
      : {
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        };

  // Memoize the MapContainer with a stable key based on essential props
  const mapContainer = useMemo(() => {
    // Create a stable key that only changes when essential map properties change
    const mapKey = `map-${center.join(",")}-${zoom}-${basemap}-${clusters.length}`;

    return (
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={scrollWheelZoom}
        style={{ height, width: "100%" }}
        aria-label={ariaLabel}
        key={mapKey} // Use stable key to prevent unnecessary remounts
      >
        <TileLayer
          key={basemap}
          attribution={tileConfig.attribution}
          url={tileConfig.url}
        />
        {computedBounds && <FitBounds bounds={computedBounds} />}
        {geojson && (
          <GeoJSON
            data={geojson}
            style={{ color: "#166534", weight: 2, fillOpacity: 0.1 }}
          />
        )}
        {clusters.map((cluster) => (
          <ClusterMarker key={cluster.id} cluster={cluster} />
        ))}
        {showControls && (
          <MapControls basemap={basemap} onToggleBasemap={toggleBasemap} />
        )}
      </MapContainer>
    );
  }, [
    center,
    zoom,
    scrollWheelZoom,
    basemap,
    tileConfig,
    computedBounds,
    geojson,
    clusters,
    showControls,
    ariaLabel,
    height,
  ]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-emerald-100 shadow-sm",
        className,
      )}
    >
      {mapContainer}
    </div>
  );
}

function MapControls({
  basemap,
  onToggleBasemap,
}: {
  basemap: "default" | "satellite";
  onToggleBasemap: () => void;
}) {
  const map = useMap();

  const handleGeolocate = () => {
    map.locate({ setView: true, maxZoom: 10 });
  };

  return (
    <div className="leaflet-top leaflet-right pointer-events-none pr-3 pt-3">
      <div className="pointer-events-auto flex flex-col gap-2">
        <button
          type="button"
          className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          onClick={handleGeolocate}
        >
          Geolokasi
        </button>
        <button
          type="button"
          className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          onClick={onToggleBasemap}
        >
          Peta: {basemap === "default" ? "Standar" : "Satelit"}
        </button>
      </div>
    </div>
  );
}
