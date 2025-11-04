# Rebuild Frontend untuk Fix API URL Connection

## Masalah
Frontend masih menggunakan `localhost:8000` karena `NEXT_PUBLIC_API_URL` adalah build-time variable dan image yang di-pull di server masih versi lama.

## Solusi: Rebuild Frontend dengan API URL yang Benar

### 1. Rebuild dan Push Image Baru

```bash
# Set environment variables
export DOCKER_USERNAME=arnezzi
export IMAGE_TAG=v1.0.5  # Increment version
export NEXT_PUBLIC_API_URL=http://38.47.93.167:8080

# Build dan push
./scripts/build-and-push-images.sh
```

**Atau tanpa export NEXT_PUBLIC_API_URL** (script sudah punya default):
```bash
export DOCKER_USERNAME=arnezzi
export IMAGE_TAG=v1.0.5
./scripts/build-and-push-images.sh
```

### 2. Pull Image Baru di Server

```bash
# SSH ke server
ssh ubuntu@38.47.93.167

# Masuk ke directory
cd ~/dasmap_prod/apps/tamankehati

# Pull image baru
docker compose -f docker-compose.pull.no-nginx.yml pull frontend

# Restart frontend container
docker compose -f docker-compose.pull.no-nginx.yml up -d frontend

# Verify
docker compose -f docker-compose.pull.no-nginx.yml logs frontend --tail=50
```

### 3. Verify API URL di Container

```bash
# Check environment variable di container
docker exec tamankehati-frontend-prod env | grep NEXT_PUBLIC_API_URL

# Should show:
# NEXT_PUBLIC_API_URL=http://38.47.93.167:8080
```

### 4. Test Frontend

Buka browser dan cek console:
- Seharusnya tidak ada `ERR_CONNECTION_REFUSED` ke `localhost:8000`
- Semua request harus ke `http://38.47.93.167:8080`

## Catatan Penting

- `NEXT_PUBLIC_API_URL` adalah **build-time variable**, bukan runtime
- Setelah build, nilai ini sudah "baked" ke dalam bundle JavaScript
- **Tidak bisa** diubah dengan environment variable di runtime
- Harus rebuild image untuk mengubah API URL

## Troubleshooting

Jika masih error setelah rebuild:

1. **Clear browser cache** - Hard refresh (Ctrl+Shift+R)
2. **Check Docker image tag** - Pastikan image yang di-pull adalah versi terbaru
3. **Check container logs** - `docker logs tamankehati-frontend-prod --tail=100`
4. **Verify build args** - Pastikan `--build-arg NEXT_PUBLIC_API_URL` di-set saat build
