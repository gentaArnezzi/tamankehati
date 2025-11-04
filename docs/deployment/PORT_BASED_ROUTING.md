# 🔌 Port-based Routing (Tanpa DNS Setup)

Panduan untuk setup routing menggunakan port berbeda, sehingga tidak perlu setup DNS di registrar.

---

## ✅ Solusi: Pakai Port Berbeda

**Konsep:**
- Aplikasi lain: `http://38.47.93.167` (port 80)
- Taman Kehati: `http://38.47.93.167:8080` (port 8080)

**Keuntungan:**
- ✅ Tidak perlu setup DNS
- ✅ Tidak konflik dengan aplikasi lain
- ✅ Simple dan cepat
- ✅ Langsung bisa digunakan

**Kekurangan:**
- ⚠️ URL kurang professional: `http://38.47.93.167:8080`
- ⚠️ Perlu expose port di firewall

---

## 🔧 Setup Nginx untuk Port Berbeda

### Opsi 1: Nginx di Host (Recommended)

**Nginx di host server listen di port berbeda, route ke container.**

#### Step 1: Update Nginx Config di Host

**File:** `~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf`

```nginx
# Taman Kehati - Listen di port 8080
server {
    listen 8080;
    server_name 38.47.93.167 _;  # IP atau catch-all

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
    }

    # Backend uploads
    location /uploads/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Backend docs (Swagger UI)
    location /docs {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend OpenAPI JSON
    location /openapi.json {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Step 2: Test dan Reload Nginx

**Jika Nginx di host server:**

```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

**Jika Nginx di container `go`:**

```bash
# Test config
docker exec -it dasmap_prod-go-1 nginx -t

# Reload
docker exec -it dasmap_prod-go-1 nginx -s reload
```

#### Step 3: Buka Port di Firewall

```bash
# Buka port 8080
sudo ufw allow 8080/tcp

# Verify
sudo ufw status | grep 8080
```

#### Step 4: Test

```bash
# Test frontend
curl http://38.47.93.167:8080 | head -20

# Test backend API
curl http://38.47.93.167:8080/api/health
```

**Expected:** HTML dari Taman Kehati (Next.js)

---

### Opsi 2: Akses Langsung Container (Tanpa Nginx)

**Akses langsung ke container tanpa Nginx routing.**

#### Keuntungan:
- ✅ Simple - tidak perlu setup Nginx
- ✅ Langsung akses

#### Kekurangan:
- ⚠️ Tidak ada reverse proxy
- ⚠️ Tidak ada SSL (kecuali setup di container)

#### Langkah:

**1. Pastikan Port Terbuka di Firewall:**

```bash
# Buka port 3000 (frontend) dan 8000 (backend)
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp

# Verify
sudo ufw status | grep -E "(3000|8000)"
```

**2. Update CORS di Backend:**

**File:** `.env`

```bash
CORS_ORIGINS=http://38.47.93.167:3000,http://38.47.93.167:8080,http://localhost:3000
```

**3. Update Frontend API URL:**

**File:** `.env`

```bash
NEXT_PUBLIC_API_URL=http://38.47.93.167:8000
```

**4. Restart Services:**

```bash
cd ~/dasmap_prod/apps/tamankehati
docker compose -f docker-compose.pull.no-nginx.yml restart
```

**5. Test:**

```bash
# Frontend
curl http://38.47.93.167:3000 | head -20

# Backend
curl http://38.47.93.167:8000/api/health
```

**URL:**
- Frontend: `http://38.47.93.167:3000`
- Backend: `http://38.47.93.167:8000`

---

## 📋 Rekomendasi Port

**Port yang bisa digunakan:**

- **8080** - Recommended untuk web (biasanya tidak digunakan)
- **8081** - Alternative
- **8888** - Alternative
- **3000** - Langsung akses frontend (tidak perlu Nginx)
- **8000** - Langsung akses backend (tidak perlu Nginx)

**Cek port yang digunakan:**

```bash
# Cek port yang sudah digunakan
sudo netstat -tulpn | grep LISTEN
# Atau
sudo ss -tulpn | grep LISTEN
```

---

## 🔧 Complete Setup Script

**Script untuk setup port-based routing:**

```bash
#!/bin/bash

# Setup port 8080 untuk Taman Kehati

PORT=8080

echo "🔧 Setting up port-based routing on port $PORT..."

# 1. Update Nginx config
cat > ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf << 'EOF'
server {
    listen 8080;
    server_name 38.47.93.167 _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /docs {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 2. Buka port di firewall
echo "🔓 Opening port $PORT in firewall..."
sudo ufw allow $PORT/tcp

# 3. Test dan reload Nginx
echo "🔄 Testing and reloading Nginx..."
if docker ps | grep -q "dasmap_prod-go-1"; then
    docker exec -it dasmap_prod-go-1 nginx -t
    docker exec -it dasmap_prod-go-1 nginx -s reload
else
    sudo nginx -t
    sudo systemctl reload nginx
fi

echo "✅ Setup complete!"
echo ""
echo "🌐 Access Taman Kehati at:"
echo "   http://38.47.93.167:$PORT"
echo ""
echo "🧪 Test:"
echo "   curl http://38.47.93.167:$PORT | head -20"
```

---

## 🎯 Quick Setup

**Copy-paste command berikut di server:**

```bash
# 1. Update Nginx config untuk port 8080
cat > ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf << 'EOF'
server {
    listen 8080;
    server_name 38.47.93.167 _;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location /uploads/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    location /docs {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
    }
}
EOF

# 2. Buka port 8080
sudo ufw allow 8080/tcp

# 3. Test dan reload Nginx
docker exec -it dasmap_prod-go-1 nginx -t
docker exec -it dasmap_prod-go-1 nginx -s reload

# 4. Test
curl http://38.47.93.167:8080 | head -20
```

---

## ✅ Expected Result

**Setelah setup:**

```bash
curl http://38.47.93.167:8080 | head -20
```

**Expected output:**
```html
<!DOCTYPE html>
<html lang="id">
<head>
<meta charSet="utf-8"/>
<title>Portal Keanekaragaman Hayati Indonesia</title>
<!-- Next.js app -->
```

**URL:**
- Frontend: `http://38.47.93.167:8080`
- Backend API: `http://38.47.93.167:8080/api/`
- Backend Docs: `http://38.47.93.167:8080/docs`

---

## 🔍 Troubleshooting

### Port Tidak Bisa Diakses

**Masalah:** `curl http://38.47.93.167:8080` tidak bisa akses

**Solusi:**
1. **Cek firewall:**
   ```bash
   sudo ufw status | grep 8080
   sudo ufw allow 8080/tcp
   ```

2. **Cek Nginx listen:**
   ```bash
   docker exec -it dasmap_prod-go-1 cat /etc/nginx/sites-enabled/tamankehati.conf | grep listen
   # Expected: listen 8080;
   ```

3. **Cek container running:**
   ```bash
   docker ps | grep tamankehati
   ```

---

### 502 Bad Gateway

**Masalah:** 502 Bad Gateway saat akses

**Solusi:**
1. **Cek backend/frontend running:**
   ```bash
   docker ps | grep -E "(tamankehati-frontend|tamankehati-backend)"
   ```

2. **Cek logs:**
   ```bash
   docker logs tamankehati-frontend-1
   docker logs tamankehati-backend-1
   ```

3. **Cek proxy_pass:**
   ```bash
   # Test dari container
   docker exec -it dasmap_prod-go-1 curl http://localhost:3000
   docker exec -it dasmap_prod-go-1 curl http://localhost:8000/api/health
   ```

---

**Last Updated:** 2025-11-04

