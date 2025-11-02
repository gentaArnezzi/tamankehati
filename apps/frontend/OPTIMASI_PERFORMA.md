# Optimasi Performa Frontend - Data Fetching

Dokumen ini menjelaskan optimasi data fetching yang telah diterapkan untuk meningkatkan performa dan kecepatan navigasi antar halaman.

## ✅ Optimasi yang Telah Diterapkan

### 1. React Query Integration
- ✅ Centralized API client dengan React Query hooks
- ✅ Automatic caching dengan stale time yang optimal
- ✅ Background refetch untuk data fresh
- ✅ Type-safe query keys untuk cache management

### 2. Cache Configuration
- **staleTime**: 5 menit (default) - data dianggap fresh selama 5 menit
- **gcTime**: 15 menit (default) - data disimpan di cache selama 15 menit
- **refetchOnWindowFocus**: false - tidak refetch otomatis saat window focus
- **refetchOnReconnect**: true - refetch saat reconnect untuk data fresh
- **refetchOnMount**: true - refetch saat mount jika data stale

### 3. Prefetching
- ✅ PrefetchLink component untuk prefetch saat hover
- ✅ Prefetch functions untuk manual prefetch
- ✅ Automatic prefetch untuk navigasi cepat

### 4. Halaman yang Sudah Dioptimasi
- ✅ Dashboard Comprehensive Simple (`/dashboard/comprehensive-simple`)
- ✅ News Page (`NewsPage` component)
- ✅ Halaman lainnya dapat menggunakan hooks yang sama

## 📊 Performa

### Sebelum Optimasi
- Setiap navigasi melakukan fetch baru
- Tidak ada caching, data di-fetch ulang setiap kali
- Loading state manual untuk setiap halaman
- Tidak ada prefetching

### Setelah Optimasi
- ✅ Data di-cache dan reuse saat navigasi
- ✅ Instant load dari cache jika data masih fresh
- ✅ Background refetch untuk data terbaru
- ✅ Prefetch saat hover untuk instant navigation
- ✅ Loading state terintegrasi dengan React Query

## 🚀 Cara Menggunakan

### Untuk Developer Baru

#### 1. Menggunakan Hooks yang Tersedia

```typescript
import { useFloraList, useFloraDetail } from "@/lib/api/queries";

// List page
function FloraPage() {
  const { data, isLoading } = useFloraList({
    limit: 20,
    offset: 0,
    search: "query",
  });
  
  const flora = data?.items || [];
  const total = data?.total || 0;
  
  if (isLoading) return <Loading />;
  
  return <FloraList flora={flora} total={total} />;
}

// Detail page
function FloraDetailPage({ id }: { id: string }) {
  const { data: flora, isLoading } = useFloraDetail(id);
  
  if (isLoading) return <Loading />;
  if (!flora) return <NotFound />;
  
  return <FloraDetail flora={flora} />;
}
```

#### 2. Menggunakan PrefetchLink

```typescript
import { PrefetchLink } from "@/components/ui/prefetch-link";

<PrefetchLink
  href="/flora/123"
  prefetchType="flora"
  prefetchId="123"
>
  Lihat Detail Flora
</PrefetchLink>
```

#### 3. Manual Prefetch

```typescript
import { useQueryClient } from "@tanstack/react-query";
import { prefetch } from "@/lib/api/prefetch";

function MyComponent() {
  const queryClient = useQueryClient();
  
  const handleHover = () => {
    prefetch.floraDetail(queryClient, "123");
  };
  
  return <div onMouseEnter={handleHover}>Hover untuk prefetch</div>;
}
```

## 📝 Migration Guide

### Mengubah Page dari Fetch Manual ke React Query

#### Before:
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    const response = await fetch('/api/v1/news/');
    const data = await response.json();
    setData(data);
    setLoading(false);
  };
  fetchData();
}, []);
```

#### After:
```typescript
const { data, isLoading: loading } = useNewsList();
```

### Mengubah Component dengan Filters

#### Before:
```typescript
const [searchQuery, setSearchQuery] = useState("");
const [data, setData] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    const params = new URLSearchParams({ q: searchQuery });
    const response = await fetch(`/api/v1/news/?${params}`);
    const data = await response.json();
    setData(data);
  };
  fetchData();
}, [searchQuery]);
```

#### After:
```typescript
const [searchQuery, setSearchQuery] = useState("");
const { data } = useNewsList({ q: searchQuery });
```

## 🎯 Best Practices

### 1. Gunakan Hooks yang Tersedia
Jangan membuat fetch manual jika sudah ada hook yang sesuai. Gunakan hooks dari `@/lib/api/queries`.

### 2. Prefetch untuk Navigasi Penting
Gunakan `PrefetchLink` atau prefetch functions untuk halaman yang sering diakses.

### 3. Override Cache Settings Jika Perlu
```typescript
// Untuk data yang berubah sering
useNewsList(params, {
  staleTime: 1 * 60 * 1000, // 1 menit
});

// Untuk data yang jarang berubah
useFloraDetail(id, {
  staleTime: 30 * 60 * 1000, // 30 menit
});
```

### 4. Invalidasi Cache Setelah Mutation
```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queries";

const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: createNews,
  onSuccess: () => {
    // Invalidate news list cache
    queryClient.invalidateQueries({ queryKey: queryKeys.news.all });
  },
});
```

## 📚 Dokumentasi Lengkap

Lihat file `apps/frontend/src/lib/api/README.md` untuk dokumentasi lengkap tentang semua hooks yang tersedia.

## 🔄 Hooks yang Tersedia

### Dashboard
- `useDashboardComprehensive(timeRange, options?)`
- `useDashboardModern(timeRange, options?)`

### News
- `useNewsList(params?, options?)`
- `useNewsDetail(id, options?)`

### Flora
- `useFloraList(params?, options?)`
- `useFloraDetail(id, options?)`

### Fauna
- `useFaunaList(params?, options?)`
- `useFaunaDetail(id, options?)`

### Gallery
- `useGalleryList(params?, options?)`
- `useGalleryDetail(id, options?)`

### Articles
- `useArticlesList(params?, options?)`
- `useArticleDetail(slug, options?)`

### Taman/Parks
- `useTamanList(params?, options?)`
- `useTamanDetail(id, options?)`

### Stats
- `usePublicStats(options?)`
- `useParkStats(parkId, options?)`

### Announcements
- `useAnnouncementsList(params?, options?)`
- `useAnnouncementDetail(id, options?)`

## 🐛 Troubleshooting

### Data tidak ter-update
- Pastikan query key sesuai dengan data yang ingin di-cache
- Cek staleTime - jika terlalu lama, data mungkin tidak refetch

### Loading state tidak muncul
- Pastikan menggunakan `isLoading` dari React Query, bukan state manual
- Cek apakah query enabled

### Error handling
- React Query sudah handle error otomatis
- Cek `error` dari hook untuk error message

## 🎉 Hasil Optimasi

Setelah optimasi ini:
- ✅ Navigasi antar halaman lebih cepat (dari cache)
- ✅ Loading lebih cepat karena prefetching
- ✅ Lebih sedikit request ke API
- ✅ UX lebih baik dengan background refetch
- ✅ Code lebih clean dan maintainable

