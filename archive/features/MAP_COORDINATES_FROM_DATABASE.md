# Implementasi Koordinat Peta dari Database

## Ringkasan Perubahan

Peta di halaman "Jelajahi Taman Konservasi" sekarang menampilkan titik-titik marker berdasarkan koordinat latitude dan longitude yang diambil langsung dari database (tabel `parks`), bukan lagi menggunakan data hardcoded.

## Perubahan Backend

### File: `apps/backend/api/v1/public/parks_simple.py`

1. **Update Response Model** - Menambahkan field `latitude` dan `longitude` ke `ParkResponse`:
```python
class ParkResponse(BaseModel):
    id: int
    name: str
    slug: str
    status: str
    region_id: Optional[int] = None
    area_ha: Optional[float] = None
    description: Optional[str] = None
    gambar_utama: Optional[str] = None
    provinsi: Optional[str] = None
    latitude: Optional[float] = None      # ✨ BARU
    longitude: Optional[float] = None     # ✨ BARU
    created_at: str
    updated_at: str
```

2. **Update SQL Query** - Mengambil kolom `latitude` dan `longitude` dari database:
```sql
SELECT p.id, p.name, p.slug, p.status, p.area_ha, p.description, 
       p.created_at, p.updated_at, p.gambar_utama, p.provinsi, 
       p.latitude, p.longitude  -- ✨ BARU
FROM parks p
WHERE p.status = 'approved' AND p.deleted_at IS NULL
```

3. **Update Data Mapping** - Map hasil query ke response model:
```python
items.append(ParkResponse(
    id=row[0],
    name=row[1],
    slug=row[2],
    status=row[3],
    region_id=None,
    area_ha=float(row[4]) if row[4] else None,
    description=row[5] if row[5] else None,
    gambar_utama=row[8] if row[8] else None,
    provinsi=row[9] if row[9] else None,
    latitude=float(row[10]) if row[10] else None,   # ✨ BARU
    longitude=float(row[11]) if row[11] else None,  # ✨ BARU
    created_at=created_at_str,
    updated_at=updated_at_str
))
```

## Perubahan Frontend

### File: `apps/frontend/src/components/public/home/MinimalMapSection.tsx`

1. **Perbaikan Field Name** - Mengubah `park.nama` menjadi `park.name` dan `park.wilayah` menjadi `park.provinsi` sesuai dengan response dari API:
```tsx
markers={parks
  .filter(park => park.latitude && park.longitude)
  .map(park => ({
    position: [parseFloat(park.latitude), parseFloat(park.longitude)] as [number, number],
    popup: `<div style="text-align: center;">
      <h3 style="font-weight: 600; color: #064e3b; margin-bottom: 4px;">${park.name}</h3>
      <p style="font-size: 0.875rem; color: #475569;">${park.provinsi || ''}</p>
      <a href="/taman/${park.id}" style="display: inline-block; margin-top: 8px; color: #10b981; font-weight: 600; text-decoration: none;">Lihat Detail →</a>
    </div>`,
    key: park.id,
  }))
}
```

2. **Dynamic Region Count** - Menghitung jumlah taman per region berdasarkan data dari database:
```tsx
const getRegionCount = (regionName: string) => {
  return parks.filter((park) => {
    const provinsi = park.provinsi?.toLowerCase() || '';
    
    // Map provinces to major islands
    if (regionName === 'Sumatera') {
      return provinsi.includes('sumatera') || provinsi.includes('aceh') || 
             provinsi.includes('riau') || provinsi.includes('jambi') || 
             provinsi.includes('bengkulu') || provinsi.includes('lampung') || 
             provinsi.includes('bangka');
    }
    if (regionName === 'Jawa') {
      return provinsi.includes('jawa') || provinsi.includes('jakarta') || 
             provinsi.includes('banten') || provinsi.includes('yogyakarta');
    }
    if (regionName === 'Kalimantan') {
      return provinsi.includes('kalimantan');
    }
    if (regionName === 'Sulawesi') {
      return provinsi.includes('sulawesi') || provinsi.includes('gorontalo');
    }
    if (regionName === 'Papua') {
      return provinsi.includes('papua') || provinsi.includes('maluku');
    }
    return false;
  }).length;
};

const regions = [
  { name: 'Sumatera', parks: getRegionCount('Sumatera'), x: '20%', y: '30%' },
  { name: 'Jawa', parks: getRegionCount('Jawa'), x: '35%', y: '55%' },
  { name: 'Kalimantan', parks: getRegionCount('Kalimantan'), x: '50%', y: '40%' },
  { name: 'Sulawesi', parks: getRegionCount('Sulawesi'), x: '65%', y: '45%' },
  { name: 'Papua', parks: getRegionCount('Papua'), x: '80%', y: '50%' },
];
```

### File: `apps/frontend/src/components/public/home/MapWrapper.tsx`

**Mengganti Dummy Markers dengan Real Data** - Marker sekarang ditampilkan berdasarkan koordinat sebenarnya dari database:
```tsx
// Add real park markers from database
if (markers && markers.length > 0) {
  // Draw connecting lines between parks for visual effect
  if (markers.length > 1) {
    const lineCoordinates: [number, number][] = markers.slice(0, Math.min(7, markers.length)).map(m => m.position);
    const lineCoordinates2: [number, number][] = markers.slice(Math.max(0, markers.length - 5), markers.length).map(m => m.position);
    
    if (lineCoordinates.length > 1) {
      L.polyline(lineCoordinates, {
        color: '#10b981',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 10',
        smoothFactor: 1,
      }).addTo(map);
    }

    if (lineCoordinates2.length > 1) {
      L.polyline(lineCoordinates2, {
        color: '#34d399',
        weight: 3,
        opacity: 0.6,
        dashArray: '10, 10',
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
```

## Struktur Database

Kolom yang digunakan dari tabel `parks`:
- `latitude` (Numeric(10, 8)) - Koordinat lintang taman
- `longitude` (Numeric(11, 8)) - Koordinat bujur taman

## TypeScript Types

Type definitions sudah mendukung field `latitude` dan `longitude`:
- `TamanPublicSchema` di `apps/frontend/src/types/public.ts` (line 98-99)
- `ParkPublicSchema` menggunakan `TamanPublicSchema` untuk backward compatibility

## Cara Kerja

1. **Fetch Data**: Frontend memanggil API `/api/public/parks?limit=100` untuk mendapatkan semua taman
2. **Filter**: Hanya taman dengan `latitude` dan `longitude` yang ditampilkan di peta
3. **Render Markers**: Setiap taman ditampilkan sebagai marker hijau (emerald) dengan efek ping
4. **Popup**: Klik marker menampilkan popup dengan nama taman, provinsi, dan link ke detail
5. **Region Count**: Jumlah taman per region dihitung secara dinamis berdasarkan provinsi

## Testing

Untuk menguji fitur ini:
1. Pastikan tabel `parks` memiliki data dengan kolom `latitude` dan `longitude` yang terisi
2. Buka halaman homepage (localhost:3000)
3. Scroll ke section "Jelajahi Taman Konservasi"
4. Peta akan menampilkan marker-marker taman sesuai koordinat di database
5. Klik marker untuk melihat informasi taman

## Catatan

- Marker dengan koordinat yang sama atau sangat dekat akan ditampilkan sebagai marker terpisah (tidak di-cluster)
- Garis penghubung antar marker ditampilkan untuk efek visual (tidak merepresentasikan hubungan aktual)
- Map menggunakan OpenStreetMap tiles dengan filter dark untuk konsistensi visual
- Custom icon dengan efek ping dan glow untuk meningkatkan visibility

---

**Tanggal**: 29 Oktober 2025
**Status**: ✅ Selesai

