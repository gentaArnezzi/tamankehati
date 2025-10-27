# 🎯 FLOW APLIKASI & STRUKTUR DASHBOARD
## Taman Kehati - Role-Based Access System

Tanggal: 25 Oktober 2025

---

## 📋 DAFTAR ISI

1. [Overview](#overview)
2. [Role Definitions](#role-definitions)
3. [Application Flow](#application-flow)
4. [Dashboard Structure](#dashboard-structure)
5. [Database Schema](#database-schema)
6. [Implementation Checklist](#implementation-checklist)

---

## 🎭 ROLE DEFINITIONS

### 👑 **SUPER ADMIN**
**Fokus**: Governance, Approval, Content Management

**Akses Penuh**:
- ✅ User Management (CRUD users)
- ✅ Approval Queue (approve/reject submissions dari regional admin)
- ✅ Announcement Management (create/edit/delete)
- ✅ Article/News Management (create/edit/delete)

**Tidak Punya Akses**:
- ❌ Halaman Flora
- ❌ Halaman Fauna
- ❌ Halaman Taman (create/edit)
- ❌ Halaman Activities

**Catatan**: Super admin hanya melihat data yang perlu di-approve di Approval Queue, tidak perlu masuk ke halaman detail flora/fauna/taman.

---

### 🌍 **REGIONAL ADMIN**
**Fokus**: Data Entry & Content Submission

**Akses Penuh**:
- ✅ Dashboard Taman (create/view **HANYA taman milik sendiri**)
- ✅ Flora Management (create/edit/delete **HANYA di taman milik sendiri**)
- ✅ Fauna Management (create/edit/delete **HANYA di taman milik sendiri**)
- ✅ Activities Management (create/edit/delete **HANYA di taman milik sendiri**)

**Tidak Punya Akses**:
- ❌ User Management
- ❌ Approval Queue
- ❌ Announcement Management
- ❌ Article/News Management
- ❌ Data dari regional admin lain

**Catatan**: Semua data yang di-submit berstatus `draft` atau `in_review` sampai di-approve oleh super admin.

---

## 🔄 APPLICATION FLOW

### **FLOW 1: Regional Admin Submit Data Taman**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. REGIONAL ADMIN LOGIN                                         │
│    - Email: kaltim.admin@kehati.org                             │
│    - Role: regional_admin                                       │
│    - Wilayah: Kalimantan Timur                                  │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. DASHBOARD REGIONAL ADMIN                                     │
│    - Menu: Dashboard | Taman | Flora | Fauna | Kegiatan        │
│    - Hanya tampil data milik sendiri (created_by = user.id)    │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. CREATE TAMAN BARU                                            │
│    - Isi form: Nama, Lokasi, Area, SK Penetapan, dll           │
│    - Status otomatis: "draft"                                   │
│    - created_by = user.id (auto)                                │
│    - Submit → ke Approval Queue                                 │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. ADD FLORA/FAUNA/ACTIVITIES KE TAMAN                          │
│    - Pilih taman yang sudah dibuat                              │
│    - Submit data flora/fauna/activities                         │
│    - Status otomatis: "in_review"                               │
│    - submitted_by = user.id (auto)                              │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. VIEW STATUS SUBMISSION                                       │
│    - Dashboard menampilkan:                                     │
│      • Total Taman (draft, in_review, approved)                 │
│      • Total Flora (in_review, approved)                        │
│      • Total Fauna (in_review, approved)                        │
│      • Total Activities (in_review, approved)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

### **FLOW 2: Super Admin Approval Process**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. SUPER ADMIN LOGIN                                            │
│    - Email: admin@kehati.org                                    │
│    - Role: super_admin                                          │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. DASHBOARD SUPER ADMIN                                        │
│    - Menu: Dashboard | Approval | Users | Announcement | News  │
│    - Summary: Total pending approvals per kategori              │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. APPROVAL QUEUE                                               │
│    - Tabs:                                                      │
│      • All (semua pending)                                      │
│      • Taman (X items)                                          │
│      • Flora (X items)                                          │
│      • Fauna (X items)                                          │
│      • Kegiatan (X items)                                       │
│    - Filter: By date, by region, by submitter                   │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. REVIEW SUBMISSION                                            │
│    - Klik item → Preview data lengkap                           │
│    - Info submitter: Name, Region, Email                        │
│    - Info submission: Date, Status                              │
│    - Data preview: Semua field yang di-submit                   │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. APPROVE / REJECT                                             │
│    ┌──────────────────┐         ┌──────────────────┐          │
│    │   APPROVE        │         │   REJECT         │          │
│    │ • Status: approved│         │ • Status: rejected│          │
│    │ • approved_by: ID│         │ • approved_by: ID│          │
│    │ • approved_at: now│        │ • rejection_reason│          │
│    │ • Notif regional │         │ • Notif regional │          │
│    └──────────────────┘         └──────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. NOTIFICATION TO REGIONAL ADMIN                               │
│    - Email/In-app notification                                  │
│    - "Taman X telah disetujui"                                  │
│    - "Data Flora Y perlu revisi: [reason]"                      │
└─────────────────────────────────────────────────────────────────┘
```

---

### **FLOW 3: Create Article/Announcement (Super Admin)**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. SUPER ADMIN → Menu "Artikel" atau "Pengumuman"              │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. CREATE NEW                                                   │
│    - Title, Content, Category, Tags                             │
│    - Upload image (optional)                                    │
│    - Set visibility: Public/Regional                            │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. PUBLISH                                                      │
│    - Status: "published"                                        │
│    - published_at: now                                          │
│    - Langsung tampil di public website                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🖥️ DASHBOARD STRUCTURE

### **SUPER ADMIN DASHBOARD**

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER                                                         │
│  🏠 Taman Kehati Admin  |  👤 Super Admin  |  🔔  |  Logout    │
└─────────────────────────────────────────────────────────────────┘
┌─────────┬───────────────────────────────────────────────────────┐
│ SIDEBAR │  MAIN CONTENT                                         │
│         │                                                       │
│ 📊 Dashboard │  ┌─────────────────────────────────────────┐   │
│         │  │  APPROVAL QUEUE SUMMARY                 │   │
│ ✅ Approval  │  │  • Pending Taman: 5                     │   │
│         │  │  • Pending Flora: 12                    │   │
│ 👥 Users     │  │  • Pending Fauna: 8                     │   │
│         │  │  • Pending Kegiatan: 3                  │   │
│ 📢 Announcement│  └─────────────────────────────────────────┘   │
│         │                                                       │
│ 📰 Artikel   │  ┌─────────────────────────────────────────┐   │
│         │  │  REGIONAL ADMIN ACTIVITY (Last 7 Days)  │   │
│         │  │  • KALTIM: 15 submissions               │   │
│         │  │  • SUMUT: 8 submissions                 │   │
│         │  │  • JABAR: 12 submissions                │   │
│         │  └─────────────────────────────────────────┘   │
│         │                                                       │
│         │  ┌─────────────────────────────────────────┐   │
│         │  │  RECENT APPROVALS                       │   │
│         │  │  ✅ Flora "Rafflesia" - KALTIM          │   │
│         │  │  ✅ Taman "Bukit Soeharto" - KALTIM     │   │
│         │  │  ❌ Fauna "Orangutan" - SUMUT (rejected)│   │
│         │  └─────────────────────────────────────────┘   │
└─────────┴───────────────────────────────────────────────────────┘
```

#### **Menu Super Admin**:
1. **📊 Dashboard**
   - Summary approval queue
   - Stats per region
   - Recent activity

2. **✅ Approval**
   - Tabs: All | Taman | Flora | Fauna | Kegiatan
   - Table dengan filter & search
   - Action: Approve/Reject

3. **👥 Users**
   - List all users (super_admin, regional_admin)
   - Create new regional admin
   - Edit/Deactivate user
   - Reset password

4. **📢 Announcement**
   - List announcements
   - Create/Edit/Delete
   - Set visibility (Public/Regional)

5. **📰 Artikel**
   - List articles/news
   - Create/Edit/Delete
   - Rich text editor
   - Upload images

---

### **REGIONAL ADMIN DASHBOARD**

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER                                                         │
│  🏠 Taman Kehati  |  👤 Admin KALTIM  |  🔔  |  Logout         │
└─────────────────────────────────────────────────────────────────┘
┌─────────┬───────────────────────────────────────────────────────┐
│ SIDEBAR │  MAIN CONTENT                                         │
│         │                                                       │
│ 📊 Dashboard │  ┌─────────────────────────────────────────┐   │
│         │  │  MY SUBMISSIONS SUMMARY                 │   │
│ 🏞️ Taman    │  │  • Total Taman: 3                       │   │
│         │  │    - Draft: 1                           │   │
│ 🌿 Flora     │  │    - In Review: 1                       │   │
│         │  │    - Approved: 1                        │   │
│ 🦜 Fauna     │  │                                         │   │
│         │  │  • Total Flora: 24 (12 approved)        │   │
│ 📅 Kegiatan  │  │  • Total Fauna: 18 (10 approved)        │   │
│         │  │  • Total Kegiatan: 5 (3 approved)       │   │
│         │  └─────────────────────────────────────────┘   │
│         │                                                       │
│         │  ┌─────────────────────────────────────────┐   │
│         │  │  MY PARKS                               │   │
│         │  │  ┌─────────────────────────────────┐   │   │
│         │  │  │ 🏞️ Taman Bukit Soeharto          │   │   │
│         │  │  │ Status: ✅ Approved               │   │   │
│         │  │  │ Flora: 12 | Fauna: 8              │   │   │
│         │  │  │ [View] [Add Flora] [Add Fauna]    │   │   │
│         │  │  └─────────────────────────────────┘   │   │
│         │  │  ┌─────────────────────────────────┐   │   │
│         │  │  │ 🏞️ Taman Kutai                   │   │   │
│         │  │  │ Status: 🔄 In Review              │   │   │
│         │  │  │ Flora: 0 | Fauna: 0               │   │   │
│         │  │  │ [View] [Edit]                     │   │   │
│         │  │  └─────────────────────────────────┘   │   │
│         │  └─────────────────────────────────────────┘   │
└─────────┴───────────────────────────────────────────────────────┘
```

#### **Menu Regional Admin**:
1. **📊 Dashboard**
   - Summary data milik sendiri
   - Status breakdown (draft/in_review/approved/rejected)
   - Quick actions

2. **🏞️ Taman**
   - List taman milik sendiri
   - Create new taman
   - Edit taman (jika masih draft/rejected)
   - View detail

3. **🌿 Flora**
   - List flora di taman milik sendiri
   - Create/Edit/Delete
   - Filter by taman
   - Upload images

4. **🦜 Fauna**
   - List fauna di taman milik sendiri
   - Create/Edit/Delete
   - Filter by taman
   - Upload images

5. **📅 Kegiatan**
   - List activities di taman milik sendiri
   - Create/Edit/Delete
   - Upload photos
   - Set date & description

---

## 🗄️ DATABASE SCHEMA

### **Key Fields for Access Control**

#### **parks table**
```sql
id SERIAL PRIMARY KEY,
name VARCHAR(255),
slug VARCHAR(255) UNIQUE,
region_id INTEGER REFERENCES regions(id),
status VARCHAR(50) DEFAULT 'draft',  -- draft, in_review, approved, rejected, published
created_by INTEGER REFERENCES users(id),  -- Regional admin who created
approved_by INTEGER REFERENCES users(id),  -- Super admin who approved
approved_at TIMESTAMP,
rejection_reason TEXT,
created_at TIMESTAMP,
updated_at TIMESTAMP
```

#### **flora table**
```sql
id SERIAL PRIMARY KEY,
park_id INTEGER REFERENCES parks(id),
scientific_name VARCHAR(255),
local_name VARCHAR(255),
status VARCHAR(50) DEFAULT 'in_review',  -- in_review, approved, rejected
submitted_by INTEGER REFERENCES users(id),  -- Regional admin
approved_by INTEGER REFERENCES users(id),
approved_at TIMESTAMP,
rejection_reason TEXT,
created_at TIMESTAMP,
updated_at TIMESTAMP
```

#### **fauna table**
```sql
-- Same structure as flora
id SERIAL PRIMARY KEY,
park_id INTEGER REFERENCES parks(id),
scientific_name VARCHAR(255),
local_name VARCHAR(255),
status VARCHAR(50) DEFAULT 'in_review',
submitted_by INTEGER REFERENCES users(id),
approved_by INTEGER REFERENCES users(id),
approved_at TIMESTAMP,
rejection_reason TEXT,
created_at TIMESTAMP,
updated_at TIMESTAMP
```

#### **activities table**
```sql
id SERIAL PRIMARY KEY,
park_id INTEGER REFERENCES parks(id),
title VARCHAR(255),
description TEXT,
activity_date DATE,
status VARCHAR(50) DEFAULT 'in_review',
created_by INTEGER REFERENCES users(id),
approved_by INTEGER REFERENCES users(id),
approved_at TIMESTAMP,
rejection_reason TEXT,
created_at TIMESTAMP,
updated_at TIMESTAMP
```

#### **users table**
```sql
id SERIAL PRIMARY KEY,
email VARCHAR(255) UNIQUE,
hashed_password VARCHAR(255),
role VARCHAR(50),  -- super_admin, regional_admin
wilayah VARCHAR(100),  -- For regional_admin: KALTIM, SUMUT, etc
full_name VARCHAR(255),
is_active BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP,
updated_at TIMESTAMP
```

---

## 🔐 ACCESS CONTROL RULES

### **Backend API Filtering**

#### **For Regional Admin**:
```python
# Automatically filter by created_by/submitted_by
if user.role == "regional_admin":
    # Parks
    query = query.where(Park.created_by == user.id)
    
    # Flora/Fauna/Activities
    query = query.where(Flora.submitted_by == user.id)
    
    # Only show data from parks they own
    query = query.join(Park).where(Park.created_by == user.id)
```

#### **For Super Admin**:
```python
# No filtering - can see all data in approval queue
# But only in Approval context, not in separate Flora/Fauna pages
if user.role == "super_admin":
    # Access to all pending items
    query = query.where(Park.status == "in_review")
```

---

## ✅ IMPLEMENTATION CHECKLIST

### **Phase 1: Backend Access Control** ✅
- [x] Add `created_by` to parks table
- [x] Add `submitted_by` to flora/fauna/activities tables
- [x] Add `status` field with proper enums
- [x] Add `approved_by`, `approved_at`, `rejection_reason` fields
- [x] Update API endpoints to filter by user role
- [x] Test regional admin can only see their own data

### **Phase 2: Super Admin Dashboard** 🚧
- [x] Approval Queue page (with Taman tab) ✅
- [ ] Approve/Reject endpoints for Taman
- [ ] Approve/Reject endpoints for Flora
- [ ] Approve/Reject endpoints for Fauna
- [ ] Approve/Reject endpoints for Activities
- [ ] User Management page
- [ ] Announcement Management page
- [ ] Article Management page
- [ ] Remove Flora/Fauna/Taman menus from super admin sidebar

### **Phase 3: Regional Admin Dashboard** 🚧
- [x] Taman submission page ✅
- [x] Flora listing with filter by park ✅
- [x] Fauna listing with filter by park ✅
- [x] Activities listing with filter by park ✅
- [ ] Dashboard summary (stats)
- [ ] Status badges (draft/in_review/approved/rejected)
- [ ] Notification when data approved/rejected
- [ ] Remove Users/Approval/Announcement/Article menus from regional admin sidebar

### **Phase 4: UI/UX Improvements** 📋
- [ ] Status badges with colors
  - 🟡 Draft (yellow)
  - 🔵 In Review (blue)
  - 🟢 Approved (green)
  - 🔴 Rejected (red)
- [ ] Quick actions on dashboard
- [ ] Filter & search on all tables
- [ ] Pagination
- [ ] Loading states
- [ ] Error messages
- [ ] Success notifications

### **Phase 5: Notifications** 📋
- [ ] In-app notification system
- [ ] Email notification on approval/rejection
- [ ] Notification badge on header
- [ ] Notification list page

### **Phase 6: Testing** 📋
- [ ] Test super admin approval flow
- [ ] Test regional admin submission flow
- [ ] Test regional admin can't see other admin's data
- [ ] Test regional admin can't access super admin pages
- [ ] Test super admin can't access flora/fauna/taman pages
- [ ] Load testing
- [ ] Security testing

---

## 🎨 UI WIREFRAMES

### **Approval Queue (Super Admin)**

```
┌────────────────────────────────────────────────────────────────┐
│  APPROVAL QUEUE                                   [Refresh]    │
├────────────────────────────────────────────────────────────────┤
│  [ All (28) ] [ Taman (5) ] [ Flora (12) ] [ Fauna (8) ] [...] │
├────────────────────────────────────────────────────────────────┤
│  🔍 Search...                              Filter by: [Region ▾]│
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 🏞️ Taman Bukit Soeharto                                  │ │
│  │ By: Admin KALTIM | Region: Kalimantan Timur              │ │
│  │ Submitted: 2025-10-24 14:30                              │ │
│  │ Status: 🔵 In Review                                      │ │
│  │ [👁️ Preview] [✅ Approve] [❌ Reject]                      │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 🌿 Flora: Rafflesia arnoldii                             │ │
│  │ By: Admin KALTIM | Park: Taman Bukit Soeharto            │ │
│  │ Submitted: 2025-10-25 09:15                              │ │
│  │ Status: 🔵 In Review                                      │ │
│  │ [👁️ Preview] [✅ Approve] [❌ Reject]                      │ │
│  └──────────────────────────────────────────────────────────┘ │
│  [1] 2 3 ... 10 Next >                                        │
└────────────────────────────────────────────────────────────────┘
```

### **My Parks (Regional Admin)**

```
┌────────────────────────────────────────────────────────────────┐
│  MY PARKS                                   [+ Create New Park]│
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 🏞️ Taman Bukit Soeharto                                  │ │
│  │ Region: Kalimantan Timur | Area: 61,068 ha               │ │
│  │ Status: 🟢 Approved | Created: 2025-10-20                │ │
│  │ Flora: 12 | Fauna: 8 | Activities: 5                     │ │
│  │ [View Details] [➕ Add Flora] [➕ Add Fauna] [➕ Add Activity]│ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 🏞️ Taman Kutai                                           │ │
│  │ Region: Kalimantan Timur | Area: 198,629 ha              │ │
│  │ Status: 🔵 In Review | Submitted: 2025-10-24             │ │
│  │ Flora: 0 | Fauna: 0 | Activities: 0                      │ │
│  │ [View Details] [Edit]                                    │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 🏞️ Taman Sangalaki                                       │ │
│  │ Region: Kalimantan Timur | Area: 64,000 ha               │ │
│  │ Status: 🟡 Draft | Created: 2025-10-25                   │ │
│  │ Flora: 0 | Fauna: 0 | Activities: 0                      │ │
│  │ [Continue Editing] [Submit for Review]                   │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

---

## 📊 STATUS FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│  DATA LIFECYCLE: TAMAN / FLORA / FAUNA / ACTIVITIES            │
└─────────────────────────────────────────────────────────────────┘

Regional Admin Creates Data
           ↓
    [ DRAFT ] ← Regional admin bisa edit
           ↓
    Regional admin klik "Submit for Review"
           ↓
    [ IN_REVIEW ] ← Masuk Approval Queue Super Admin
           ↓
    ┌──────┴──────┐
    ↓             ↓
[ APPROVED ]  [ REJECTED ]
    ↓             ↓
Published     Regional admin bisa edit & re-submit
on website    (status kembali ke DRAFT)
```

---

## 🚀 NEXT STEPS

### **Prioritas Tinggi (This Week)**
1. ✅ Fix regional admin filtering (DONE)
2. ✅ Add Taman to approval queue (DONE)
3. 🚧 Implement Approve/Reject endpoints
4. 🚧 Update Super Admin sidebar (remove Flora/Fauna/Taman)
5. 🚧 Update Regional Admin sidebar (remove Users/Approval)

### **Prioritas Menengah (Next Week)**
6. Add User Management page for Super Admin
7. Add Announcement Management page
8. Add Article Management page
9. Add status badges throughout UI
10. Add notifications

### **Prioritas Rendah (Future)**
11. Email notifications
12. Advanced filtering & search
13. Export data to Excel/PDF
14. Analytics & reports

---

## 📝 NOTES

- Super admin **TIDAK** butuh halaman detail Flora/Fauna/Taman yang lengkap
- Super admin cukup lihat preview di Approval Queue
- Regional admin **HANYA** bisa lihat dan edit data milik sendiri
- Semua approval decision disimpan (approved_by, approved_at)
- Rejection harus ada alasan (rejection_reason)
- Status flow: draft → in_review → approved/rejected
- Jika rejected, regional admin bisa edit dan re-submit

---

**Dibuat oleh**: Claude Sonnet 4.5  
**Tanggal**: 25 Oktober 2025  
**Versi**: 1.0

