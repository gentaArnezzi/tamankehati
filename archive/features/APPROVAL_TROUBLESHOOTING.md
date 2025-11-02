# 🔧 Approval Dashboard Troubleshooting

## Issue Report

**Problem**: Dashboard super admin tidak nerima approval apa-apa setelah cascade approval implementation.

## Root Cause Analysis

Possible causes:
1. **Backend needs restart** - Code changes require server restart
2. **Frontend caching** - Browser caching old data
3. **Import error** - New imports not loaded
4. **Database state** - No pending approvals in database

## Solution Steps

### Step 1: Restart Backend Server ⚠️ IMPORTANT

Backend perlu di-restart setelah perubahan code:

```bash
cd /Users/irgyaarnezzi/Desktop/tamankehati_new/apps/backend

# Stop backend
./stop.sh
# or
pkill -f "python.*main.py"

# Start backend
./start.sh
# or
python main.py
```

### Step 2: Clear Browser Cache

```
1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to Network tab
3. Check "Disable cache"
4. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### Step 3: Verify Backend is Running

```bash
# Check if backend is running
curl http://localhost:8000/health
# Expected: {"status": "ok"}

# Check API docs
open http://localhost:8000/docs
```

### Step 4: Check Database for Pending Approvals

```sql
-- Check flora pending approvals
SELECT id, scientific_name, status, submitted_at
FROM flora
WHERE status = 'in_review'
ORDER BY submitted_at DESC
LIMIT 5;

-- Check fauna pending approvals
SELECT id, scientific_name, status, submitted_at
FROM fauna
WHERE status = 'in_review'
ORDER BY submitted_at DESC
LIMIT 5;

-- Check article pending approvals
SELECT id, title, status, submitted_at
FROM articles
WHERE status = 'in_review' AND deleted_at IS NULL
ORDER BY submitted_at DESC
LIMIT 5;

-- Check gallery pending approvals
SELECT id, title, status, entity_type, entity_id, created_at
FROM galleries
WHERE status IN ('draft', 'in_review')
ORDER BY created_at DESC
LIMIT 5;
```

### Step 5: Test Approvals Endpoint Directly

```bash
# Test without auth (should return 401)
curl http://localhost:8000/api/v1/approvals

# Test with auth (need token)
curl http://localhost:8000/api/v1/approvals \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 6: Check Frontend Console

```
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors related to:
   - API calls failing
   - Authorization errors
   - Network errors
```

### Step 7: Verify Code Changes

Check that the files were properly saved:

```bash
cd /Users/irgyaarnezzi/Desktop/tamankehati_new/apps/backend

# Check flora.py has the new imports
grep -n "from domains.galleries.models import Gallery, GalleryStatus" api/v1/routes/flora.py

# Check fauna.py has the new imports
grep -n "from domains.galleries.models import Gallery, GalleryStatus" api/v1/routes/fauna.py

# Check if cascade approval code exists
grep -A 5 "Cascade approve" api/v1/routes/flora.py
```

## Quick Fix Commands

### Option 1: Full Restart

```bash
# Backend
cd /Users/irgyaarnezzi/Desktop/tamankehati_new/apps/backend
./stop.sh && sleep 2 && ./start.sh

# Frontend (if needed)
cd /Users/irgyaarnezzi/Desktop/tamankehati_new/apps/frontend
# Ctrl+C to stop
npm run dev
```

### Option 2: Check Logs

```bash
# Backend logs
tail -f /Users/irgyaarnezzi/Desktop/tamankehati_new/apps/backend/backend.log

# Frontend logs
# Check terminal where npm run dev is running
```

## Testing After Restart

### 1. Create Test Approval

```bash
# As regional_admin, create and submit a flora
curl -X POST http://localhost:8000/api/v1/flora \
  -H "Authorization: Bearer REGIONAL_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_ilmiah": "Test Approval Species",
    "status": "draft"
  }'

# Submit for review
curl -X POST http://localhost:8000/api/v1/flora/{id}/submit \
  -H "Authorization: Bearer REGIONAL_ADMIN_TOKEN"
```

### 2. Check Approvals Dashboard

```
1. Login as super_admin
2. Go to dashboard
3. Check "Persetujuan" or "Approvals" section
4. Should see "Test Approval Species" in pending list
```

### 3. Test Approval Flow

```
1. Click "Approve" on test flora
2. Check backend logs for: "✅ Flora X approved. Auto-approved N galleries."
3. Verify flora is now visible in public page
4. If flora had galleries, verify they're also visible
```

## Common Issues & Solutions

### Issue 1: "No pending approvals"

**Cause**: No items in `in_review` status

**Solution**:
```sql
-- Create test data
INSERT INTO flora (scientific_name, status, submitted_by, submitted_at)
VALUES ('Test Species', 'in_review', 1, NOW());
```

### Issue 2: "Unauthorized" in API calls

**Cause**: Token expired or invalid

**Solution**:
1. Logout and login again
2. Check if auth token is stored: `localStorage.getItem('auth_token')`
3. Refresh token if needed

### Issue 3: Backend not loading new code

**Cause**: Python is caching old .pyc files

**Solution**:
```bash
cd /Users/irgyaarnezzi/Desktop/tamankehati_new/apps/backend

# Remove cached files
find . -type d -name "__pycache__" -exec rm -r {} + 2>/dev/null
find . -type f -name "*.pyc" -delete

# Restart backend
python main.py
```

### Issue 4: Import errors after changes

**Cause**: New imports not found

**Solution**:
```bash
# Verify imports exist
python3 -c "from domains.galleries.models import Gallery, GalleryStatus; print('OK')"

# If error, check if file exists
ls -la domains/galleries/models.py
```

## Verification Checklist

After restart, verify:

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Can login as super_admin
- [ ] Dashboard loads without errors
- [ ] Approvals section visible
- [ ] Can see pending items (if any exist)
- [ ] Can approve items
- [ ] Cascade approval works (galleries auto-approved)
- [ ] Approved items visible in public page

## Expected Behavior After Fix

### When Super Admin Approves Flora:

```
1. Click "Approve" on flora
   ↓
2. Backend processes:
   - Flora status → 'approved' ✅
   - Find all draft/in_review galleries for this flora
   - Gallery status → 'approved' ✅
   - Commit transaction
   ↓
3. Console log shows:
   "✅ Flora 123 approved. Auto-approved 5 galleries."
   ↓
4. Frontend shows:
   - Flora moves from "Pending" to "Approved"
   - Success notification
   ↓
5. Public page:
   - Flora visible immediately
   - Galleries visible immediately
```

## Contact & Support

If issue persists after following all steps:

1. **Check backend logs** for specific error messages
2. **Share error logs** for debugging
3. **Verify database** has correct schema
4. **Test API endpoints** directly with curl/Postman

## Prevention for Future

To avoid similar issues:

1. **Always restart backend** after code changes
2. **Clear browser cache** during development
3. **Check backend logs** after deployment
4. **Test critical flows** after updates
5. **Keep backup** of working state

## Quick Commands Reference

```bash
# Restart backend
cd apps/backend && ./stop.sh && ./start.sh

# Clear Python cache
find . -name "*.pyc" -delete && find . -name "__pycache__" -type d -delete

# Check backend health
curl http://localhost:8000/health

# View backend logs
tail -f apps/backend/backend.log

# Test approvals endpoint
curl http://localhost:8000/api/v1/approvals -H "Authorization: Bearer TOKEN"

# Check database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM flora WHERE status = 'in_review';"
```

## TL;DR - Most Likely Fix

**99% of the time, the issue is:**

```bash
# Backend needs restart after code changes
cd /Users/irgyaarnezzi/Desktop/tamankehati_new/apps/backend
./stop.sh
./start.sh
```

Then refresh browser with hard reload (Cmd+Shift+R).

That's it! 🎉

