# 📋 Cara Melihat Log Backend Docker di Server

## 🚀 Quick Commands

### 1. Melihat Log Backend (Real-time / Follow)
```bash
# Mengikuti log secara real-time (seperti tail -f)
docker logs -f tamankehati-backend-prod

# Atau jika menggunakan docker-compose
docker-compose -f docker-compose.pull.no-nginx.yml logs -f backend
```

### 2. Melihat Log Terakhir (Last N lines)
```bash
# Melihat 100 baris log terakhir
docker logs --tail 100 tamankehati-backend-prod

# Melihat 50 baris log terakhir
docker logs --tail 50 tamankehati-backend-prod

# Melihat 200 baris log terakhir dengan timestamps
docker logs --tail 200 --timestamps tamankehati-backend-prod
```

### 3. Melihat Log dengan Timestamps
```bash
# Log dengan timestamp
docker logs -f --timestamps tamankehati-backend-prod

# Atau menggunakan docker-compose
docker-compose -f docker-compose.pull.no-nginx.yml logs -f --timestamps backend
```

### 4. Melihat Log dari Waktu Tertentu
```bash
# Melihat log sejak 10 menit yang lalu
docker logs --since 10m tamankehati-backend-prod

# Melihat log sejak 1 jam yang lalu
docker logs --since 1h tamankehati-backend-prod

# Melihat log sejak waktu tertentu (ISO format)
docker logs --since 2025-11-09T10:00:00 tamankehati-backend-prod

# Kombinasi: sejak 1 jam lalu, 100 baris terakhir, dengan timestamp
docker logs --since 1h --tail 100 --timestamps tamankehati-backend-prod
```

### 5. Melihat Log Semua Services
```bash
# Melihat log semua services dengan docker-compose
docker-compose -f docker-compose.pull.no-nginx.yml logs -f

# Melihat log beberapa services tertentu
docker-compose -f docker-compose.pull.no-nginx.yml logs -f backend postgres redis
```

### 6. Menyimpan Log ke File
```bash
# Menyimpan log ke file
docker logs tamankehati-backend-prod > backend_logs.txt

# Menyimpan log dengan timestamp
docker logs --timestamps tamankehati-backend-prod > backend_logs_with_timestamp.txt

# Menyimpan log terakhir 1000 baris
docker logs --tail 1000 tamankehati-backend-prod > backend_logs_last_1000.txt
```

### 7. Filter Log (Menggunakan grep)
```bash
# Mencari error dalam log
docker logs tamankehati-backend-prod 2>&1 | grep -i error

# Mencari warning dalam log
docker logs tamankehati-backend-prod 2>&1 | grep -i warning

# Mencari pattern tertentu
docker logs tamankehati-backend-prod 2>&1 | grep -i "migration\|database\|connection"

# Mencari dengan case-insensitive dan show context
docker logs tamankehati-backend-prod 2>&1 | grep -i -A 5 -B 5 error
```

## 📊 Useful Commands untuk Debugging

### Check Container Status
```bash
# Melihat status container
docker ps | grep backend

# Melihat semua container (termasuk yang stopped)
docker ps -a | grep backend

# Melihat informasi detail container
docker inspect tamankehati-backend-prod
```

### Check Container Resources
```bash
# Melihat penggunaan resources (CPU, Memory)
docker stats tamankehati-backend-prod

# Melihat penggunaan resources semua container
docker stats
```

### Restart Container
```bash
# Restart container backend
docker restart tamankehati-backend-prod

# Atau menggunakan docker-compose
docker-compose -f docker-compose.pull.no-nginx.yml restart backend
```

### Execute Command di Container
```bash
# Masuk ke container backend
docker exec -it tamankehati-backend-prod /bin/bash

# Atau menggunakan sh (jika bash tidak ada)
docker exec -it tamankehati-backend-prod /bin/sh

# Menjalankan command tertentu
docker exec tamankehati-backend-prod python -c "print('Hello')"
docker exec tamankehati-backend-prod alembic current
```

## 🔍 Contoh Workflow untuk Debugging

### 1. Cek Error di Log
```bash
# Melihat log terakhir 200 baris dan mencari error
docker logs --tail 200 tamankehati-backend-prod | grep -i error
```

### 2. Monitor Log Real-time
```bash
# Membuka terminal baru dan monitor log
docker logs -f --timestamps tamankehati-backend-prod
```

### 3. Cek Health Check
```bash
# Cek health endpoint
curl http://localhost:8000/health

# Atau dari dalam container
docker exec tamankehati-backend-prod curl http://localhost:8000/health
```

### 4. Cek Database Connection
```bash
# Cek apakah backend bisa connect ke database
docker exec tamankehati-backend-prod python -c "
from core.database.session import get_db
db = next(get_db())
print('Database connection OK')
"
```

## 📝 Tips

1. **Gunakan `-f` (follow) untuk monitor real-time**: Sangat berguna saat debugging
2. **Gunakan `--timestamps` untuk melihat waktu**: Membantu tracking kapan error terjadi
3. **Gunakan `--tail` untuk membatasi output**: Tidak perlu melihat semua log jika hanya butuh yang terakhir
4. **Gunakan `grep` untuk filter**: Cari pattern tertentu seperti "error", "warning", dll
5. **Simpan log ke file**: Berguna untuk analisis lebih lanjut atau sharing dengan tim

## 🚨 Troubleshooting

### Jika container tidak running
```bash
# Cek status container
docker ps -a | grep backend

# Start container jika stopped
docker start tamankehati-backend-prod

# Atau restart menggunakan docker-compose
docker-compose -f docker-compose.pull.no-nginx.yml up -d backend
```

### Jika log tidak muncul
```bash
# Cek apakah container benar-benar running
docker ps | grep backend

# Cek logs dengan semua output (stdout + stderr)
docker logs tamankehati-backend-prod 2>&1

# Cek apakah ada issue dengan container
docker inspect tamankehati-backend-prod | grep -i status
```

### Jika perlu melihat log dari waktu tertentu
```bash
# Melihat log sejak container start
docker logs --since $(docker inspect -f '{{.State.StartedAt}}' tamankehati-backend-prod) tamankehati-backend-prod
```

## 📌 Quick Reference

```bash
# Most used commands
docker logs -f tamankehati-backend-prod                    # Follow log real-time
docker logs --tail 100 tamankehati-backend-prod           # Last 100 lines
docker logs --tail 100 --timestamps tamankehati-backend-prod  # Last 100 lines with timestamp
docker logs tamankehati-backend-prod 2>&1 | grep -i error # Find errors
docker-compose -f docker-compose.pull.no-nginx.yml logs -f backend  # Using docker-compose
```

