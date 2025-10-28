# 🗺️ Nominatim (OpenStreetMap) - Geocoding GRATIS 100%

## ✅ Fitur Pencarian Lokasi

Map pencarian lokasi sekarang menggunakan **Nominatim API** dari OpenStreetMap - **100% GRATIS, TANPA API KEY!**

### Features:
- ✅ **Autocomplete Search** - Pencarian lokasi real-time
- ✅ **Gratis 100%** - Tidak perlu API key atau kartu kredit
- ✅ **Filter Indonesia** - Hasil pencarian terfokus di Indonesia
- ✅ **Data OpenStreetMap** - Database komunitas global yang lengkap
- ✅ **Konsisten** - Peta dan pencarian sama-sama menggunakan OpenStreetMap

---

## 🎯 Keunggulan Nominatim vs Google Maps

| Feature | Nominatim (OSM) | Google Maps |
|---------|----------------|-------------|
| **Harga** | 🟢 Gratis 100% | 🟡 $200/bulan free tier |
| **API Key** | 🟢 Tidak perlu | 🔴 Wajib |
| **Kartu Kredit** | 🟢 Tidak perlu | 🔴 Diperlukan untuk verifikasi |
| **Setup** | 🟢 Langsung jalan | 🟡 Perlu konfigurasi |
| **Data Source** | OpenStreetMap | Google |
| **Konsistensi** | 🟢 Sama dengan map | 🟡 Berbeda dengan map |

---

## 📋 Cara Pakai (Super Simple!)

### Tidak Ada Setup!
Nominatim sudah terintegrasi dan **langsung bisa dipakai** tanpa konfigurasi apapun.

### Testing:

1. **Buka Form Taman**
   ```
   http://localhost:3000/dashboard/taman
   ```

2. **Klik "Tambah Taman"**

3. **Test Search**
   - Ketik: **"Taman Suropati Jakarta"**
   - ✅ Lihat dropdown muncul dengan hasil pencarian
   - Pilih salah satu → Map auto-zoom ke lokasi

4. **Test Manual Click**
   - Klik di map → Marker muncul
   - ✅ Koordinat ditampilkan

5. **Test GPS**
   - Klik: **"Gunakan Lokasi Saat Ini"**
   - Allow permission
   - ✅ Map zoom ke lokasi Anda

6. **Save Koordinat**
   - Klik: **"Simpan Koordinat"**
   - ✅ Toast: "✅ Koordinat berhasil disimpan!"

---

## 🌍 Tentang Nominatim

**Nominatim** adalah layanan geocoding gratis dari OpenStreetMap Foundation.

### API Endpoint:
```
https://nominatim.openstreetmap.org/search
```

### Parameters yang Digunakan:
- `q` - Query pencarian (contoh: "Jakarta")
- `format=json` - Format response
- `addressdetails=1` - Include detail alamat
- `limit=5` - Maksimal 5 hasil
- `countrycodes=id` - Hanya Indonesia
- `accept-language=id` - Bahasa Indonesia

### Example Response:
```json
[
  {
    "place_id": 123456,
    "display_name": "Taman Suropati, Jakarta Pusat, DKI Jakarta, Indonesia",
    "lat": "-6.1876719",
    "lon": "106.8347227",
    "type": "park"
  }
]
```

---

## 📊 Usage Limits

### Fair Use Policy:
- **Rate Limit**: 1 request per second
- **Bulk requests**: Gunakan delay 500ms (sudah diimplementasikan)
- **User-Agent**: Wajib (sudah diset: `TamanKehati/1.0`)

### Best Practices (Sudah Diterapkan):
- ✅ Debounce 500ms - Menghindari spam requests
- ✅ User-Agent header - Identifikasi aplikasi
- ✅ Country restriction - Filter hanya Indonesia
- ✅ Limit 5 results - Tidak berlebihan

**Note**: Untuk production dengan traffic tinggi (>1 juta requests/hari), pertimbangkan self-host Nominatim server.

---

## 🔧 Technical Implementation

### Component:
```tsx
apps/frontend/src/components/ui/interactive-map-wrapper.tsx
```

### Search Logic:
```typescript
// Debounced search with Nominatim API
const response = await fetch(
  `https://nominatim.openstreetmap.org/search?` +
  `q=${encodeURIComponent(searchQuery)}` +
  `&format=json` +
  `&addressdetails=1` +
  `&limit=5` +
  `&countrycodes=id` +
  `&accept-language=id`,
  {
    headers: {
      'User-Agent': 'TamanKehati/1.0',
    },
  }
);
```

---

## 🐛 Troubleshooting

### Pencarian tidak mengembalikan hasil
**Kemungkinan Penyebab**:
- Query terlalu umum (contoh: hanya "Taman")
- Lokasi tidak ada di OpenStreetMap

**Fix**: 
- Gunakan query lebih spesifik: "Taman Suropati Jakarta"
- Coba variasi nama: "Suropati Park"
- Fallback: Gunakan GPS atau klik manual di map

### Network Error
**Fix**: 
- Cek koneksi internet
- Nominatim server mungkin sedang down (jarang terjadi)
- Fallback: Gunakan GPS atau klik manual di map

### Rate Limit Error
**Fix**: 
- Debounce sudah diimplementasikan (500ms)
- Jangan spam typing terlalu cepat
- Wait beberapa detik jika terkena limit

---

## 📚 Resources

- [Nominatim Documentation](https://nominatim.org/release-docs/latest/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)

---

## 🎉 Kesimpulan

Dengan Nominatim, Anda mendapatkan:
- ✅ **Gratis selamanya** - Tidak ada biaya tersembunyi
- ✅ **No setup required** - Langsung jalan
- ✅ **Konsisten** - Peta dan pencarian sama-sama OSM
- ✅ **Privacy-friendly** - Tidak tracking seperti Google
- ✅ **Open source** - Data komunitas global

**Perfect untuk aplikasi Taman Kehati!** 🌿

