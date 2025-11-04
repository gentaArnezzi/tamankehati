# 🔍 Cek Aplikasi yang Sudah Ada di Server

Panduan untuk memahami bagaimana aplikasi yang sudah ada (dasmap.co.id, amilna.co.id) di-deploy dan running.

---

## 📋 Struktur Server yang Diketahui

**Dari informasi yang ada:**

```
~/dasmap_prod/
├── docker-compose.yml          ← Docker Compose utama
├── apps/
│   ├── amilna.co.id/           ← Folder aplikasi amilna
│   ├── dasmap.co.id/           ← Folder aplikasi dasmap
│   ├── goproject/              ← Folder aplikasi goproject
│   ├── nginx/                  ← Nginx config
│   └── tamankehati/            ← Aplikasi Taman Kehati (baru)
└── data/                       ← Data volume
```

---

## 🔍 Cara Cek Aplikasi yang Sudah Running

### Step 1: Cek Docker Containers

**Di Server:**

```bash
# Cek semua container yang running
docker ps

# Cek container service 'go' (nginx)
docker ps | grep go

# Cek detail service 'go'
docker inspect <go-container-id>
```

**Expected Output:**
- Container `go` kemungkinan adalah Nginx yang handle routing
- Container lain untuk aplikasi dasmap/amilna

---

### Step 2: Cek Docker Compose Utama

**Di Server:**

```bash
cd ~/dasmap_prod

# Cek docker-compose.yml
cat docker-compose.yml

# Cek services yang didefinisikan
docker compose ps

# Cek network yang digunakan
docker network ls
```

**Yang Perlu Dicek:**
- Service `go` → Apa isinya? (nginx? aplikasi go?)
- Port yang digunakan (80, 443, dll)
- Volume mounts ke folder aplikasi
- Network yang digunakan

---

### Step 3: Cek Folder Aplikasi

**Di Server:**

```bash
# Cek isi folder dasmap.co.id
ls -la ~/dasmap_prod/apps/dasmap.co.id/

# Cek isi folder amilna.co.id
ls -la ~/dasmap_prod/apps/amilna.co.id/

# Cek apakah ada docker-compose di dalam folder
ls -la ~/dasmap_prod/apps/dasmap.co.id/docker-compose.yml
ls -la ~/dasmap_prod/apps/amilna.co.id/docker-compose.yml

# Cek apakah ada aplikasi binary
ls -la ~/dasmap_prod/apps/dasmap.co.id/godasmap  # contoh
ls -la ~/dasmap_prod/apps/dasmap.co.id/goproject # contoh
```

**Yang Perlu Dicek:**
- Apakah aplikasi Go binary yang running langsung?
- Apakah ada docker-compose di dalam folder?
- Apakah aplikasi di-mount sebagai volume?

---

### Step 4: Cek Nginx Configuration

**Di Server:**

```bash
# Cek Nginx config di folder nginx
ls -la ~/dasmap_prod/apps/nginx/

# Cek Nginx config di service 'go' (jika container)
docker exec -it <go-container-id> cat /etc/nginx/nginx.conf
docker exec -it <go-container-id> ls -la /etc/nginx/conf.d/

# Cek Nginx config di host (jika Nginx di host)
sudo ls -la /etc/nginx/sites-enabled/
sudo cat /etc/nginx/sites-enabled/*.conf
```

**Yang Perlu Dicek:**
- Bagaimana Nginx route ke aplikasi dasmap/amilna?
- Port yang digunakan untuk routing
- Server blocks untuk masing-masing domain

---

### Step 5: Cek Process yang Running

**Di Server:**

```bash
# Cek process Go yang running
ps aux | grep -E "godasmap|goproject|amilna"

# Cek port yang digunakan
sudo netstat -tulpn | grep -E ":80|:443|:8080|:3000|:8000"

# Cek service systemd (jika ada)
systemctl list-units | grep -E "dasmap|amilna|go"
```

---

## 🎯 Kemungkinan Setup Aplikasi yang Ada

### Opsi 1: Service 'go' adalah Nginx Container

**Setup:**
- Service `go` → Nginx container
- Nginx route ke aplikasi Go yang running di folder aplikasi
- Aplikasi Go running sebagai binary di server (bukan container)

**Cek:**
```bash
docker ps | grep go
docker exec -it <go-container-id> nginx -T
ps aux | grep godasmap
```

---

### Opsi 2: Service 'go' adalah Aplikasi Go

**Setup:**
- Service `go` → Aplikasi Go yang handle routing
- Mungkin ada multiple aplikasi di dalam satu service
- Atau aplikasi Go yang serve multiple domain

**Cek:**
```bash
docker ps | grep go
docker exec -it <go-container-id> ps aux
docker logs <go-container-id>
```

---

### Opsi 3: Aplikasi Running di Host (Bukan Container)

**Setup:**
- Aplikasi Go running langsung di server
- Systemd service atau manual start
- Nginx di host route ke aplikasi

**Cek:**
```bash
ps aux | grep -E "godasmap|goproject|amilna"
systemctl status dasmap
systemctl status amilna
sudo netstat -tulpn | grep -E ":80|:443"
```

---

## 📝 Script Lengkap untuk Cek

**Buat script `check-existing-apps.sh`:**

```bash
#!/bin/bash

echo "=========================================="
echo "🔍 Check Existing Applications"
echo "=========================================="
echo ""

echo "1. Docker Containers:"
docker ps
echo ""

echo "2. Docker Compose Services:"
cd ~/dasmap_prod
docker compose ps
echo ""

echo "3. Service 'go' Details:"
docker ps | grep go
if [ $? -eq 0 ]; then
    GO_CONTAINER=$(docker ps | grep go | awk '{print $1}')
    echo "Container ID: $GO_CONTAINER"
    docker inspect $GO_CONTAINER | grep -A 5 "Mounts"
    docker inspect $GO_CONTAINER | grep -A 5 "Ports"
fi
echo ""

echo "4. Folder Structure:"
ls -la ~/dasmap_prod/apps/
echo ""

echo "5. Nginx Config (if exists):"
ls -la ~/dasmap_prod/apps/nginx/ 2>/dev/null || echo "Nginx folder not found"
echo ""

echo "6. Running Processes:"
ps aux | grep -E "godasmap|goproject|amilna|nginx" | grep -v grep
echo ""

echo "7. Port Usage:"
sudo netstat -tulpn | grep -E ":80|:443|:8080|:3000|:8000" || echo "No matching ports found"
echo ""

echo "8. Docker Compose Main File:"
cat ~/dasmap_prod/docker-compose.yml | head -50
echo ""

echo "=========================================="
echo "✅ Check Complete"
echo "=========================================="
```

**Save dan jalankan:**
```bash
chmod +x check-existing-apps.sh
./check-existing-apps.sh
```

---

## 🎯 Yang Perlu Diketahui untuk Deployment Taman Kehati

### 1. Port yang Digunakan

- **Port 80/443** → Service `go` (sudah digunakan)
- **Port 3000** → Taman Kehati Frontend (perlu cek apakah kosong)
- **Port 8000** → Taman Kehati Backend (perlu cek apakah kosong)

### 2. Nginx Routing

- Jika service `go` adalah Nginx → Perlu setup routing baru untuk Taman Kehati
- Jika Nginx di host → Perlu tambah config untuk Taman Kehati

### 3. Network Isolation

- Taman Kehati akan pakai network sendiri (`tamankehati-network`)
- Tidak akan konflik dengan network aplikasi yang sudah ada

---

## ✅ Kesimpulan

**Untuk memahami setup yang ada, perlu cek di server:**

1. ✅ `docker ps` → Lihat container yang running
2. ✅ `cat ~/dasmap_prod/docker-compose.yml` → Lihat service 'go'
3. ✅ `ls -la ~/dasmap_prod/apps/dasmap.co.id/` → Lihat aplikasi dasmap
4. ✅ `ps aux | grep go` → Lihat process yang running
5. ✅ `sudo netstat -tulpn | grep :80` → Lihat port 80

**Setelah tahu setup yang ada, baru bisa deploy Taman Kehati dengan benar!**

---

**Last Updated:** 2025-11-04

