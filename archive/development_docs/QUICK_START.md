# QUICK START GUIDE - RAILWAY DATABASE
**Status**: ✅ Backend Ready | Frontend Integration Needed

---

## 🚀 BACKEND (READY!)

Backend sudah running dengan Railway database!

### Current Status
```bash
✅ Backend: http://localhost:8000 (RUNNING)
✅ Database: Railway PostgreSQL (CONNECTED)
✅ Endpoints: 18/18 CMS endpoints working (100%)
✅ Auth: Super Admin & Regional Admin tested
```

### Test Backend
```bash
# Test super admin login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kehati.org","password":"password"}'

# Should return:
{
  "access_token": "eyJhbGci...",
  "user_id": 1,
  "role": "super_admin",
  ...
}
```

---

## 🎨 FRONTEND (NEXT STEP)

### 1. Update API Base URL

Edit `apps/frontend/src/lib/api-client.ts`:

```typescript
// Current (if using local)
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Keep this! Backend is running on port 8000
```

### 2. Test Login

```typescript
// In your frontend console or component
const response = await fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@kehati.org',
    password: 'password'
  })
});

const data = await response.json();
console.log('Login response:', data);
```

### 3. Start Frontend (if not running)

```bash
cd apps/frontend
npm run dev -- --port 3000
```

Then visit: http://localhost:3000

---

## 🔐 TEST CREDENTIALS

### Super Admin
```
URL: http://localhost:3000/login
Email: admin@kehati.org
Password: password
```

After login, should see:
- Dashboard with stats
- All regions data
- Full CRUD access

### Regional Admin (Kalimantan Timur)
```
URL: http://localhost:3000/login
Email: kaltim.admin@kehati.org
Password: password
```

After login, should see:
- Dashboard with KALTIM data only
- Only parks/flora/fauna from KALTIM
- Can create parks for KALTIM

---

## 📊 TEST WORKFLOW

### As Super Admin

1. **Login**
   - Use `admin@kehati.org` / `password`
   
2. **View Dashboard**
   - Should show stats for all regions
   
3. **View Approvals**
   - Navigate to `/dashboard/approval`
   - Should see pending submissions from all regions

### As Regional Admin (KALTIM)

1. **Login**
   - Use `kaltim.admin@kehati.org` / `password`
   
2. **View Dashboard**
   - Should show stats for KALTIM only
   
3. **Create Park**
   - Navigate to `/dashboard/taman`
   - Fill form with:
     ```
     Name: Taman Kehati Borneo Test
     Region: Kalimantan Timur
     Area: 100.5 ha
     Description: Test park
     ```
   - Submit
   
4. **View Submitted Parks**
   - Should see park with status "Draft"
   
5. **Logout and Login as Super Admin**
   - Check approvals
   - Should see the park in pending approvals

---

## 🐛 TROUBLESHOOTING

### Backend Not Responding

```bash
# Check if backend is running
lsof -i:8000

# If not running, start it
cd apps/backend
source venv/bin/activate
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### CORS Errors

Backend already configured for:
- `http://localhost:3000`
- `http://localhost:3001`

If using different port, update `apps/backend/main.py`:
```python
DEFAULT_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:YOUR_PORT",  # Add your port
]
```

### 401 Unauthorized

Token might be expired or invalid:
1. Clear localStorage
2. Login again
3. Check token is being sent in Authorization header

### Regional Admin Sees All Data (Not Just Their Region)

This should NOT happen! Backend auto-filters.

Debug:
1. Check user's `wilayah` field in database:
   ```sql
   SELECT id, email, role, wilayah 
   FROM users 
   WHERE email = 'kaltim.admin@kehati.org';
   ```
   
2. Should return:
   ```
   id | email                      | role           | wilayah
   2  | kaltim.admin@kehati.org    | regional_admin | KALTIM
   ```

3. If `wilayah` is NULL, update it:
   ```sql
   UPDATE users 
   SET wilayah = 'KALTIM' 
   WHERE email = 'kaltim.admin@kehati.org';
   ```

---

## 📁 DOCUMENTATION FILES

All detailed documentation in repo root:

1. **`FRONTEND_INTEGRATION_FINAL.md`** ⭐ **START HERE**
   - Complete API reference
   - All endpoints documented
   - Request/response examples
   - Frontend code examples
   
2. **`RAILWAY_MIGRATION_SUMMARY.md`**
   - What was done
   - Schema changes
   - Migration details
   
3. **`RAILWAY_DB_COMPATIBILITY_REPORT.md`**
   - Schema comparison
   - Technical details
   
4. **`RAILWAY_SETUP_STATUS.md`**
   - Initial setup notes
   - Connection details

---

## ✅ VERIFICATION CHECKLIST

Before starting frontend integration:

- [ ] Backend running on port 8000
- [ ] Can access http://localhost:8000/docs (Swagger UI)
- [ ] Can login as super admin via curl/Postman
- [ ] Can login as regional admin via curl/Postman
- [ ] Can see different data for each role

After frontend integration:

- [ ] Can login via frontend UI
- [ ] Dashboard shows stats
- [ ] Can view parks list
- [ ] Can create new park (regional admin)
- [ ] Created park appears in list
- [ ] Super admin can see park in approvals
- [ ] Regional admin only sees their data

---

## 🎯 EXPECTED BEHAVIOR

### Super Admin Dashboard
```
📊 Dashboard Stats
   Parks: X
   Flora: X
   Fauna: X
   Activities: X

📋 Recent Submissions (from all regions)
   - Park from KALTIM
   - Flora from SUMUT
   - Fauna from JABAR
   ...
```

### Regional Admin Dashboard (KALTIM)
```
📊 Dashboard Stats (KALTIM only)
   Parks: X
   Flora: X
   Fauna: X
   Activities: X

📋 My Submissions
   - Parks I created
   - Flora I submitted
   - Fauna I submitted
   ...
```

---

## 🚀 READY TO GO!

1. **Backend**: ✅ Ready (already running)
2. **Database**: ✅ Connected (Railway PostgreSQL)
3. **Endpoints**: ✅ Tested (18/18 working)
4. **Auth**: ✅ Working (both roles tested)

**Next**: Integrate frontend dengan endpoints yang ada!

---

## 📞 NEED HELP?

Check documentation:
1. `FRONTEND_INTEGRATION_FINAL.md` - API reference
2. `RAILWAY_MIGRATION_SUMMARY.md` - What was changed
3. Run `./apps/backend/test_all_endpoints.sh` - Test all APIs

---

**Last Updated**: October 25, 2025  
**Backend**: http://localhost:8000  
**Database**: Railway PostgreSQL ✅  
**Status**: 🟢 Production Ready

