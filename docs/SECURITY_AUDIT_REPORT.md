# 🔒 Security Audit Report - Taman Kehati

**Date**: January 2025  
**Status**: ⚠️ Beberapa vulnerabilities ditemukan - perlu perbaikan

---

## 🔴 CRITICAL VULNERABILITIES

### 1. 🔴 SQL Injection Risk - String Formatting di Raw SQL
**File**: `apps/backend/api/v1/routes/dashboard.py` (Line 38-44)

**Status**: ✅ **FIXED** - Sekarang menggunakan parameterized query

**Issue (Before Fix)**: 
- Menggunakan f-string untuk memasukkan `user_filter` ke dalam SQL
- Jika `filter_params` tidak divalidasi dengan benar, berisiko SQL injection
- Meskipun `filter_params` berasal dari `user.id`, tetap perlu parameterized query

**Risk**: 🟠 **HIGH** - SQL Injection vulnerability

**Fix Applied**:
- ✅ Menggunakan separate parameterized queries untuk regional_admin dan super_admin
- ✅ Tidak lagi menggunakan f-string untuk SQL construction
- ✅ Semua parameter menggunakan proper parameter binding

**Fix Priority**: ✅ **COMPLETED**

---

### 2. 🔴 XSS Vulnerability - dangerouslySetInnerHTML
**Files**: 
- `apps/frontend/src/components/announcements/RegionalAnnouncementsPage.tsx`
- `apps/frontend/src/components/public/artikel/ArtikelDetailView.tsx`
- `apps/frontend/src/components/announcements/PublicAnnouncementDetail.tsx`
- `apps/frontend/src/components/announcements/AnnouncementDetail.tsx`
- Dan beberapa file lain

**Status**: ✅ **FIXED** - Semua file sudah menggunakan `sanitizeHtmlRich()` dari utility

**Fix Applied**:
- ✅ Installed `isomorphic-dompurify`
- ✅ Created utility function `sanitizeHtml()` di `apps/frontend/src/utils/sanitizeHtml.ts`
- ✅ Updated semua file yang menggunakan `dangerouslySetInnerHTML` untuk sanitize content
- ✅ Fixed files:
  - RegionalAnnouncementsPage.tsx
  - ArtikelDetailView.tsx
  - PublicAnnouncementDetail.tsx
  - AnnouncementDetail.tsx
  - MediumStyleArtikelPage.tsx
  - ArtikelEditPage.tsx
  - ArtikelCreatePage.tsx

**Fix Priority**: ✅ **COMPLETED**

---

## 🟠 HIGH PRIORITY VULNERABILITIES

### 3. ⚠️ Path Traversal Protection - Upload File
**File**: `apps/backend/api/v1/routes/upload.py`

**Status**: ✅ **ALREADY PROTECTED** - Line 104 menggunakan `os.path.join` dengan `UPLOAD_DIR` yang sudah normalized

**Additional Security**:
- ✅ File extension validation (line 88)
- ✅ File size limit (line 96)
- ✅ Unique filename generation (line 103)
- ⚠️ **BETTER**: Tambahkan MIME type validation, bukan hanya extension

**Recommendation**:
```python
import magic  # python-magic library

# Validate MIME type matches extension
file_mime = magic.from_buffer(file_content, mime=True)
allowed_mimes = {'image/jpeg', 'image/png', 'image/gif', 'image/webp'}
if file_mime not in allowed_mimes:
    raise HTTPException(400, "Invalid file type")
```

---

### 4. ⚠️ Rate Limiting - In-Memory (Tidak Persisten)
**File**: `apps/backend/api/v1/routes/auth.py` (Line 26-47)

**Issue**:
- Rate limiting menggunakan in-memory dictionary
- Hilang saat server restart
- Tidak efektif jika ada multiple server instances (load balancing)

**Risk**: 🟡 **MEDIUM** - Bisa di-bypass dengan multiple IP atau restart server

**Current Implementation**: ✅ Ada rate limiting, tapi bukan production-grade

**Recommendation**:
- Gunakan Redis-based rate limiting untuk production
- Library: `slowapi` atau `aioredis`

---

### 5. ⚠️ Hardcoded Secrets di Code
**Files**: Beberapa file mungkin masih ada

**Check Needed**:
- ✅ JWT secret key menggunakan environment variable (`SECRET_KEY`)
- ⚠️ Pastikan tidak ada hardcoded password/token di codebase
- ⚠️ Database credentials menggunakan environment variables

**Recommendation**:
```bash
# Scan untuk potential secrets
grep -r "password.*=" apps/backend/ --exclude-dir=node_modules
grep -r "api_key.*=" apps/backend/
grep -r "secret.*=" apps/backend/
```

---

### 6. ⚠️ CORS Configuration
**File**: `apps/backend/main.py` (Line 144-156)

**Status**: ✅ **GOOD** - Menggunakan whitelist, bukan `"*"`

**Current**:
```python
DEFAULT_CORS_ORIGINS: List[str] = [
    "http://localhost:3000",
    "https://tamankehati-8x6q.vercel.app",
]
```

**Recommendation**:
- ✅ Sudah benar - hanya allow specific origins
- ⚠️ Pastikan production URL sudah ada di environment variable `CORS_ALLOW_ORIGINS`

---

## 🟡 MEDIUM PRIORITY ISSUES

### 7. ⚠️ User Cache Without Invalidation
**File**: `apps/backend/api/v1/permissions/rbac.py` (Line 22-35)

**Issue**:
- User cache 30 detik
- Jika user role/permission berubah, cache tidak langsung update
- Window privilege escalation: 30 detik

**Risk**: 🟡 **MEDIUM**

**Recommendation**:
- Panggil `clear_user_cache(user_id)` saat:
  - User role berubah
  - User park assignment berubah
  - User deactivation
  - Password change

---

### 8. ⚠️ Error Messages - Information Disclosure
**File**: `apps/backend/api/v1/routes/auth.py` (Line 158)

**Status**: ✅ **GOOD** - Sudah generic error message

**Current**:
```python
error_detail = "Invalid email or password"  # ✅ Generic
```

**Note**: Beberapa endpoint lain mungkin masih expose detail error. Periksa:
- Database errors
- File upload errors
- API endpoint errors

---

### 9. ⚠️ File Upload - MIME Type Validation Missing
**File**: `apps/backend/api/v1/routes/upload.py`

**Issue**:
- Hanya validasi file extension
- Tidak validasi MIME type aktual
- Attacker bisa upload file dengan extension `.jpg` tapi isinya script

**Recommendation**: Lihat #3 di atas

---

## ✅ SECURITY STRENGTHS

### 1. ✅ SQL Injection Protection (GOOD)
- Semua query menggunakan SQLAlchemy ORM dengan parameterized queries
- Tidak ada raw SQL dengan string interpolation yang tidak aman
- Exception: Dashboard.py perlu diperbaiki (lihat #1)

### 2. ✅ Password Security (GOOD)
- Password hashing menggunakan bcrypt
- Constant-time comparison
- Generic error messages untuk prevent user enumeration

### 3. ✅ Authentication (GOOD)
- JWT token dengan expiration
- HTTP-only cookies option
- Bearer token authentication

### 4. ✅ Authorization (GOOD)
- RBAC (Role-Based Access Control) implemented
- Role checks di setiap endpoint
- User scope filtering untuk regional admin

### 5. ✅ Path Traversal Protection (GOOD)
- File serving endpoint sudah protected (main.py line 413-419)
- Normalized path checking

### 6. ✅ Rate Limiting (PARTIAL)
- Ada rate limiting untuk login endpoint
- Ada rate limiting untuk chatbot
- Perlu upgrade ke Redis-based untuk production

---

## 📋 RECOMMENDED ACTIONS

### Immediate (Critical):
1. 🔥 Fix SQL injection risk di `dashboard.py` - gunakan parameterized query
2. 🔥 Fix XSS vulnerabilities - tambahkan DOMPurify untuk sanitize HTML content

### High Priority:
3. ⚠️ Upgrade rate limiting ke Redis-based untuk production
4. ⚠️ Tambahkan MIME type validation untuk file uploads
5. ⚠️ Review semua error messages untuk prevent information disclosure

### Medium Priority:
6. 🟡 Implement user cache invalidation on sensitive operations
7. 🟡 Security headers audit (CSP, X-Frame-Options, etc.)
8. 🟡 Dependency audit - check for known vulnerabilities

---

## 🔍 ADDITIONAL SECURITY CHECKS NEEDED

1. **Dependency Vulnerabilities**:
   ```bash
   npm audit  # Frontend
   pip check  # Backend (atau safety)
   ```

2. **Security Headers**:
   - Content-Security-Policy (CSP)
   - X-Frame-Options
   - X-Content-Type-Options
   - Strict-Transport-Security (HSTS)

3. **Secrets Scanning**:
   - Scan codebase untuk hardcoded secrets
   - Use tools: `git-secrets`, `trufflehog`

4. **Environment Variables**:
   - Pastikan semua secrets di environment variables
   - Tidak ada secrets di git repository

---

## 📊 SECURITY SCORE

- **SQL Injection**: 🟠 Medium Risk (1 issue found)
- **XSS**: 🟠 High Risk (multiple instances)
- **Authentication**: ✅ Good
- **Authorization**: ✅ Good
- **File Upload**: 🟡 Medium (needs MIME validation)
- **Rate Limiting**: 🟡 Medium (needs Redis)
- **Error Handling**: ✅ Good
- **Path Traversal**: ✅ Protected

**Overall Security Score**: 🟡 **B+ (Good, dengan beberapa improvements needed)**

---

## 🔧 QUICK FIXES

### Fix 1: SQL Injection di dashboard.py
```python
# BEFORE (Line 38-45):
pending_sql = f"""
    SELECT ... {user_filter} ...
"""
pending_result = await db.execute(text(pending_sql), filter_params)

# AFTER:
if user.role == "regional_admin":
    pending_sql = text("""
        SELECT 
            (SELECT COUNT(*) FROM flora WHERE status = 'in_review' AND deleted_at IS NULL AND submitted_by = :user_id) +
            (SELECT COUNT(*) FROM fauna WHERE status = 'in_review' AND deleted_at IS NULL AND submitted_by = :user_id) +
            (SELECT COUNT(*) FROM parks WHERE status = 'in_review' AND deleted_at IS NULL AND submitted_by = :user_id) +
            (SELECT COUNT(*) FROM activities WHERE status = 'in_review' AND deleted_at IS NULL AND submitted_by = :user_id) as total_pending
    """)
    filter_params = {"user_id": user.id}
else:
    pending_sql = text("""
        SELECT 
            (SELECT COUNT(*) FROM flora WHERE status = 'in_review' AND deleted_at IS NULL) +
            (SELECT COUNT(*) FROM fauna WHERE status = 'in_review' AND deleted_at IS NULL) +
            (SELECT COUNT(*) FROM parks WHERE status = 'in_review' AND deleted_at IS NULL) +
            (SELECT COUNT(*) FROM activities WHERE status = 'in_review' AND deleted_at IS NULL) as total_pending
    """)
    filter_params = {}
pending_result = await db.execute(pending_sql, filter_params)
```

### Fix 2: XSS Protection
```bash
# Install DOMPurify
npm install isomorphic-dompurify
```

Lalu update semua file yang menggunakan `dangerouslySetInnerHTML`.

---

**End of Report**

