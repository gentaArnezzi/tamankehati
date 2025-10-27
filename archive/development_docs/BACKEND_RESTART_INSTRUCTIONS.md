# 🚀 Backend Restart Instructions

**Date**: 2025-10-26  
**Issue**: CORS error - Backend not responding

---

## ❌ Error yang Terjadi

```
Access to fetch at 'http://localhost:8000/api/v1/approvals/?limit=200' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Artinya**: Backend **tidak running** atau crash!

---

## ✅ Cara Restart Backend

### **Step 1: Kill Backend yang Lama**

Buka terminal backend (yang running `uvicorn`), lalu tekan:
```
Ctrl + C
```

Atau, jika backend stuck, kill process:
```bash
# Cari process backend
ps aux | grep uvicorn

# Kill process (ganti <PID> dengan nomor process)
kill -9 <PID>
```

---

### **Step 2: Restart Backend**

```bash
# 1. Masuk ke directory backend
cd /Users/irgyaarnezzi/Desktop/tamankehati_23/tamankehati_21/apps/backend

# 2. Activate virtual environment (jika belum)
source venv/bin/activate

# 3. Start backend dengan uvicorn
uvicorn main:app --reload --port 8000
```

---

### **Step 3: Verify Backend Running**

Setelah backend start, cek di browser:

**Test URL**:
```
http://localhost:8000/docs
```

Harus menampilkan **Swagger UI** (API documentation) ✅

---

## 🔍 Troubleshooting

### **Jika Backend Crash Immediately**

Lihat error message di terminal. Common errors:

#### **1. Import Error**
```
ImportError: cannot import name 'X' from 'Y'
```
**Fix**: Cek import statement, mungkin ada typo atau module belum diinstall.

#### **2. Database Connection Error**
```
sqlalchemy.exc.OperationalError: could not connect to server
```
**Fix**: Pastikan PostgreSQL running dan `DATABASE_URL` di `.env` benar.

#### **3. Port Already in Use**
```
OSError: [Errno 48] Address already in use
```
**Fix**: Kill process yang menggunakan port 8000:
```bash
lsof -ti:8000 | xargs kill -9
```

---

## 📋 Checklist After Restart

- [ ] Backend running di `http://localhost:8000`
- [ ] `/docs` dapat diakses (Swagger UI tampil)
- [ ] Terminal backend tidak ada error
- [ ] Frontend dapat fetch data (reload page)

---

## 🎯 Expected Output

Saat backend berhasil start, Anda akan lihat:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

✅ **Backend siap!**

---

## 🚨 Jika Masih Error

1. **Cek Database Connection**:
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

2. **Cek Python Version**:
   ```bash
   python --version
   # Harus Python 3.9+
   ```

3. **Reinstall Dependencies**:
   ```bash
   cd apps/backend
   pip install -r requirements.txt
   ```

4. **Paste Error ke Chat**:
   Copy full error message dari terminal dan paste ke chat untuk troubleshooting.

---

## ✅ Summary

| Step | Action | Status |
|------|--------|--------|
| 1 | Kill old backend (Ctrl+C) | ⏳ |
| 2 | `cd apps/backend` | ⏳ |
| 3 | `source venv/bin/activate` | ⏳ |
| 4 | `uvicorn main:app --reload --port 8000` | ⏳ |
| 5 | Test `/docs` di browser | ⏳ |
| 6 | Reload frontend page | ⏳ |

**Let's get that backend running!** 🚀


