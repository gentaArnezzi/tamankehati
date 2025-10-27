# RAILWAY DATABASE COMPATIBILITY REPORT
**Date**: October 25, 2025  
**Status**: ⚠️ **SCHEMA MISMATCH DETECTED**

---

## 🔴 CRITICAL FINDING

Railway database memiliki **schema yang berbeda** dari local database development!

### Test Results
```
✅ Authentication: Working
✅ Dashboard: Working  
✅ Parks List: Working
❌ Parks Create: 500 Error
❌ Flora: 500 Error (schema mismatch)
❌ Fauna: 500 Error (schema mismatch)
❌ Activities: 500 Error
❌ Articles: 500 Error
❌ Galleries: 500 Error
❌ Approvals: 500 Error
```

---

## 📊 SCHEMA DIFFERENCES

### Users Table
| Local DB | Railway DB | Status |
|----------|------------|--------|
| `region_code` | `wilayah` | ⚠️ Different |
| `name` / `display_name` | `full_name` | ⚠️ Different |
| ✅ Fixed with compatibility layer | ✅ Working | ✅ |

### Flora Table  
| Local DB Field | Railway DB Field | Type Match |
|----------------|------------------|------------|
| `local_name` | `common_name` | ❌ **DIFFERENT** |
| `scientific_name` | `scientific_name` | ✅ Same |
| `is_endemic` | **MISSING** | ❌ **NOT EXISTS** |
| `iucn_status` | `conservation_status` | ⚠️ Different |
| `zone_id` | **REMOVED** | ✅ Expected |
| `park_id` | `park_id` | ✅ Same |

### Fauna Table
Similar issues as Flora - field names don't match

### Parks Table
| Field | Railway DB | Status |
|-------|------------|--------|
| `name` | ✅ Present | OK |
| `slug` | ✅ Present | OK |
| `status` | ✅ Present (VARCHAR) | ⚠️ Not ENUM |
| `created_by` | ✅ Present | OK |
| `submitted_by` | ✅ Present | OK |
| `approved_by` | ✅ Present | OK |
| `deleted_at` | ✅ Present | OK |

---

## 🎯 ROOT CAUSE

Railway database sepertinya dibuat dengan setup/migration yang berbeda dari local development database. Ada kemungkinan:

1. **Different Migration History** - Railway menggunakan migration yang berbeda
2. **Different Setup Script** - Railway di-setup dengan `setup_railway_simple.sql`
3. **Schema Evolution** - Local DB sudah berkembang, Railway belum update

---

## 💡 SOLUTIONS

### Option 1: Migrate Railway to Match Local ⭐ RECOMMENDED
**Pros**: Backend code tidak perlu ubah banyak  
**Cons**: Perlu migration script  
**Time**: 1-2 hours

**Steps**:
1. Backup Railway database
2. Create migration script to align schemas
3. Run migration on Railway
4. Test all endpoints

### Option 2: Update Backend for Railway Schema
**Pros**: Pakai Railway "as-is"  
**Cons**: Banyak code changes (20+ files)  
**Time**: 3-4 hours

**Steps**:
1. Update all models to match Railway schema
2. Update serializers
3. Update all queries
4. Test everything

### Option 3: Fresh Railway Setup
**Pros**: Clean start with correct schema  
**Cons**: Lose existing Railway data  
**Time**: 30 minutes

**Steps**:
1. Drop all Railway tables
2. Run Alembic migrations from local
3. Seed initial data
4. Test

---

## 🚀 RECOMMENDED ACTION PLAN

### Immediate (Next 30 mins)
1. ✅ Document schema differences (THIS FILE)
2. ⏭️ Choose migration strategy
3. ⏭️ Execute chosen strategy
4. ⏭️ Test all endpoints

### Short Term (Today)
1. Get Railway DB schema aligned
2. Run comprehensive tests
3. Deploy frontend
4. Verify end-to-end workflow

---

## 📋 DETAILED SCHEMA COMPARISON

### What's Working
```sql
-- Users table (with compatibility layer)
✅ id, email, password_hash, role, is_active
✅ wilayah (mapped to region_code)
✅ full_name (mapped to display_name)

-- Parks table
✅ All fields present
⚠️ status is VARCHAR not ENUM (minor issue)
```

### What's Broken
```sql
-- Flora table
❌ local_name → common_name (DIFFERENT NAME)
❌ is_endemic → MISSING
❌ iucn_status → conservation_status (DIFFERENT NAME)

-- Fauna table  
❌ Similar issues as Flora

-- Activities table
❌ Schema mismatch (need to check details)

-- Articles table
❌ Schema mismatch (need to check details)

-- Galleries table
❌ Schema mismatch (need to check details)
```

---

## 🔧 QUICK FIX SCRIPT

If we want to align Railway with Local:

```sql
-- Flora table fixes
ALTER TABLE flora RENAME COLUMN common_name TO local_name;
ALTER TABLE flora ADD COLUMN is_endemic BOOLEAN DEFAULT FALSE;
ALTER TABLE flora RENAME COLUMN conservation_status TO iucn_status;

-- Fauna table fixes (similar)
ALTER TABLE fauna RENAME COLUMN common_name TO local_name;
ALTER TABLE fauna ADD COLUMN is_endemic BOOLEAN DEFAULT FALSE;
ALTER TABLE fauna RENAME COLUMN conservation_status TO iucn_status;

-- Users table fixes (optional, compatibility layer handles this)
ALTER TABLE users ADD COLUMN region_code VARCHAR(10);
UPDATE users SET region_code = wilayah;
ALTER TABLE users ADD COLUMN display_name VARCHAR(255);
UPDATE users SET display_name = full_name;
```

---

## 📊 TEST RESULTS DETAIL

### Authentication ✅
```bash
✅ Super Admin Login: admin@kehati.org
✅ Regional Admin Login: kaltim.admin@kehati.org
✅ Token generation working
✅ User data retrieved correctly
```

### Dashboard ✅
```bash
✅ Super Admin Dashboard: Returns stats
✅ Regional Admin Dashboard: Returns stats
⚠️ Stats may be 0 because other tables failing
```

### Parks ⚠️
```bash
✅ List Parks (Super Admin): 200 OK
✅ List Parks (Regional Admin): 200 OK
❌ Create Park: 500 Error (need to check why)
```

### Flora/Fauna/Activities/Articles/Galleries ❌
```bash
❌ All returning 500 Error
Root Cause: Schema mismatch
- Field names different
- Missing columns
- Type mismatches
```

---

## 🎯 DECISION NEEDED

**Question for User**: 

Bagaimana kita handle schema mismatch ini?

**A. Fresh Railway Setup** (Fastest - 30 mins)
- Drop & recreate Railway tables dengan schema yang benar
- Lose existing Railway data (if any)
- Clean start

**B. Migrate Railway Schema** (Medium - 1-2 hours)
- Keep existing Railway data
- Run ALTER TABLE migrations
- Safer but slower

**C. Update Backend Code** (Slowest - 3-4 hours)
- Keep Railway schema as-is
- Update 20+ backend files
- More work but Railway stays unchanged

---

## 📝 FILES MODIFIED SO FAR

1. **`apps/backend/users/models.py`**
   - ✅ Added `wilayah` and `full_name` columns
   - ✅ Added compatibility layer for `region_code`
   - ✅ Works with both local and Railway DB

2. **`apps/backend/.env`**
   - ✅ Updated to Railway connection string

3. **Backend Restart**
   - ✅ Running with Railway database

---

## 🔜 NEXT STEPS

### If Option A (Fresh Setup) - RECOMMENDED
```bash
# 1. Backup Railway (if needed)
pg_dump postgresql://postgres:...@maglev.proxy.rlwy.net:26951/railway > railway_backup.sql

# 2. Drop all tables
psql postgresql://postgres:...@maglev.proxy.rlwy.net:26951/railway
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

# 3. Run Alembic migrations
cd apps/backend
alembic upgrade head

# 4. Seed data
python scripts/seed_demo_data.py

# 5. Test
./test_all_endpoints.sh
```

### If Option B (Migrate Schema)
```bash
# Run migration SQL
psql postgresql://postgres:...@maglev.proxy.rlwy.net:26951/railway < fix_railway_schema.sql

# Test
./test_all_endpoints.sh
```

---

## ✅ WHAT'S CONFIRMED WORKING

- ✅ Railway PostgreSQL 17.6 connection
- ✅ Authentication with both admin accounts
- ✅ User model compatibility layer
- ✅ Dashboard endpoints
- ✅ Parks listing (read-only)
- ✅ Database structure (tables exist)

---

## ❌ WHAT NEEDS FIXING

- ❌ Flora/Fauna field names
- ❌ Missing `is_endemic` column
- ❌ Activities/Articles/Galleries schema
- ❌ Parks create endpoint
- ❌ All CRUD operations for flora/fauna

---

## 📊 IMPACT ASSESSMENT

### High Impact (Blocks Everything)
- Schema mismatch prevents CRUD operations
- Cannot create/update flora/fauna
- Cannot test regional admin filtering properly

### Medium Impact
- Dashboard works but shows incorrect stats
- Authentication works fine
- Can list parks but not create

### Low Impact
- Frontend not affected yet (no data to display anyway)
- Can be fixed with migration

---

**Recommendation**: **Option A (Fresh Railway Setup)** adalah yang tercepat dan paling bersih.

Jika ada data penting di Railway yang perlu dipertahankan, pilih **Option B (Migrate Schema)**.

**Time Estimate**:
- Option A: 30 minutes
- Option B: 1-2 hours  
- Option C: 3-4 hours

---

**Status**: ⚠️ **WAITING FOR DECISION**  
**Next Action**: Choose migration strategy  
**Backend**: 🟡 **PARTIALLY WORKING**  
**Database**: 🔴 **SCHEMA MISMATCH**

