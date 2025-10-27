# 🚀 QUICK START GUIDE
## Testing Role-Based Dashboard System

**Tanggal**: 25 Oktober 2025  
**Status**: ✅ Ready for Testing

---

## ⚡ QUICK START (5 Minutes)

### **1. Start Backend** (Terminal 1)
```bash
cd apps/backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### **2. Start Frontend** (Terminal 2)
```bash
cd apps/frontend
npm run dev
```

### **3. Access Dashboard**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 👤 TEST ACCOUNTS

### **Super Admin** 👑
```
Email: admin@kehati.org
Password: password
Role: super_admin
```

**Menu yang Tersedia**:
- 📊 Dashboard
- 👥 Manajemen Pengguna
- ✅ Persetujuan (Approval Queue)
- 📢 Pengumuman
- 📰 Artikel & Berita

**Menu yang TIDAK ADA** (sesuai requirement):
- ❌ Flora
- ❌ Fauna
- ❌ Taman
- ❌ Kegiatan

---

### **Regional Admin - KALTIM** 🌲
```
Email: kaltim.admin@kehati.org
Password: password
Role: regional_admin
Wilayah: Kalimantan Timur
```

**Menu yang Tersedia**:
- 📊 Dashboard
- 🏞️ Taman & Zona
- 🌿 Flora
- 🦜 Fauna
- 📅 Kegiatan

**Menu yang TIDAK ADA** (sesuai requirement):
- ❌ Manajemen Pengguna
- ❌ Persetujuan
- ❌ Pengumuman
- ❌ Artikel & Berita

---

### **Regional Admin - SUMUT** 🌴
```
Email: sumut.admin@kehati.org
Password: password
Role: regional_admin
Wilayah: Sumatera Utara
```

---

## 🧪 TEST SCENARIOS

### **Scenario 1: Regional Admin Submit Park** 🏞️

#### **Step 1: Login as Regional Admin**
1. Go to http://localhost:3000/login
2. Login dengan `kaltim.admin@kehati.org` / `password`
3. Verify dashboard shows **only** regional admin menus

#### **Step 2: Create New Park**
1. Click **"Taman & Zona"** di sidebar
2. Isi form:
   - Nama: "Taman Nasional Kutai"
   - Region: Kalimantan Timur
   - Area: 198629 (ha)
   - SK Penetapan: "SK Menteri No. 123/2024"
   - Pengelola: "BKSDA Kalimantan Timur"
   - Description: "Taman nasional tertua di Kalimantan Timur"
3. Click **"Submit"**
4. ✅ **Expected**: Toast success message
5. ✅ **Expected**: Park appears in table with status **"Draft"** or **"In Review"**

#### **Step 3: Verify Park is Own Data**
1. Stay logged in as `kaltim.admin@kehati.org`
2. Verify park appears in your list
3. Logout and login as `sumut.admin@kehati.org`
4. ✅ **Expected**: Park **TIDAK MUNCUL** di SUMUT admin list
5. ✅ **Expected**: SUMUT admin only sees their own parks (if any)

---

### **Scenario 2: Super Admin Approve Park** ✅

#### **Step 1: Logout and Login as Super Admin**
1. Logout from regional admin account
2. Login dengan `admin@kehati.org` / `password`
3. ✅ **Expected**: Dashboard shows super admin menus
4. ✅ **Expected**: NO Flora/Fauna/Taman menus in sidebar

#### **Step 2: Go to Approval Queue**
1. Click **"Persetujuan"** di sidebar
2. Click **"Taman"** tab
3. ✅ **Expected**: See the park submitted by KALTIM admin
4. ✅ **Expected**: Park shows status **"In Review"** or **"Draft"**

#### **Step 3: Approve Park**
1. Click **"Setujui"** button on the park
2. Confirm approval in dialog
3. ✅ **Expected**: Toast success message
4. ✅ **Expected**: Park disappears from approval queue (or status changes)

#### **Step 4: Verify in Regional Admin**
1. Logout and login back as `kaltim.admin@kehati.org`
2. Go to **"Taman & Zona"**
3. ✅ **Expected**: Park status now shows **"Approved"** 🟢

---

### **Scenario 3: Super Admin Reject Park** ❌

#### **Step 1: Regional Admin Submit Another Park**
1. Login as `kaltim.admin@kehati.org`
2. Create another park: "Taman Nasional Balikpapan"
3. Submit park

#### **Step 2: Super Admin Reject**
1. Login as `admin@kehati.org`
2. Go to **"Persetujuan"** → **"Taman"** tab
3. Click **"Tolak"** button
4. Enter rejection reason: "Data belum lengkap, mohon tambahkan foto dan peta lokasi"
5. Confirm rejection
6. ✅ **Expected**: Toast success message

#### **Step 3: Verify Rejection**
1. Login back as `kaltim.admin@kehati.org`
2. Go to **"Taman & Zona"**
3. ✅ **Expected**: Park status shows **"Rejected"** 🔴
4. ✅ **Expected**: Rejection reason visible
5. Regional admin can edit and re-submit

---

### **Scenario 4: Test Flora/Fauna Approval** 🌿🦜

#### **Step 1: Regional Admin Add Flora**
1. Login as `kaltim.admin@kehati.org`
2. Go to **"Flora"**
3. Create new flora:
   - Scientific Name: "Rafflesia arnoldii"
   - Local Name: "Bunga Bangkai"
   - Park: Select from your approved parks
   - Status: Will auto-set to "in_review"
4. Submit flora

#### **Step 2: Super Admin Approve Flora**
1. Login as `admin@kehati.org`
2. Go to **"Persetujuan"** → **"Flora"** tab
3. ✅ **Expected**: See the flora submitted by KALTIM admin
4. Click **"Setujui"**
5. ✅ **Expected**: Flora approved successfully

#### **Step 3: Verify in Regional Admin**
1. Login back as `kaltim.admin@kehati.org`
2. Go to **"Flora"**
3. ✅ **Expected**: Flora status shows **"Approved"** 🟢

---

### **Scenario 5: Test Access Control** 🔐

#### **Test 1: Regional Admin Cannot Access Super Admin Pages**
1. Login as `kaltim.admin@kehati.org`
2. Try to access: http://localhost:3000/dashboard/users
3. ✅ **Expected**: Should NOT see menu in sidebar
4. ✅ **Expected**: Direct URL access should redirect or show 403/404

#### **Test 2: Super Admin Cannot Access Regional Admin Pages**
1. Login as `admin@kehati.org`
2. Try to access: http://localhost:3000/dashboard/taman
3. ✅ **Expected**: Should NOT see menu in sidebar
4. ✅ **Expected**: Direct URL access should redirect or show 403/404

#### **Test 3: Regional Admin Cannot See Other Admin's Data**
1. Login as `kaltim.admin@kehati.org`
2. Create a park
3. Logout and login as `sumut.admin@kehati.org`
4. Go to **"Taman & Zona"**
5. ✅ **Expected**: KALTIM admin's park **NOT VISIBLE**
6. ✅ **Expected**: Only SUMUT admin's own parks visible

---

## 📊 VERIFICATION CHECKLIST

### **Super Admin Dashboard** ✅
- [ ] Login successful
- [ ] Sidebar shows: Dashboard, Users, Approval, Announcement, Article
- [ ] Sidebar does NOT show: Flora, Fauna, Taman, Activities
- [ ] Approval queue accessible
- [ ] Can see all pending submissions from all regions
- [ ] Can approve parks
- [ ] Can reject parks with reason
- [ ] Can approve flora
- [ ] Can approve fauna
- [ ] Can approve activities

### **Regional Admin Dashboard** ✅
- [ ] Login successful (KALTIM)
- [ ] Login successful (SUMUT)
- [ ] Sidebar shows: Dashboard, Taman, Flora, Fauna, Kegiatan
- [ ] Sidebar does NOT show: Users, Approval, Announcement, Article
- [ ] Can create parks
- [ ] Can only see own parks
- [ ] Cannot see other admin's parks
- [ ] Can create flora (in own parks)
- [ ] Can create fauna (in own parks)
- [ ] Can create activities (in own parks)
- [ ] Can edit own data
- [ ] Cannot edit other admin's data

### **Approval Flow** ✅
- [ ] Regional admin submission → status "draft" or "in_review"
- [ ] Park appears in super admin approval queue
- [ ] Super admin can approve → status "approved"
- [ ] Super admin can reject → status "rejected" + reason
- [ ] Regional admin sees updated status
- [ ] Regional admin can re-submit rejected data

---

## 🐛 TROUBLESHOOTING

### **Backend not starting**
```bash
# Kill existing process
lsof -ti:8000 | xargs kill -9

# Restart
cd apps/backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### **Frontend not starting**
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Restart
cd apps/frontend
npm run dev
```

### **Login fails**
```bash
# Check database connection
psql postgresql://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway

# Verify user exists
SELECT id, email, role FROM users WHERE email = 'admin@kehati.org';
```

### **Parks not appearing in approval queue**
```bash
# Check park status
psql postgresql://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway -c "SELECT id, name, status, created_by FROM parks ORDER BY id DESC LIMIT 10;"

# Parks should have status 'draft' or 'in_review' to appear in queue
```

### **CORS errors**
```bash
# Verify backend CORS config in apps/backend/main.py
# Should include: http://localhost:3000, http://localhost:3001

# Restart backend after changes
```

---

## 📝 KNOWN ISSUES & LIMITATIONS

### **Phase 1 Complete** ✅
1. ✅ Sidebar menus separated by role
2. ✅ Approve/reject endpoints working
3. ✅ Regional admin data filtering working

### **Phase 2 Pending** ⏳
1. ⏳ No status badges yet (will show text only)
2. ⏳ Dashboard summary stats not implemented yet
3. ⏳ User Management page not implemented yet
4. ⏳ Announcement page not functional yet
5. ⏳ Article page needs review
6. ⏳ No route guards yet (direct URL access not blocked)
7. ⏳ No notifications yet

---

## 🎯 SUCCESS CRITERIA

### **✅ PASS if**:
1. Super admin can login and see correct menus
2. Regional admin can login and see correct menus
3. Regional admin can create parks
4. Regional admin only sees own data
5. Super admin can see all pending submissions
6. Super admin can approve/reject from approval queue
7. Status updates correctly after approval/rejection

### **❌ FAIL if**:
1. Regional admin can see other admin's data
2. Regional admin can access super admin pages
3. Super admin can access Flora/Fauna/Taman pages via sidebar
4. Approval/rejection doesn't update status
5. CORS errors prevent API calls

---

## 📞 SUPPORT

**Issues or Questions?**
- Check `FLOW_AND_DASHBOARD_DESIGN.md` for complete flow documentation
- Check `IMPLEMENTATION_SUMMARY.md` for technical details
- Check `BACKEND_API_REPORT.md` for API endpoints

**Database Access**:
```bash
# Railway PostgreSQL
psql postgresql://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway
```

---

**Ready to test!** 🚀  
**Last Updated**: 25 Oktober 2025, 16:00 WIB

