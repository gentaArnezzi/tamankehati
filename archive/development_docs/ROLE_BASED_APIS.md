# 🔐 APIs YANG MEMERLUKAN ROLE-BASED ACCESS

## **🎯 ROLE HIERARCHY:**

1. **super_admin** - Akses penuh ke semua data
2. **regional_admin** - Akses terbatas ke region mereka
3. **ranger** - Akses terbatas untuk operasi lapangan
4. **volunteer** - Akses terbatas untuk kontribusi
5. **public** - Akses read-only ke data approved

## **📊 APIS BERDASARKAN ROLE:**

### **🔑 SUPER ADMIN ONLY APIs:**

- `POST /api/v1/flora/{flora_id}/approve` - Approve Flora
- `POST /api/v1/flora/{flora_id}/reject` - Reject Flora
- `POST /api/v1/fauna/{fauna_id}/approve` - Approve Fauna
- `POST /api/v1/fauna/{fauna_id}/reject` - Reject Fauna
- `POST /api/v1/articles/{article_id}/approve` - Approve Article
- `POST /api/v1/articles/{article_id}/reject` - Reject Article
- `POST /api/v1/galleries/{gallery_id}/approve` - Approve Gallery
- `POST /api/v1/galleries/{gallery_id}/reject` - Reject Gallery
- `POST /api/v1/activities/{activity_id}/approve` - Approve Activity
- `POST /api/v1/activities/{activity_id}/reject` - Reject Activity
- `POST /api/v1/announcements/` - Create Announcement (Super Admin only)

### **🌍 REGIONAL ADMIN + SUPER ADMIN APIs:**

- `GET /api/v1/dashboard/` - Dashboard (Super Admin, Regional Admin, Ranger, Volunteer)
- `GET /api/v1/flora/review` - Review Flora Inbox
- `GET /api/v1/flora/csv` - Export Flora CSV
- `GET /api/v1/flora/stats` - Flora Stats
- `GET /api/v1/fauna/review` - Review Fauna Inbox
- `GET /api/v1/fauna/csv` - Export Fauna CSV
- `GET /api/v1/fauna/stats` - Fauna Stats
- `GET /api/v1/articles/review` - Review Article Inbox
- `GET /api/v1/galleries/review` - Review Gallery Inbox
- `GET /api/v1/activities/review` - Review Activity Inbox
- `GET /api/v1/approvals/` - List Pending Approvals
- `DELETE /api/v1/flora/{flora_id}` - Delete Flora
- `DELETE /api/v1/fauna/{fauna_id}` - Delete Fauna
- `DELETE /api/v1/articles/{article_id}` - Delete Article
- `DELETE /api/v1/galleries/{gallery_id}` - Delete Gallery
- `DELETE /api/v1/activities/{activity_id}` - Delete Activity

### **👥 RANGER + REGIONAL ADMIN + SUPER ADMIN APIs:**

- `PUT /api/v1/flora/{flora_id}` - Update Flora
- `PUT /api/v1/fauna/{fauna_id}` - Update Fauna
- `PUT /api/v1/articles/{article_id}` - Update Article
- `PUT /api/v1/galleries/{gallery_id}` - Update Gallery
- `PUT /api/v1/activities/{activity_id}` - Update Activity

### **🌱 VOLUNTEER + RANGER + REGIONAL ADMIN + SUPER ADMIN APIs:**

- `POST /api/v1/flora/` - Create Flora
- `POST /api/v1/fauna/` - Create Fauna
- `POST /api/v1/articles/` - Create Article
- `POST /api/v1/galleries/` - Create Gallery
- `POST /api/v1/activities/` - Create Activity
- `POST /api/v1/flora/{flora_id}/submit` - Submit Flora
- `POST /api/v1/fauna/{fauna_id}/submit` - Submit Fauna
- `POST /api/v1/articles/{article_id}/submit` - Submit Article
- `POST /api/v1/galleries/{gallery_id}/submit` - Submit Gallery
- `POST /api/v1/activities/{activity_id}/submit` - Submit Activity
- `POST /api/v1/flora/bulk` - Bulk Create Flora

### **👤 USER MANAGEMENT APIs:**

- `GET /api/v1/users/` - List Users (Super Admin, Regional Admin)
- `POST /api/v1/users/` - Create User (Super Admin, Regional Admin)
- `GET /api/v1/users/{user_id}` - Get User (Super Admin, Regional Admin)
- `PUT /api/v1/users/{user_id}` - Update User (Super Admin, Regional Admin)
- `PUT /api/v1/users/{user_id}/role` - Update User Role (Super Admin only)
- `PUT /api/v1/users/{user_id}/activate` - Activate User (Super Admin, Regional Admin)
- `PUT /api/v1/users/{user_id}/deactivate` - Deactivate User (Super Admin, Regional Admin)

### **📊 DASHBOARD & ANALYTICS APIs:**

- `GET /api/v1/dashboard/` - Dashboard (Super Admin, Regional Admin, Ranger, Volunteer)
- `GET /api/v1/dashboard/activity` - Recent Activity (Super Admin, Regional Admin, Ranger, Volunteer)
- `GET /api/v1/dashboard/approvals` - Pending Approvals (Super Admin, Regional Admin, Ranger, Volunteer)
- `GET /api/v1/analytics/` - Analytics Root (Super Admin, Regional Admin)
- `GET /api/v1/analytics/regions/{region_code}/endemic` - Endemic Analytics (Super Admin, Regional Admin)
- `GET /api/v1/analytics/regions/{region_code}/iucn` - IUCN Analytics (Super Admin, Regional Admin)

### **💬 CHAT APIs:**

- `GET /api/v1/chat/sessions` - List Sessions (All authenticated users)
- `POST /api/v1/chat/sessions` - Create Session (All authenticated users)
- `GET /api/v1/chat/sessions/{session_id}/messages` - Get Messages (All authenticated users)
- `POST /api/v1/chat/sessions/{session_id}/messages` - Send Message (All authenticated users)
- `GET /api/v1/chat/sse/{session_id}` - Chat SSE (All authenticated users)

### **⚙️ SYSTEM SETTINGS APIs:**

- `GET /api/v1/system-settings` - List Settings (Super Admin, Regional Admin)
- `POST /api/v1/system-settings` - Create Setting (Super Admin, Regional Admin)
- `GET /api/v1/system-settings/{setting_key}` - Get Setting (Super Admin, Regional Admin)
- `PUT /api/v1/system-settings/{setting_key}` - Update Setting (Super Admin, Regional Admin)
- `DELETE /api/v1/system-settings/{setting_key}` - Delete Setting (Super Admin, Regional Admin)

### **🔍 SEARCH APIs:**

- `GET /api/v1/search/` - Aggregated Search (All authenticated users)

### **🗂️ CRUD APIs:**

- `GET /api/v1/crud/regions/` - List Regions (Super Admin, Regional Admin)
- `POST /api/v1/crud/regions/` - Create Region (Super Admin, Regional Admin)
- `GET /api/v1/crud/parks/` - List Parks (Super Admin, Regional Admin)
- `POST /api/v1/crud/parks/` - Create Park (Super Admin, Regional Admin)
- `GET /api/v1/crud/zones/` - List Zones (Super Admin, Regional Admin)
- `POST /api/v1/crud/zones/` - Create Zone (Super Admin, Regional Admin)

### **🌍 REGIONS APIs:**

- `GET /api/v1/regions/` - List Regions (Super Admin, Regional Admin)
- `POST /api/v1/regions/` - Create Region (Super Admin, Regional Admin)
- `GET /api/v1/regions/{region_id}` - Read Region (Super Admin, Regional Admin)
- `PUT /api/v1/regions/{region_id}` - Update Region (Super Admin, Regional Admin)
- `DELETE /api/v1/regions/{region_id}` - Delete Region (Super Admin, Regional Admin)

## **📋 ROLE PERMISSIONS SUMMARY:**

### **🔑 SUPER ADMIN:**

- ✅ **Full access** to all APIs
- ✅ **Approve/Reject** all content
- ✅ **User management** (create, update, delete, role changes)
- ✅ **System settings** management
- ✅ **Analytics** access
- ✅ **CRUD operations** for regions, parks, zones

### **🌍 REGIONAL ADMIN:**

- ✅ **Regional scope** access only
- ✅ **Dashboard** access
- ✅ **Review** content in their region
- ✅ **User management** (limited to their region)
- ✅ **Analytics** for their region
- ❌ **Cannot approve/reject** content (Super Admin only)

### **👥 RANGER:**

- ✅ **Create/Update** content
- ✅ **Submit** content for approval
- ✅ **Dashboard** access
- ❌ **Cannot approve/reject** content
- ❌ **Cannot manage** users

### **🌱 VOLUNTEER:**

- ✅ **Create** content
- ✅ **Submit** content for approval
- ❌ **Cannot update** existing content
- ❌ **Cannot approve/reject** content
- ❌ **Cannot manage** users

### **👤 PUBLIC:**

- ✅ **Read-only** access to approved content
- ❌ **Cannot create/update** content
- ❌ **Cannot access** admin APIs

## **🔐 AUTHENTICATION REQUIREMENTS:**

- **All `/api/v1/*` endpoints** require authentication
- **Bearer Token** in Authorization header
- **Role-based access control** enforced
- **Region-based scoping** for Regional Admins
