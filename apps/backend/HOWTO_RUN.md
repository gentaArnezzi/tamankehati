# 🚀 Cara Menjalankan Backend Taman Kehati

## ✅ Status Saat Ini
✓ Dependencies sudah terinstall  
✓ Virtual environment (venv) sudah siap  
✓ Server sudah berjalan di http://localhost:8000

---

## 📦 Quick Start (RECOMMENDED)

### Cara TERMUDAH - Gunakan Script Helper:

```bash
cd /Users/irgyaarnezzi/Desktop/tamankehati_new/apps/backend
./start.sh
```

Script ini akan:
- ✓ Otomatis aktivasi venv
- ✓ Check dependencies
- ✓ Menjalankan server dengan konfigurasi yang benar
- ✓ Menampilkan info server

### Stop Server:

```bash
./stop.sh
```

---

## 🔧 Manual Start (Alternative)

Jika ingin manual, **HARUS** menggunakan salah satu cara ini:

### Cara 1: Menggunakan `python -m uvicorn` (RECOMMENDED)

```bash
cd /Users/irgyaarnezzi/Desktop/tamankehati_new/apps/backend
source venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Cara 2: Direct uvicorn (pastikan venv aktif)

```bash
cd /Users/irgyaarnezzi/Desktop/tamankehati_new/apps/backend
source venv/bin/activate

# WAJIB cek dulu apakah menggunakan venv:
which uvicorn  # HARUS menampilkan: .../venv/bin/uvicorn
which python   # HARUS menampilkan: .../venv/bin/python

# Jika sudah benar, baru jalankan:
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## ⚠️ PENTING: Kenapa Harus `python -m uvicorn`?

**Masalah yang sering terjadi:**

Meskipun sudah aktivasi venv dengan `source venv/bin/activate`, ketika mengetik `uvicorn` langsung, kadang sistem masih menggunakan **uvicorn dari system Python** (bukan dari venv).

**Buktinya:**
```
# ❌ SALAH - Menggunakan system Python
/opt/homebrew/bin/uvicorn  

# ✅ BENAR - Menggunakan venv Python
/Users/.../venv/bin/uvicorn
```

**Solusi:**
- Gunakan `python -m uvicorn` → ini PASTI menggunakan Python dari venv
- Script `./start.sh` sudah menangani ini secara otomatis

---

## 🔍 Cara Cek Apakah Server Berjalan

```bash
# Check health endpoint
curl http://localhost:8000/health

# Check root endpoint
curl http://localhost:8000/

# Check dengan browser:
# http://localhost:8000/docs  (API Documentation)
```

---

## 🌐 URLs yang Tersedia

| Endpoint | URL | Deskripsi |
|----------|-----|-----------|
| Root | http://localhost:8000/ | API info |
| Health | http://localhost:8000/health | Health check |
| API Docs | http://localhost:8000/docs | Swagger UI |
| ReDoc | http://localhost:8000/redoc | Alternative docs |
| Public API | http://localhost:8000/api/public/ | Public endpoints |
| API V1 | http://localhost:8000/api/v1/ | Protected endpoints |

---

## 🐛 Troubleshooting

### Error: `ModuleNotFoundError: No module named 'asyncpg'`
**Penyebab:** Menggunakan Python system, bukan venv

**Solusi:**
```bash
# Gunakan python -m uvicorn
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Error: `No module named 'greenlet'`
**Penyebab:** Missing dependency

**Solusi:**
```bash
source venv/bin/activate
pip install --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org greenlet
```

### Port 8000 sudah digunakan
**Solusi:**
```bash
# Stop server yang sedang berjalan
./stop.sh

# Atau manual:
pkill -f uvicorn

# Atau gunakan port lain:
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

---

## 📝 Development Tips

### Auto-reload aktif
Server akan otomatis restart ketika ada perubahan file Python.

### Melihat logs
Logs akan muncul di terminal tempat Anda menjalankan server.

### Background mode
Jika ingin run di background:
```bash
nohup ./start.sh > backend.log 2>&1 &
```

---

## 🔄 Reinstall Dependencies (jika diperlukan)

```bash
cd /Users/irgyaarnezzi/Desktop/tamankehati_new/apps/backend
source venv/bin/activate
pip install --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org -r requirements.txt
```

---

## 📞 Need Help?

Jika masih ada masalah:
1. Check apakah venv aktif: `which python` → harus menunjukkan path ke venv
2. Check Python version: `python --version` → harus 3.13.x
3. Check uvicorn installed: `python -m uvicorn --version`
4. Gunakan script `./start.sh` untuk menghindari masalah

---

**Last Updated:** October 28, 2025  
**Python Version:** 3.13.7  
**FastAPI Version:** 0.115.6

