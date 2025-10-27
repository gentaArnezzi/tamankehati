# 🗺️ Interactive Maps

Comprehensive guide to the interactive mapping features in Taman Kehati.

## Overview

The Taman Kehati interactive mapping system provides geospatial visualization and analysis capabilities for biodiversity data. Built with Leaflet and React-Leaflet, it offers real-time mapping, species location tracking, and spatial data analysis.

## Map Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Map Component Layer                      │
│                 (React-Leaflet Components)                  │
├─────────────────────────────────────────────────────────────┤
│                    Leaflet Layer                            │
│                 (Map Rendering Engine)                      │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                               │
│              (Geospatial Data & APIs)                       │
├─────────────────────────────────────────────────────────────┤
│                    Base Layer                               │
│                 (Tile Servers & Basemaps)                   │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### Interactive Map Component
```typescript
// src/components/features/maps/interactive-map.tsx
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { useEffect, useState } from 'react';
import { Park, Flora, Fauna } from '@/types';
import { MapMarker } from './map-marker';
import { MapPopup } from './map-popup';
import { MapControls } from './map-controls';

interface InteractiveMapProps {
  parks?: Park[];
  flora?: Flora[];
  fauna?: Fauna[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (item: any) => void;
  onMapClick?: (latlng: [number, number]) => void;
  className?: string;
}

export function InteractiveMap({
  parks = [],
  flora = [],
  fauna = [],
  center = [-6.2088, 106.8456], // Default to Jakarta
  zoom = 10,
  onMarkerClick,
  onMapClick,
  className
}: InteractiveMapProps) {
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Calculate bounds to fit all markers
  const calculateBounds = () => {
    const allItems = [...parks, ...flora, ...fauna];
    if (allItems.length === 0) return null;

    const lats = allItems.map(item => item.coordinates?.coordinates[1]).filter(Boolean);
    const lngs = allItems.map(item => item.coordinates?.coordinates[0]).filter(Boolean);

    if (lats.length === 0 || lngs.length === 0) return null;

    return new LatLngBounds(
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    );
  };

  const bounds = calculateBounds();

  return (
    <div className={`w-full h-full ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        bounds={bounds || undefined}
        boundsOptions={{ padding: [20, 20] }}
        className="h-full w-full"
        whenCreated={(map) => {
          setMapBounds(map.getBounds());
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Park Markers */}
        {parks.map((park) => (
          <Marker
            key={`park-${park.id}`}
            position={[park.coordinates.coordinates[1], park.coordinates.coordinates[0]]}
            icon={new Icon({
              iconUrl: '/icons/park-marker.png',
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32]
            })}
            eventHandlers={{
              click: () => {
                setSelectedItem(park);
                onMarkerClick?.(park);
              }
            }}
          >
            <Popup>
              <MapPopup type="park" data={park} />
            </Popup>
          </Marker>
        ))}

        {/* Flora Markers */}
        {flora.map((item) => (
          <Marker
            key={`flora-${item.id}`}
            position={[item.coordinates.coordinates[1], item.coordinates.coordinates[0]]}
            icon={new Icon({
              iconUrl: '/icons/flora-marker.png',
              iconSize: [24, 24],
              iconAnchor: [12, 24],
              popupAnchor: [0, -24]
            })}
            eventHandlers={{
              click: () => {
                setSelectedItem(item);
                onMarkerClick?.(item);
              }
            }}
          >
            <Popup>
              <MapPopup type="flora" data={item} />
            </Popup>
          </Marker>
        ))}

        {/* Fauna Markers */}
        {fauna.map((item) => (
          <Marker
            key={`fauna-${item.id}`}
            position={[item.coordinates.coordinates[1], item.coordinates.coordinates[0]]}
            icon={new Icon({
              iconUrl: '/icons/fauna-marker.png',
              iconSize: [24, 24],
              iconAnchor: [12, 24],
              popupAnchor: [0, -24]
            })}
            eventHandlers={{
              click: () => {
                setSelectedItem(item);
                onMarkerClick?.(item);
              }
            }}
          >
            <Popup>
              <MapPopup type="fauna" data={item} />
            </Popup>
          </Marker>
        ))}

        <MapControls
          onBoundsChange={setMapBounds}
          onMapClick={onMapClick}
        />
      </MapContainer>
    </div>
  );
}
```

### Map Marker Component
```typescript
// src/components/features/maps/map-marker.tsx
import { Marker, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useEffect } from 'react';

interface MapMarkerProps {
  position: [number, number];
  type: 'park' | 'flora' | 'fauna';
  data: any;
  onClick?: (data: any) => void;
  isSelected?: boolean;
}

export function MapMarker({ 
  position, 
  type, 
  data, 
  onClick, 
  isSelected = false 
}: MapMarkerProps) {
  const map = useMap();

  const getIcon = () => {
    const baseSize = isSelected ? 40 : 32;
    const iconUrl = `/icons/${type}-marker${isSelected ? '-selected' : ''}.png`;
    
    return new Icon({
      iconUrl,
      iconSize: [baseSize, baseSize],
      iconAnchor: [baseSize / 2, baseSize],
      popupAnchor: [0, -baseSize]
    });
  };

  useEffect(() => {
    if (isSelected) {
      map.setView(position, map.getZoom());
    }
  }, [isSelected, position, map]);

  return (
    <Marker
      position={position}
      icon={getIcon()}
      eventHandlers={{
        click: () => onClick?.(data)
      }}
    />
  );
}
```

### Map Popup Component
```typescript
// src/components/features/maps/map-popup.tsx
import { Park, Flora, Fauna } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Eye } from 'lucide-react';

interface MapPopupProps {
  type: 'park' | 'flora' | 'fauna';
  data: Park | Flora | Fauna;
  onViewDetails?: (data: any) => void;
}

export function MapPopup({ type, data, onViewDetails }: MapPopupProps) {
  const renderParkPopup = (park: Park) => (
    <div className="p-2 min-w-[200px]">
      <h3 className="font-semibold text-lg mb-2">{park.name}</h3>
      {park.description && (
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {park.description}
        </p>
      )}
      <div className="space-y-1 mb-3">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{park.location}</span>
        </div>
        {park.area_hectares && (
          <div className="text-sm text-gray-600">
            Area: {park.area_hectares} hectares
          </div>
        )}
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Created {new Date(park.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Badge variant={park.status === 'active' ? 'default' : 'secondary'}>
          {park.status}
        </Badge>
        {onViewDetails && (
          <Button size="sm" onClick={() => onViewDetails(park)}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        )}
      </div>
    </div>
  );

  const renderFloraPopup = (flora: Flora) => (
    <div className="p-2 min-w-[200px]">
      <h3 className="font-semibold text-lg mb-2">{flora.common_name}</h3>
      {flora.scientific_name && (
        <p className="text-sm text-gray-600 mb-2 italic">
          {flora.scientific_name}
        </p>
      )}
      {flora.description && (
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {flora.description}
        </p>
      )}
      <div className="space-y-1 mb-3">
        {flora.family && (
          <div className="text-sm text-gray-600">
            Family: {flora.family}
          </div>
        )}
        {flora.conservation_status && (
          <Badge variant="outline" className="text-xs">
            {flora.conservation_status}
          </Badge>
        )}
      </div>
      {onViewDetails && (
        <Button size="sm" onClick={() => onViewDetails(flora)}>
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </Button>
      )}
    </div>
  );

  const renderFaunaPopup = (fauna: Fauna) => (
    <div className="p-2 min-w-[200px]">
      <h3 className="font-semibold text-lg mb-2">{fauna.common_name}</h3>
      {fauna.scientific_name && (
        <p className="text-sm text-gray-600 mb-2 italic">
          {fauna.scientific_name}
        </p>
      )}
      {fauna.description && (
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {fauna.description}
        </p>
      )}
      <div className="space-y-1 mb-3">
        {fauna.family && (
          <div className="text-sm text-gray-600">
            Family: {fauna.family}
          </div>
        )}
        {fauna.diet_type && (
          <div className="text-sm text-gray-600">
            Diet: {fauna.diet_type}
          </div>
        )}
        {fauna.conservation_status && (
          <Badge variant="outline" className="text-xs">
            {fauna.conservation_status}
          </Badge>
        )}
      </div>
      {onViewDetails && (
        <Button size="sm" onClick={() => onViewDetails(fauna)}>
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </Button>
      )}
    </div>
  );

  switch (type) {
    case 'park':
      return renderParkPopup(data as Park);
    case 'flora':
      return renderFloraPopup(data as Flora);
    case 'fauna':
      return renderFaunaPopup(data as Fauna);
    default:
      return null;
  }
}
```

### Map Controls Component
```typescript
// src/components/features/maps/map-controls.tsx
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { LatLngBounds } from 'leaflet';

interface MapControlsProps {
  onBoundsChange?: (bounds: LatLngBounds) => void;
  onMapClick?: (latlng: [number, number]) => void;
}

export function MapControls({ onBoundsChange, onMapClick }: MapControlsProps) {
  const map = useMap();

  useEffect(() => {
    const handleMoveEnd = () => {
      onBoundsChange?.(map.getBounds());
    };

    const handleClick = (e: any) => {
      const { lat, lng } = e.latlng;
      onMapClick?.([lat, lng]);
    };

    map.on('moveend', handleMoveEnd);
    map.on('click', handleClick);

    return () => {
      map.off('moveend', handleMoveEnd);
      map.off('click', handleClick);
    };
  }, [map, onBoundsChange, onMapClick]);

  return null;
}
```

## Map Features

### 1. Park Management Map
```typescript
// src/components/features/parks/park-map.tsx
import { useState, useEffect } from 'react';
import { InteractiveMap } from '../maps/interactive-map';
import { Park } from '@/types/park';
import { useParks } from '@/hooks/use-parks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';

interface ParkMapProps {
  onParkSelect?: (park: Park) => void;
  onCreatePark?: () => void;
}

export function ParkMap({ onParkSelect, onCreatePark }: ParkMapProps) {
  const { data: parks, isLoading } = useParks();
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-6.2088, 106.8456]);

  const handleParkClick = (park: Park) => {
    setSelectedPark(park);
    onParkSelect?.(park);
  };

  const handleMapClick = (latlng: [number, number]) => {
    setMapCenter(latlng);
    onCreatePark?.();
  };

  if (isLoading) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-96">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Parks Map</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
          {onCreatePark && (
            <Button size="sm" onClick={onCreatePark}>
              <Plus className="h-4 w-4 mr-1" />
              Add Park
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <InteractiveMap
          parks={parks || []}
          center={mapCenter}
          zoom={10}
          onMarkerClick={handleParkClick}
          onMapClick={handleMapClick}
          className="h-80"
        />
      </CardContent>
    </Card>
  );
}
```

### 2. Species Distribution Map
```typescript
// src/components/features/maps/species-distribution-map.tsx
import { useState, useEffect } from 'react';
import { InteractiveMap } from './interactive-map';
import { Flora, Fauna } from '@/types';
import { useFlora } from '@/hooks/use-flora';
import { useFauna } from '@/hooks/use-fauna';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface SpeciesDistributionMapProps {
  parkId?: number;
  onSpeciesSelect?: (species: Flora | Fauna) => void;
}

export function SpeciesDistributionMap({ 
  parkId, 
  onSpeciesSelect 
}: SpeciesDistributionMapProps) {
  const [speciesType, setSpeciesType] = useState<'flora' | 'fauna' | 'both'>('both');
  const [selectedSpecies, setSelectedSpecies] = useState<Flora | Fauna | null>(null);

  const { data: flora } = useFlora({ parkId });
  const { data: fauna } = useFauna({ parkId });

  const handleSpeciesClick = (species: Flora | Fauna) => {
    setSelectedSpecies(species);
    onSpeciesSelect?.(species);
  };

  const getFilteredData = () => {
    switch (speciesType) {
      case 'flora':
        return { flora: flora || [], fauna: [] };
      case 'fauna':
        return { flora: [], fauna: fauna || [] };
      case 'both':
      default:
        return { flora: flora || [], fauna: fauna || [] };
    }
  };

  const { flora: filteredFlora, fauna: filteredFauna } = getFilteredData();

  return (
    <Card className="h-96">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Species Distribution</CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={speciesType} onValueChange={(value: any) => setSpeciesType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="both">Both</SelectItem>
              <SelectItem value="flora">Flora</SelectItem>
              <SelectItem value="fauna">Fauna</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex space-x-1">
            <Badge variant="outline" className="text-xs">
              {filteredFlora.length} Flora
            </Badge>
            <Badge variant="outline" className="text-xs">
              {filteredFauna.length} Fauna
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <InteractiveMap
          flora={filteredFlora}
          fauna={filteredFauna}
          center={[-6.2088, 106.8456]}
          zoom={10}
          onMarkerClick={handleSpeciesClick}
          className="h-80"
        />
      </CardContent>
    </Card>
  );
}
```

### 3. Activity Tracking Map
```typescript
// src/components/features/maps/activity-tracking-map.tsx
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Activity } from '@/types/activity';
import { useActivities } from '@/hooks/use-activities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';

interface ActivityTrackingMapProps {
  parkId?: number;
  onActivitySelect?: (activity: Activity) => void;
}

export function ActivityTrackingMap({ 
  parkId, 
  onActivitySelect 
}: ActivityTrackingMapProps) {
  const { data: activities } = useActivities({ parkId });
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    onActivitySelect?.(activity);
  };

  const getActivityIcon = (activity: Activity) => {
    const color = activity.status === 'completed' ? 'green' : 
                  activity.status === 'ongoing' ? 'blue' : 'gray';
    return `/icons/activity-${color}.png`;
  };

  return (
    <Card className="h-96">
      <CardHeader>
        <CardTitle>Activity Tracking</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <MapContainer
          center={[-6.2088, 106.8456]}
          zoom={10}
          className="h-80 w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {activities?.map((activity) => (
            <Marker
              key={activity.id}
              position={[activity.coordinates.coordinates[1], activity.coordinates.coordinates[0]]}
              icon={new Icon({
                iconUrl: getActivityIcon(activity),
                iconSize: [24, 24],
                iconAnchor: [12, 24],
                popupAnchor: [0, -24]
              })}
              eventHandlers={{
                click: () => handleActivityClick(activity)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-lg mb-2">{activity.title}</h3>
                  {activity.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {activity.description}
                    </p>
                  )}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(activity.start_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(activity.start_date).toLocaleTimeString()}
                      </span>
                    </div>
                    {activity.assigned_to && (
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-1" />
                        <span>Assigned to user</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={
                      activity.status === 'completed' ? 'default' :
                      activity.status === 'ongoing' ? 'secondary' : 'outline'
                    }>
                      {activity.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {activity.activity_type}
                    </Badge>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </CardContent>
    </Card>
  );
}
```

## Map Configuration

### Map Settings
```typescript
// src/lib/map-config.ts
export const mapConfig = {
  defaultCenter: [-6.2088, 106.8456] as [number, number], // Jakarta
  defaultZoom: 10,
  minZoom: 3,
  maxZoom: 18,
  
  tileLayers: {
    openstreetmap: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
    },
    terrain: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://opentopomap.org/">OpenTopoMap</a>'
    }
  },
  
  markers: {
    park: {
      iconUrl: '/icons/park-marker.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    },
    flora: {
      iconUrl: '/icons/flora-marker.png',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    },
    fauna: {
      iconUrl: '/icons/fauna-marker.png',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    },
    activity: {
      iconUrl: '/icons/activity-marker.png',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    }
  }
};
```

### Map Hooks
```typescript
// src/hooks/use-map.ts
import { useState, useCallback } from 'react';
import { LatLngBounds } from 'leaflet';

export function useMap() {
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  const [center, setCenter] = useState<[number, number]>([-6.2088, 106.8456]);
  const [zoom, setZoom] = useState(10);

  const handleBoundsChange = useCallback((newBounds: LatLngBounds) => {
    setBounds(newBounds);
  }, []);

  const handleCenterChange = useCallback((newCenter: [number, number]) => {
    setCenter(newCenter);
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  return {
    bounds,
    center,
    zoom,
    handleBoundsChange,
    handleCenterChange,
    handleZoomChange,
  };
}
```

## Performance Optimization

### Map Clustering
```typescript
// src/components/features/maps/map-clustering.tsx
import { MarkerClusterGroup } from 'react-leaflet-cluster';
import { Marker } from 'react-leaflet';

interface MapClusteringProps {
  markers: Array<{
    id: string;
    position: [number, number];
    data: any;
    type: 'park' | 'flora' | 'fauna';
  }>;
  onMarkerClick?: (data: any) => void;
}

export function MapClustering({ markers, onMarkerClick }: MapClusteringProps) {
  return (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={50}
      spiderfyOnMaxZoom={true}
      showCoverageOnHover={false}
      zoomToBoundsOnClick={true}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          eventHandlers={{
            click: () => onMarkerClick?.(marker.data)
          }}
        />
      ))}
    </MarkerClusterGroup>
  );
}
```

### Lazy Loading
```typescript
// src/components/features/maps/lazy-map.tsx
import { lazy, Suspense } from 'react';
import { Loading } from '@/components/common/loading';

const InteractiveMap = lazy(() => import('./interactive-map'));

interface LazyMapProps {
  // ... props
}

export function LazyMap(props: LazyMapProps) {
  return (
    <Suspense fallback={<Loading text="Loading map..." />}>
      <InteractiveMap {...props} />
    </Suspense>
  );
}
```

## Related Documentation

- [Frontend Components](../development/frontend-components.md)
- [API Documentation](../development/api-docs.md)
- [Park Management](../features/park-management.md)
- [Flora & Fauna Detection](../ai/flora-fauna-detection.md)
