# 🔍 DASHBOARD INTEGRATION VERIFICATION
## Complete Frontend-Backend Integration Check

**Tanggal**: 25 Oktober 2025, 18:30 WIB  
**Status**: 🔍 In Progress

---

## 📋 TABLE OF CONTENTS

1. [Super Admin Dashboard](#super-admin-dashboard)
2. [Regional Admin Dashboard](#regional-admin-dashboard)
3. [Workflow Verification](#workflow-verification)
4. [UI Action → API Endpoint Mapping](#ui-action--api-endpoint-mapping)
5. [Issues & Fixes](#issues--fixes)

---

## 👑 SUPER ADMIN DASHBOARD

### **Page 1: Dashboard (Home)** 📊

**URL**: `/dashboard`  
**Component**: `apps/frontend/src/app/dashboard/page.tsx`

**Expected Data**:
- Total users count
- Total pending approvals
- Recent activity summary
- Statistics per region

**API Endpoints Used**:
```
GET /api/v1/dashboard/
GET /api/v1/approvals/?limit=10
```

**Status**: ⏳ Need to verify

---

### **Page 2: Manajemen Pengguna** 👥

**URL**: `/dashboard/users`  
**Component**: `apps/frontend/src/app/dashboard/users/page.tsx`

**Expected Features**:
- ✅ List all users (super_admin, regional_admin)
- ✅ Create new regional admin
- ✅ Edit user details
- ✅ Deactivate/activate users
- ✅ Filter by role

**UI Actions → API Endpoints**:
```
Action: Load Users List
→ GET /api/v1/users/?limit=100&offset=0

Action: Create New User
→ POST /api/v1/users/
   Body: { email, password, role, wilayah, full_name }

Action: Update User
→ PUT /api/v1/users/{user_id}
   Body: { is_active, role, full_name }

Action: Delete User
→ DELETE /api/v1/users/{user_id}
```

**Status**: ⏳ Need to verify endpoint exists

---

### **Page 3: Persetujuan (Approval Queue)** ✅

**URL**: `/dashboard/approval`  
**Component**: `apps/frontend/src/components/approval/ApprovalPage.tsx`

**Expected Features**:
- ✅ Tabs: All, Taman, Flora, Fauna, Kegiatan, Artikel, Galeri
- ✅ List pending items (status = draft OR in_review)
- ✅ Preview item details
- ✅ Approve button with confirmation
- ✅ Reject button with reason input

**UI Actions → API Endpoints**:
```
Action: Load Approval Queue
→ GET /api/v1/approvals/?limit=200

Action: Approve Taman
→ POST /api/v1/crud/parks/{id}/approve

Action: Reject Taman
→ POST /api/v1/crud/parks/{id}/reject
   Body: { rejection_reason: "..." }

Action: Approve Flora
→ POST /api/v1/flora/{id}/approve

Action: Reject Flora
→ POST /api/v1/flora/{id}/reject
   Body: { reason: "..." }

Action: Approve Fauna
→ POST /api/v1/fauna/{id}/approve

Action: Reject Fauna
→ POST /api/v1/fauna/{id}/reject
   Body: { reason: "..." }

Action: Approve Activities
→ POST /api/v1/activities/{id}/approve

Action: Reject Activities
→ POST /api/v1/activities/{id}/reject
   Body: { reason: "..." }
```

**Status**: ✅ Already implemented and tested

---

### **Page 4: Pengumuman** 📢

**URL**: `/dashboard/announcement`  
**Component**: `apps/frontend/src/app/dashboard/announcement/page.tsx`

**Expected Features**:
- ✅ List announcements
- ✅ Create new announcement
- ✅ Edit announcement
- ✅ Delete announcement
- ✅ Set visibility (Public/Regional)

**UI Actions → API Endpoints**:
```
Action: Load Announcements
→ GET /api/v1/announcements/?limit=100

Action: Create Announcement
→ POST /api/v1/announcements/
   Body: { title, content, visibility }

Action: Update Announcement
→ PUT /api/v1/announcements/{id}
   Body: { title, content, visibility }

Action: Delete Announcement
→ DELETE /api/v1/announcements/{id}
```

**Status**: ⏳ Need to verify endpoints exist

---

### **Page 5: Artikel & Berita** 📰

**URL**: `/dashboard/taman/berita`  
**Component**: `apps/frontend/src/app/dashboard/taman/berita/page.tsx`

**Expected Features**:
- ✅ List articles
- ✅ Create new article
- ✅ Edit article
- ✅ Delete article
- ✅ Rich text editor
- ✅ Upload images

**UI Actions → API Endpoints**:
```
Action: Load Articles
→ GET /api/v1/articles/?limit=100

Action: Create Article
→ POST /api/v1/articles/
   Body: { title, content, category, status }

Action: Update Article
→ PUT /api/v1/articles/{id}
   Body: { title, content, category, status }

Action: Delete Article
→ DELETE /api/v1/articles/{id}
```

**Status**: ⏳ Need to verify endpoints exist

---

## 🌍 REGIONAL ADMIN DASHBOARD

### **Page 1: Dashboard (Home)** 📊

**URL**: `/dashboard`  
**Component**: `apps/frontend/src/app/dashboard/page.tsx`

**Expected Data**:
- Total parks (own)
- Total flora (own)
- Total fauna (own)
- Total activities (own)
- Status breakdown (draft/in_review/approved/rejected)

**API Endpoints Used**:
```
GET /api/v1/crud/parks/?created_by={user_id}
GET /api/v1/flora/?submitted_by={user_id}
GET /api/v1/fauna/?submitted_by={user_id}
GET /api/v1/activities/?created_by={user_id}
```

**Status**: ⏳ Need to verify dashboard shows own data only

---

### **Page 2: Taman & Zona** 🏞️

**URL**: `/dashboard/taman`  
**Component**: `apps/frontend/src/components/taman/TamanSubmissionPage.tsx`

**Expected Features**:
- ✅ Form to create new park
- ✅ List of submitted parks (own only)
- ✅ Status badges (Draft, In Review, Approved, Rejected)
- ✅ Edit park (if draft/rejected)
- ✅ View park details

**UI Actions → API Endpoints**:
```
Action: Load My Parks
→ GET /api/v1/crud/parks/
   (Backend auto-filters by created_by = user.id)

Action: Create Park
→ POST /api/v1/crud/parks/
   Body: {
     name, region_id, area_ha, description,
     sk_penetapan, pengelola, kondisi_fisik,
     nilai_penting, tipe_ekoregion, ...
   }
   (Backend auto-sets created_by = user.id)

Action: Update Park
→ PUT /api/v1/crud/parks/{id}
   Body: { name, description, ... }
   (Backend checks ownership)

Action: Delete Park
→ DELETE /api/v1/crud/parks/{id}
   (Backend checks ownership)
```

**Status**: ✅ Already implemented and tested

---

### **Page 3: Flora** 🌿

**URL**: `/dashboard/taman/flora`  
**Component**: `apps/frontend/src/components/flora/FloraPage.tsx`

**Expected Features**:
- ✅ List flora (own parks only)
- ✅ Create new flora
- ✅ Edit flora (if not approved)
- ✅ Delete flora (if not approved)
- ✅ Filter by park
- ✅ Upload images

**UI Actions → API Endpoints**:
```
Action: Load My Flora
→ GET /api/v1/flora/?submitted_by={user_id}
   (Backend auto-filters by region)

Action: Create Flora
→ POST /api/v1/flora/
   Body: {
     scientific_name, local_name, park_id,
     family, genus, description, is_endemic, ...
   }
   (Backend validates park ownership)
   (Backend auto-sets submitted_by = user.id)
   (Backend auto-sets status = "in_review")

Action: Update Flora
→ PUT /api/v1/flora/{id}
   Body: { description, ... }
   (Backend checks ownership)
   (Backend prevents if status = "approved")

Action: Delete Flora
→ DELETE /api/v1/flora/{id}
   (Backend checks ownership)
   (Backend prevents if status = "approved")
```

**Status**: ✅ Security implemented, need to verify frontend

---

### **Page 4: Fauna** 🦜

**URL**: `/dashboard/taman/fauna`  
**Component**: `apps/frontend/src/components/fauna/FaunaPage.tsx`

**Expected Features**:
- ✅ List fauna (own parks only)
- ✅ Create new fauna
- ✅ Edit fauna (if not approved)
- ✅ Delete fauna (if not approved)
- ✅ Filter by park
- ✅ Upload images

**UI Actions → API Endpoints**:
```
Action: Load My Fauna
→ GET /api/v1/fauna/?submitted_by={user_id}
   (Backend auto-filters by region)

Action: Create Fauna
→ POST /api/v1/fauna/
   Body: {
     scientific_name, local_name, park_id,
     ordo, description, habitat_sumber_makanan, ...
   }
   (Backend validates park ownership)
   (Backend auto-sets submitted_by = user.id)
   (Backend auto-sets status = "in_review")

Action: Update Fauna
→ PUT /api/v1/fauna/{id}
   Body: { description, ... }
   (Backend checks ownership)
   (Backend prevents if status = "approved")

Action: Delete Fauna
→ DELETE /api/v1/fauna/{id}
   (Backend checks ownership)
   (Backend prevents if status = "approved")
```

**Status**: ✅ Security implemented, need to verify frontend

---

### **Page 5: Kegiatan** 📅

**URL**: `/dashboard/activities`  
**Component**: `apps/frontend/src/components/activities/ActivitiesPage.tsx`

**Expected Features**:
- ✅ List activities (own parks only)
- ✅ Create new activity
- ✅ Edit activity (if not approved)
- ✅ Delete activity (if not approved)
- ✅ Filter by park
- ✅ Upload photos

**UI Actions → API Endpoints**:
```
Action: Load My Activities
→ GET /api/v1/activities/?created_by={user_id}
   (Backend auto-filters by created_by)

Action: Create Activity
→ POST /api/v1/activities/
   Body: {
     title, description, activity_date,
     park_id, location, ...
   }
   (Backend auto-sets created_by = user.id)
   (Backend auto-sets status = "in_review")

Action: Update Activity
→ PUT /api/v1/activities/{id}
   Body: { title, description, ... }
   (Backend checks ownership)
   (Backend prevents if status = "approved")

Action: Delete Activity
→ DELETE /api/v1/activities/{id}
   (Backend checks ownership)
   (Backend prevents if status = "approved")
```

**Status**: ✅ Security implemented, need to verify frontend

---

## 🔄 WORKFLOW VERIFICATION

### **Complete Workflow: Regional Admin Submit → Super Admin Approve**

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Regional Admin Creates Park                            │
│ URL: /dashboard/taman                                           │
│ Action: Fill form and submit                                    │
│ API: POST /api/v1/crud/parks/                                   │
│ Result: Park created with status = "draft"                      │
│         created_by = user.id                                    │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Regional Admin Submits Park for Review                 │
│ URL: /dashboard/taman                                           │
│ Action: Click "Submit for Review"                               │
│ API: PUT /api/v1/crud/parks/{id}                                │
│      Body: { status: "in_review" }                              │
│ Result: Park status = "in_review"                               │
│         Appears in Super Admin approval queue                   │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Regional Admin Creates Flora                           │
│ URL: /dashboard/taman/flora                                     │
│ Action: Fill form and submit                                    │
│ API: POST /api/v1/flora/                                        │
│ Result: Flora created with status = "in_review"                 │
│         submitted_by = user.id                                  │
│         Appears in Super Admin approval queue                   │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Super Admin Views Approval Queue                       │
│ URL: /dashboard/approval                                        │
│ Action: Navigate to Approval page                               │
│ API: GET /api/v1/approvals/                                     │
│ Result: See all pending items:                                  │
│         - Taman (1 item)                                        │
│         - Flora (1 item)                                        │
└─────────────────────────────────────────────────────────────────┘
                           ↓
                    ┌──────┴──────┐
                    ↓             ↓
┌───────────────────────────┐  ┌────────────────────────────────┐
│ STEP 5a: Approve Park     │  │ STEP 5b: Reject Park           │
│ Action: Click "Setujui"   │  │ Action: Click "Tolak"          │
│ API: POST /api/v1/crud/   │  │ API: POST /api/v1/crud/        │
│      parks/{id}/approve   │  │      parks/{id}/reject         │
│ Result: status = "approved"│  │      Body: { rejection_reason }│
│         approved_by = admin│  │ Result: status = "rejected"    │
│         approved_at = now  │  │         rejection_reason saved │
└───────────────────────────┘  └────────────────────────────────┘
                    ↓                          ↓
┌───────────────────────────┐  ┌────────────────────────────────┐
│ STEP 6a: Regional Admin   │  │ STEP 6b: Regional Admin        │
│         Sees Approved      │  │         Sees Rejected          │
│ URL: /dashboard/taman     │  │ URL: /dashboard/taman          │
│ Result: Park badge = 🟢   │  │ Result: Park badge = 🔴        │
│         "Approved"         │  │         "Rejected" + reason    │
│         Cannot edit        │  │         Can edit & re-submit   │
└───────────────────────────┘  └────────────────────────────────┘
```

---

## 🔗 UI ACTION → API ENDPOINT MAPPING

### **Complete Mapping Table**

| Page | UI Action | HTTP Method | API Endpoint | Request Body | Response | Security Check |
|------|-----------|-------------|--------------|--------------|----------|----------------|
| **Super Admin** |
| Users | Load list | GET | `/api/v1/users/` | - | `{items: [...], total: N}` | ✅ super_admin only |
| Users | Create user | POST | `/api/v1/users/` | `{email, password, role, wilayah}` | `{id, email, role}` | ✅ super_admin only |
| Users | Update user | PUT | `/api/v1/users/{id}` | `{is_active, full_name}` | `{message: "..."}` | ✅ super_admin only |
| Users | Delete user | DELETE | `/api/v1/users/{id}` | - | `{message: "..."}` | ✅ super_admin only |
| Approval | Load queue | GET | `/api/v1/approvals/` | - | `{items: [...], counts: {...}}` | ✅ All pending items |
| Approval | Approve park | POST | `/api/v1/crud/parks/{id}/approve` | - | `{message, status}` | ✅ super_admin only |
| Approval | Reject park | POST | `/api/v1/crud/parks/{id}/reject` | `{rejection_reason}` | `{message, status}` | ✅ super_admin only |
| Approval | Approve flora | POST | `/api/v1/flora/{id}/approve` | - | `{message}` | ✅ super_admin only |
| Approval | Reject flora | POST | `/api/v1/flora/{id}/reject` | `{reason}` | `{message}` | ✅ super_admin only |
| Approval | Approve fauna | POST | `/api/v1/fauna/{id}/approve` | - | `{message}` | ✅ super_admin only |
| Approval | Reject fauna | POST | `/api/v1/fauna/{id}/reject` | `{reason}` | `{message}` | ✅ super_admin only |
| Approval | Approve activity | POST | `/api/v1/activities/{id}/approve` | - | `{message}` | ✅ super_admin only |
| Approval | Reject activity | POST | `/api/v1/activities/{id}/reject` | `{reason}` | `{message}` | ✅ super_admin only |
| **Regional Admin** |
| Taman | Load my parks | GET | `/api/v1/crud/parks/` | - | `[{id, name, status, ...}]` | ✅ Auto-filter by created_by |
| Taman | Create park | POST | `/api/v1/crud/parks/` | `{name, region_id, area_ha, ...}` | `{id, name, status}` | ✅ Validate region, auto-set created_by |
| Taman | Update park | PUT | `/api/v1/crud/parks/{id}` | `{name, description, ...}` | `{message}` | ✅ Check ownership, prevent if approved |
| Taman | Delete park | DELETE | `/api/v1/crud/parks/{id}` | - | `{message}` | ✅ Check ownership, prevent if approved |
| Flora | Load my flora | GET | `/api/v1/flora/` | - | `[{id, scientific_name, ...}]` | ✅ Auto-filter by region |
| Flora | Create flora | POST | `/api/v1/flora/` | `{scientific_name, park_id, ...}` | `{id, scientific_name}` | ✅ Validate park ownership, auto-set submitted_by |
| Flora | Update flora | PUT | `/api/v1/flora/{id}` | `{description, ...}` | `{message}` | ✅ Check ownership, prevent if approved |
| Flora | Delete flora | DELETE | `/api/v1/flora/{id}` | - | `{message}` | ✅ Check ownership, prevent if approved |
| Fauna | Load my fauna | GET | `/api/v1/fauna/` | - | `[{id, scientific_name, ...}]` | ✅ Auto-filter by region |
| Fauna | Create fauna | POST | `/api/v1/fauna/` | `{scientific_name, park_id, ...}` | `{id, scientific_name}` | ✅ Validate park ownership, auto-set submitted_by |
| Fauna | Update fauna | PUT | `/api/v1/fauna/{id}` | `{description, ...}` | `{message}` | ✅ Check ownership, prevent if approved |
| Fauna | Delete fauna | DELETE | `/api/v1/fauna/{id}` | - | `{message}` | ✅ Check ownership, prevent if approved |
| Activities | Load my activities | GET | `/api/v1/activities/` | - | `[{id, title, ...}]` | ✅ Auto-filter by created_by |
| Activities | Create activity | POST | `/api/v1/activities/` | `{title, park_id, ...}` | `{id, title}` | ✅ Auto-set created_by |
| Activities | Update activity | PUT | `/api/v1/activities/{id}` | `{title, description, ...}` | `{message}` | ✅ Check ownership, prevent if approved |
| Activities | Delete activity | DELETE | `/api/v1/activities/{id}` | - | `{message}` | ✅ Check ownership, prevent if approved |

---

## ⚠️ ISSUES FOUND & FIXES NEEDED

### **Issue 1: User Management Endpoints** ⏳

**Problem**: Need to verify if user management endpoints exist.

**Files to Check**:
- `apps/backend/api/v1/routes/users.py` or similar

**Expected Endpoints**:
```python
GET    /api/v1/users/
POST   /api/v1/users/
PUT    /api/v1/users/{id}
DELETE /api/v1/users/{id}
```

**Status**: ⏳ Need to check

---

### **Issue 2: Announcement Endpoints** ⏳

**Problem**: Need to verify if announcement endpoints exist.

**Files to Check**:
- `apps/backend/api/v1/routes/announcements.py` or similar

**Expected Endpoints**:
```python
GET    /api/v1/announcements/
POST   /api/v1/announcements/
PUT    /api/v1/announcements/{id}
DELETE /api/v1/announcements/{id}
```

**Status**: ⏳ Need to check

---

### **Issue 3: Article Endpoints** ⏳

**Problem**: Need to verify if article endpoints exist and work correctly.

**Files to Check**:
- `apps/backend/api/v1/routes/articles.py`

**Expected Endpoints**:
```python
GET    /api/v1/articles/
POST   /api/v1/articles/
PUT    /api/v1/articles/{id}
DELETE /api/v1/articles/{id}
```

**Status**: ⏳ Need to check

---

### **Issue 4: Dashboard Statistics** ⏳

**Problem**: Dashboard home page needs to show statistics.

**Expected API**:
```python
GET /api/v1/dashboard/
→ Returns: {
    total_parks: N,
    total_flora: N,
    total_fauna: N,
    total_activities: N,
    pending_approvals: N,
    by_status: {
      draft: N,
      in_review: N,
      approved: N,
      rejected: N
    }
  }
```

**Status**: ⏳ Need to check if endpoint returns correct data for regional admin

---

### **Issue 5: Frontend Flora/Fauna Forms** ⏳

**Problem**: Need to verify forms only show parks owned by user.

**Expected Behavior**:
- Flora/Fauna create form should have park dropdown
- Dropdown should only show parks where `created_by = user.id`
- Should not show parks from other regional admins

**Files to Check**:
- `apps/frontend/src/components/flora/FloraForm.tsx`
- `apps/frontend/src/components/fauna/FaunaForm.tsx`

**Status**: ⏳ Need to verify

---

## ✅ VERIFICATION CHECKLIST

### **Super Admin Pages**

- [ ] Dashboard loads statistics
- [ ] User Management page loads users
- [ ] User Management can create user
- [ ] User Management can edit user
- [ ] User Management can delete user
- [ ] Approval Queue loads pending items
- [ ] Approval Queue shows Taman tab
- [ ] Approval Queue can approve park
- [ ] Approval Queue can reject park
- [ ] Approval Queue can approve flora
- [ ] Approval Queue can reject flora
- [ ] Approval Queue can approve fauna
- [ ] Approval Queue can reject fauna
- [ ] Approval Queue can approve activity
- [ ] Approval Queue can reject activity
- [ ] Announcement page loads
- [ ] Announcement can create
- [ ] Article page loads
- [ ] Article can create

### **Regional Admin Pages**

- [ ] Dashboard loads own statistics
- [ ] Taman page loads own parks only
- [ ] Taman can create park
- [ ] Taman validates region
- [ ] Taman can update own park
- [ ] Taman cannot update approved park
- [ ] Flora page loads own flora only
- [ ] Flora dropdown shows own parks only
- [ ] Flora can create in own park
- [ ] Flora cannot create in other's park
- [ ] Flora can update own flora
- [ ] Flora cannot update approved flora
- [ ] Fauna page loads own fauna only
- [ ] Fauna dropdown shows own parks only
- [ ] Fauna can create in own park
- [ ] Fauna cannot create in other's park
- [ ] Fauna can update own fauna
- [ ] Fauna cannot update approved fauna
- [ ] Activities page loads own activities only
- [ ] Activities can create
- [ ] Activities can update own
- [ ] Activities cannot update approved

### **Workflow**

- [ ] Regional admin creates park → status = draft
- [ ] Regional admin submits park → status = in_review
- [ ] Park appears in super admin approval queue
- [ ] Super admin approves → status = approved
- [ ] Regional admin sees approved status
- [ ] Regional admin cannot edit approved park
- [ ] Super admin rejects → status = rejected
- [ ] Regional admin sees rejection reason
- [ ] Regional admin can edit rejected park
- [ ] Regional admin can re-submit

---

## 🚀 NEXT STEPS

1. ⏳ Check if user management endpoints exist
2. ⏳ Check if announcement endpoints exist
3. ⏳ Check if article endpoints work correctly
4. ⏳ Verify dashboard statistics API
5. ⏳ Verify flora/fauna forms show own parks only
6. ⏳ Run complete workflow test
7. ⏳ Fix any issues found
8. ⏳ Update this document with results

---

**Last Updated**: 25 Oktober 2025, 18:30 WIB  
**Status**: 🔍 Verification in progress

