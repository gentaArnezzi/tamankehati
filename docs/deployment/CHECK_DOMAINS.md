# 🌐 Cek Domain yang Ada di Server

Panduan untuk mengecek domain apa saja yang sudah digunakan di server sebelum deploy Taman Kehati.

---

## 🔍 Quick Check Script

Jalankan script ini untuk cek semua domain sekaligus:

```bash
cat > ~/check_domains.sh << 'EOF'
#!/bin/bash

echo "=========================================="
echo "Domain Check pada Server"
echo "=========================================="
echo ""

echo "1. Checking Nginx Config (Host):"
if [ -d /etc/nginx/sites-enabled ]; then
  echo "  Sites-enabled:"
  sudo ls -la /etc/nginx/sites-enabled/ | grep -v "^total"
  echo ""
  echo "  Server names:"
  sudo grep -r "server_name" /etc/nginx/sites-enabled/ 2>/dev/null | grep -v "^#" | grep -v "^\s*$"
else
  echo "  Nginx tidak terinstall di host"
fi
echo ""

echo "2. Checking Nginx Config (Docker - dasmap_prod):"
if [ -d ~/dasmap_prod/apps/nginx ]; then
  echo "  Nginx directory:"
  ls -la ~/dasmap_prod/apps/nginx/ 2>/dev/null | head -10
  echo ""
  echo "  Sites-enabled:"
  ls -la ~/dasmap_prod/apps/nginx/sites-enabled/ 2>/dev/null | grep -v "^total"
  echo ""
  echo "  Server names:"
  cat ~/dasmap_prod/apps/nginx/sites-enabled/*.conf 2>/dev/null | grep "server_name" | grep -v "^#" | grep -v "^\s*$"
else
  echo "  Nginx config directory tidak ditemukan"
fi
echo ""

echo "3. Checking Docker Compose (dasmap_prod):"
if [ -f ~/dasmap_prod/docker-compose.yml ]; then
  echo "  Domain/Server name references:"
  cat ~/dasmap_prod/docker-compose.yml | grep -i "domain\|server_name\|hostname\|VIRTUAL_HOST" -A 2 | grep -v "^#" | grep -v "^\s*$"
else
  echo "  docker-compose.yml tidak ditemukan"
fi
echo ""

echo "4. Checking DNS Records (jika bisa):"
echo "  dasmap.co.id:"
dig +short dasmap.co.id 2>/dev/null || echo "    DNS check failed"
echo "  www.dasmap.co.id:"
dig +short www.dasmap.co.id 2>/dev/null || echo "    DNS check failed"
echo "  amilna.co.id:"
dig +short amilna.co.id 2>/dev/null || echo "    DNS check failed"
echo ""

echo "5. Checking Running Containers:"
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -E "go|nginx|web"
echo ""

echo "6. Checking Nginx in Docker (service go):"
GO_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i "go" | head -1)
if [ ! -z "$GO_CONTAINER" ]; then
  echo "  Container: $GO_CONTAINER"
  echo "  Server names:"
  docker exec -it $GO_CONTAINER nginx -T 2>/dev/null | grep "server_name" | grep -v "^#" | grep -v "^\s*$" | head -20
else
  echo "  Service 'go' tidak ditemukan"
fi
echo ""

echo "=========================================="
echo "Check Complete!"
echo "=========================================="
EOF

chmod +x ~/check_domains.sh
~/check_domains.sh
```

---

## 📋 Manual Check Commands

### 1. Cek Nginx Config di Host (jika Nginx terinstall di host)

```bash
# List semua config files
sudo ls -la /etc/nginx/sites-enabled/
sudo ls -la /etc/nginx/sites-available/

# Cek server blocks
sudo grep -r "server_name" /etc/nginx/sites-enabled/
sudo grep -r "server_name" /etc/nginx/conf.d/

# Cek default config
sudo cat /etc/nginx/sites-enabled/default
```

### 2. Cek Nginx Config di Docker (service go)

```bash
# Cek container name
docker ps | grep go

# Cek Nginx config di container
docker exec -it <go-container-name> nginx -T | grep "server_name"

# Atau lebih detail
docker exec -it <go-container-name> cat /etc/nginx/nginx.conf
docker exec -it <go-container-name> cat /etc/nginx/conf.d/*.conf
```

### 3. Cek Nginx Config di dasmap_prod

```bash
# Cek struktur directory
ls -la ~/dasmap_prod/apps/nginx/

# Cek sites-enabled
ls -la ~/dasmap_prod/apps/nginx/sites-enabled/

# Cek semua server blocks
cat ~/dasmap_prod/apps/nginx/sites-enabled/*.conf | grep "server_name"

# Atau lebih detail
cat ~/dasmap_prod/apps/nginx/sites-enabled/*.conf
```

### 4. Cek Domain dari Docker Compose

```bash
# Cek docker-compose.yml
cd ~/dasmap_prod
cat docker-compose.yml | grep -i "domain\|server_name\|hostname\|VIRTUAL_HOST" -A 2

# Cek environment variables
cat docker-compose.yml | grep -i "environment:" -A 20 | grep -i "domain\|host"
```

### 5. Cek DNS Records

```bash
# Cek A records
dig +short dasmap.co.id
dig +short www.dasmap.co.id
dig +short amilna.co.id
dig +short www.amilna.co.id

# Cek dengan detail
dig dasmap.co.id +short
dig amilna.co.id +short

# Atau dengan nslookup
nslookup dasmap.co.id
nslookup amilna.co.id
```

### 6. Cek Virtual Hosts Lainnya (Apache, dll)

```bash
# Cek Apache (jika ada)
sudo apache2ctl -S 2>/dev/null || echo "Apache tidak terinstall"

# Cek Caddy (jika ada)
sudo caddy list 2>/dev/null || echo "Caddy tidak terinstall"

# Cek Traefik (jika ada)
docker ps | grep traefik
```

---

## 📊 Expected Output

### Contoh Output dari Nginx Config:

```nginx
# File: ~/dasmap_prod/apps/nginx/sites-enabled/dasmap.co.id.conf
server {
    listen 80;
    server_name dasmap.co.id www.dasmap.co.id;
    # ...
}

server {
    listen 80;
    server_name amilna.co.id www.amilna.co.id;
    # ...
}
```

### Hasil dari Server Anda:

**Struktur Directory:**

```
~/dasmap_prod/apps/
├── amilna.co.id/      → Website amilna
├── dasmap.co.id/      → Website dasmap
├── goproject/         → Project go
├── nginx/             → Nginx config
│   └── sites-enabled/
│       └── default    → Default server config
└── tamankehati/       → Taman Kehati (sudah ada directory!)
```

**Nginx Config (`~/dasmap_prod/apps/nginx/sites-enabled/default`):**

```nginx
server {
    listen 80 default_server;      # Default server (catch-all)
    server_name _;                  # Catch-all (tidak ada domain spesifik)

    # Semua request di-proxy ke:
    location / {
        proxy_pass http://38.47.93.167:8081/;  # IP external
    }

    location /uploads/ {
        proxy_pass http://38.47.93.167:8081/uploads/;
    }

    location /mbtiles/ {
        proxy_pass http://172.27.0.4:8000/services/;  # IP Docker network
    }
}
```

**Arti:**

- ✅ **Nginx tidak terinstall di host** → Hanya di Docker container (service `go`)
- ✅ **Default server** → Semua request ke port 80 akan di-proxy ke `38.47.93.167:8081`
- ✅ **Tidak ada domain spesifik** → `server_name _` berarti catch-all
- ✅ **Routing sudah ada** → `/uploads/` dan `/mbtiles/` sudah di-routing
- ✅ **Docker network** → `172.27.0.4` adalah IP di dalam Docker network `dasmap_prod_go-net`

**Domain yang Mungkin Ditemukan:**

- `dasmap.co.id` → Website utama (via default server)
- `amilna.co.id` → Website lain (via default server)
- `tamankehati.dasmap.co.id` → **Ini yang akan kita tambahkan**

---

## 🎯 Rekomendasi Domain untuk Taman Kehati

### Option 1: Subdomain (Recommended)

**Domain:** `tamankehati.dasmap.co.id`

**Setup:**

1. Tambahkan DNS A record di domain registrar:

   ```
   Type: A
   Host: tamankehati
   Value: YOUR_SERVER_IP
   TTL: 3600
   ```

2. Tambahkan Nginx config di service `go`:
   ```nginx
   server {
       listen 80;
       server_name tamankehati.dasmap.co.id;
       # ... routing ke port 3000 dan 8000
   }
   ```

### Option 2: Path-based (Alternatif)

**Domain:** `dasmap.co.id/tamankehati`

**Setup:**

1. Tambahkan location block di Nginx config yang ada
2. Route ke port 3000 dan 8000

### Option 3: IP + Port (Untuk Testing)

**Akses:** `http://YOUR_SERVER_IP:3000` (Frontend)
**API:** `http://YOUR_SERVER_IP:8000` (Backend)

**Setup:**

- Tidak perlu DNS setup
- Langsung akses via IP dan port

---

## ✅ Action Items

Setelah cek domain, lakukan:

1. **Pilih domain/subdomain** untuk Taman Kehati
2. **Setup DNS** (jika pakai subdomain)
3. **Update Nginx config** di service `go`
4. **Update environment variables** di Taman Kehati:
   ```bash
   DOMAIN=tamankehati.dasmap.co.id
   NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id/api
   CORS_ORIGINS=https://dasmap.co.id,https://www.dasmap.co.id,https://tamankehati.dasmap.co.id
   ```

---

## 🔍 Troubleshooting

### Issue: Tidak bisa akses Nginx config di Docker

**Solution:**

```bash
# Find container name
docker ps | grep go

# Access container
docker exec -it <go-container-name> sh

# Inside container
cat /etc/nginx/nginx.conf
ls -la /etc/nginx/conf.d/
```

### Issue: Nginx config tidak ditemukan

**Solution:**

```bash
# Cek apakah Nginx di host atau di container
which nginx
docker ps | grep nginx

# Cek docker-compose untuk nginx volume mount
cat ~/dasmap_prod/docker-compose.yml | grep -i "nginx" -A 10
```

---

**Last Updated:** 2025-11-04
