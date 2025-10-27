# 📋 ENDPOINT ACCESS BY ROLE - TAMAN KEHATI API

## 🌐 PUBLIC ACCESS (No Authentication Required)

### **Public Data APIs:**

- ✅ `GET /api/public/stats/` - Get system statistics
- ✅ `GET /api/public/flora/` - List all approved flora
- ✅ `GET /api/public/flora/{id}` - Get specific flora details
- ✅ `GET /api/public/fauna/` - List all approved fauna
- ✅ `GET /api/public/fauna/{id}` - Get specific fauna details
- ✅ `GET /api/public/parks/` - List all parks
- ✅ `GET /api/public/parks/{park_id}` - Get specific park details
- ✅ `GET /api/public/artikel/` - List all approved articles
- ✅ `GET /api/public/artikel/{slug}` - Get specific article by slug
- ✅ `GET /api/public/galeri/` - List all approved galleries
- ✅ `GET /api/public/stats/park/{park_id}` - Get park-specific statistics
- ✅ `GET /api/public/stats/regions` - Get available regions

### **Test/Development APIs:**

- ✅ `GET /api/public/test/` - Test endpoint
- ✅ `GET /api/public/stats-simple/` - Simple stats (mock data)
- ✅ `GET /api/public/artikel-simple/` - Simple articles (mock data)
- ✅ `GET /api/public/galeri-simple/` - Simple galleries (mock data)
- ✅ `GET /api/public/parks-simple/` - Simple parks (mock data)
- ✅ `GET /api/public/flora-simple/` - Simple flora (mock data)
- ✅ `GET /api/public/fauna-simple/` - Simple fauna (mock data)

---

## 🔐 SUPER ADMIN ACCESS (Full System Access)

### **Authentication:**

- ✅ `POST /api/v1/auth/login` - Login
- ✅ `POST /api/v1/auth/logout` - Logout

### **User Management:**

- ✅ `GET /api/v1/users/me` - Get current user profile
- ✅ `GET /api/v1/users/` - List all users
- ✅ `POST /api/v1/users/` - Create new user
- ✅ `GET /api/v1/users/{user_id}` - Get specific user
- ✅ `PUT /api/v1/users/{user_id}` - Update user
- ✅ `PUT /api/v1/users/{user_id}/role` - Update user role
- ✅ `PUT /api/v1/users/{user_id}/activate` - Activate user
- ✅ `PUT /api/v1/users/{user_id}/deactivate` - Deactivate user

### **Dashboard & Analytics:**

- ✅ `GET /api/v1/dashboard/` - Get comprehensive dashboard stats
- ✅ `GET /api/v1/dashboard/activity` - Get recent activity
- ✅ `GET /api/v1/dashboard/approvals` - Get pending approvals
- ✅ `GET /api/v1/analytics/dashboard` - Get analytics dashboard

### **Flora Management:**

- ✅ `GET /api/v1/flora/` - List all flora (all statuses)
- ✅ `POST /api/v1/flora/` - Create new flora
- ✅ `GET /api/v1/flora/{flora_id}` - Get specific flora
- ✅ `PUT /api/v1/flora/{flora_id}` - Update flora
- ✅ `DELETE /api/v1/flora/{flora_id}` - Delete flora
- ✅ `POST /api/v1/flora/{flora_id}/submit` - Submit flora for review
- ✅ `POST /api/v1/flora/{flora_id}/approve` - Approve flora
- ✅ `POST /api/v1/flora/{flora_id}/reject` - Reject flora
- ✅ `GET /api/v1/flora/review` - Review flora inbox
- ✅ `POST /api/v1/flora/bulk` - Bulk create flora
- ✅ `GET /api/v1/flora/csv` - Export flora CSV
- ✅ `GET /api/v1/flora/stats` - Flora statistics

### **Fauna Management:**

- ✅ `GET /api/v1/fauna/` - List all fauna (all statuses)
- ✅ `POST /api/v1/fauna/` - Create new fauna
- ✅ `GET /api/v1/fauna/{fauna_id}` - Get specific fauna
- ✅ `PUT /api/v1/fauna/{fauna_id}` - Update fauna
- ✅ `DELETE /api/v1/fauna/{fauna_id}` - Delete fauna
- ✅ `POST /api/v1/fauna/{fauna_id}/submit` - Submit fauna for review
- ✅ `POST /api/v1/fauna/{fauna_id}/approve` - Approve fauna
- ✅ `POST /api/v1/fauna/{fauna_id}/reject` - Reject fauna
- ✅ `GET /api/v1/fauna/review` - Review fauna inbox
- ✅ `POST /api/v1/fauna/bulk` - Bulk create fauna
- ✅ `GET /api/v1/fauna/csv` - Export fauna CSV
- ✅ `GET /api/v1/fauna/stats` - Fauna statistics

### **Articles Management:**

- ✅ `GET /api/v1/articles/` - List all articles (all statuses)
- ✅ `POST /api/v1/articles/` - Create new article
- ✅ `GET /api/v1/articles/{article_id}` - Get specific article
- ✅ `PUT /api/v1/articles/{article_id}` - Update article
- ✅ `DELETE /api/v1/articles/{article_id}` - Delete article
- ✅ `POST /api/v1/articles/{article_id}/submit` - Submit article for review
- ✅ `POST /api/v1/articles/{article_id}/approve` - Approve article
- ✅ `POST /api/v1/articles/{article_id}/reject` - Reject article

### **Galleries Management:**

- ✅ `GET /api/v1/galleries/` - List all galleries (all statuses)
- ✅ `POST /api/v1/galleries/` - Create new gallery
- ✅ `GET /api/v1/galleries/{gallery_id}` - Get specific gallery
- ✅ `PUT /api/v1/galleries/{gallery_id}` - Update gallery
- ✅ `DELETE /api/v1/galleries/{gallery_id}` - Delete gallery
- ✅ `POST /api/v1/galleries/{gallery_id}/submit` - Submit gallery for review
- ✅ `POST /api/v1/galleries/{gallery_id}/approve` - Approve gallery
- ✅ `POST /api/v1/galleries/{gallery_id}/reject` - Reject gallery

### **Activities Management:**

- ✅ `GET /api/v1/activities/` - List all activities
- ✅ `POST /api/v1/activities/` - Create new activity
- ✅ `GET /api/v1/activities/{activity_id}` - Get specific activity
- ✅ `PUT /api/v1/activities/{activity_id}` - Update activity
- ✅ `DELETE /api/v1/activities/{activity_id}` - Delete activity
- ✅ `POST /api/v1/activities/{activity_id}/submit` - Submit activity for review
- ✅ `POST /api/v1/activities/{activity_id}/approve` - Approve activity
- ✅ `POST /api/v1/activities/{activity_id}/reject` - Reject activity

### **Parks Management:**

- ✅ `GET /api/v1/parks/` - List all parks
- ✅ `POST /api/v1/parks/` - Create new park
- ✅ `GET /api/v1/parks/{park_id}` - Get specific park
- ✅ `PUT /api/v1/parks/{park_id}` - Update park
- ✅ `DELETE /api/v1/parks/{park_id}` - Delete park

### **Regions Management:**

- ✅ `GET /api/v1/regions/` - List all regions
- ✅ `POST /api/v1/regions/` - Create new region
- ✅ `GET /api/v1/regions/{region_id}` - Get specific region
- ✅ `PUT /api/v1/regions/{region_id}` - Update region
- ✅ `DELETE /api/v1/regions/{region_id}` - Delete region

### **System Management:**

- ✅ `GET /api/v1/approvals/` - List pending approvals
- ✅ `POST /api/v1/upload/gallery-image` - Upload gallery image
- ✅ `POST /api/v1/upload/flora-image` - Upload flora image
- ✅ `POST /api/v1/upload/fauna-image` - Upload fauna image
- ✅ `GET /api/v1/system-settings/` - Get system settings
- ✅ `PUT /api/v1/system-settings/` - Update system settings

### **Chat & AI:**

- ✅ `POST /api/v1/chat/` - Chat with AI
- ✅ `GET /api/v1/chat/stream` - Stream chat responses
- ✅ `GET /api/v1/chat/ws` - WebSocket chat

---

## 🌍 REGIONAL ADMIN ACCESS (Limited Regional Access)

### **Authentication:**

- ✅ `POST /api/v1/auth/login` - Login
- ✅ `POST /api/v1/auth/logout` - Logout

### **User Management:**

- ✅ `GET /api/v1/users/me` - Get current user profile
- ✅ `GET /api/v1/users/` - List users (limited scope)
- ✅ `GET /api/v1/users/{user_id}` - Get specific user (if accessible)

### **Dashboard & Analytics:**

- ✅ `GET /api/v1/dashboard/` - Get regional dashboard stats
- ✅ `GET /api/v1/dashboard/activity` - Get recent activity
- ✅ `GET /api/v1/dashboard/approvals` - Get pending approvals
- ✅ `GET /api/v1/analytics/dashboard` - Get regional analytics

### **Content Management (Regional Scope):**

- ✅ `GET /api/v1/flora/` - List flora (regional scope)
- ✅ `POST /api/v1/flora/` - Create new flora
- ✅ `GET /api/v1/flora/{flora_id}` - Get specific flora
- ✅ `PUT /api/v1/flora/{flora_id}` - Update flora
- ✅ `POST /api/v1/flora/{flora_id}/submit` - Submit flora for review

- ✅ `GET /api/v1/fauna/` - List fauna (regional scope)
- ✅ `POST /api/v1/fauna/` - Create new fauna
- ✅ `GET /api/v1/fauna/{fauna_id}` - Get specific fauna
- ✅ `PUT /api/v1/fauna/{fauna_id}` - Update fauna
- ✅ `POST /api/v1/fauna/{fauna_id}/submit` - Submit fauna for review

- ✅ `GET /api/v1/articles/` - List articles (regional scope)
- ✅ `POST /api/v1/articles/` - Create new article
- ✅ `GET /api/v1/articles/{article_id}` - Get specific article
- ✅ `PUT /api/v1/articles/{article_id}` - Update article
- ✅ `POST /api/v1/articles/{article_id}/submit` - Submit article for review

- ✅ `GET /api/v1/galleries/` - List galleries (regional scope)
- ✅ `POST /api/v1/galleries/` - Create new gallery
- ✅ `GET /api/v1/galleries/{gallery_id}` - Get specific gallery
- ✅ `PUT /api/v1/galleries/{gallery_id}` - Update gallery
- ✅ `POST /api/v1/galleries/{gallery_id}/submit` - Submit gallery for review

### **Activities Management:**

- ✅ `GET /api/v1/activities/` - List activities (regional scope)
- ✅ `POST /api/v1/activities/` - Create new activity
- ✅ `GET /api/v1/activities/{activity_id}` - Get specific activity
- ✅ `PUT /api/v1/activities/{activity_id}` - Update activity
- ✅ `POST /api/v1/activities/{activity_id}/submit` - Submit activity for review

### **Upload:**

- ✅ `POST /api/v1/upload/gallery-image` - Upload gallery image
- ✅ `POST /api/v1/upload/flora-image` - Upload flora image
- ✅ `POST /api/v1/upload/fauna-image` - Upload fauna image

### **Chat & AI:**

- ✅ `POST /api/v1/chat/` - Chat with AI
- ✅ `GET /api/v1/chat/stream` - Stream chat responses

---

## 🚫 RESTRICTED ACCESS

### **Super Admin Only:**

- ❌ **User Role Management** - Only Super Admin can change user roles
- ❌ **System Settings** - Only Super Admin can modify system settings
- ❌ **Approval/Rejection** - Only Super Admin can approve/reject content
- ❌ **User Activation/Deactivation** - Only Super Admin can manage user status
- ❌ **Bulk Operations** - Only Super Admin can perform bulk operations
- ❌ **Export Functions** - Only Super Admin can export data
- ❌ **Delete Operations** - Only Super Admin can delete content

### **Regional Admin Limitations:**

- ❌ **Cannot approve/reject** content (can only submit for review)
- ❌ **Cannot change user roles** (can only view users)
- ❌ **Cannot access system settings**
- ❌ **Cannot perform bulk operations**
- ❌ **Cannot export data**
- ✅ **Can delete** content (but needs approval for changes)

---

## 📊 ACCESS SUMMARY

| Feature               | Public | Regional Admin | Super Admin |
| --------------------- | ------ | -------------- | ----------- |
| **View Public Data**  | ✅     | ✅             | ✅          |
| **Create Content**    | ❌     | ✅             | ✅          |
| **Update Content**    | ❌     | ✅             | ✅          |
| **Submit for Review** | ❌     | ✅             | ✅          |
| **Approve Content**   | ❌     | ❌             | ✅          |
| **Reject Content**    | ❌     | ❌             | ✅          |
| **Delete Content**    | ❌     | ✅             | ✅          |
| **User Management**   | ❌     | Limited        | ✅          |
| **System Settings**   | ❌     | ❌             | ✅          |
| **Bulk Operations**   | ❌     | ❌             | ✅          |
| **Export Data**       | ❌     | ❌             | ✅          |

---

## 🔐 AUTHENTICATION REQUIREMENTS

### **Public APIs:**

- **No authentication required**
- **Accessible to everyone**
- **Only approved content shown**

### **Authenticated APIs:**

- **Requires JWT token**
- **Token obtained via login**
- **Role-based access control**
- **Token expires after 24 hours**

### **Role Hierarchy:**

1. **Super Admin** - Full system access
2. **Regional Admin** - Limited regional access
3. **Public** - Read-only approved content

---

_Generated on: $(date)_
_Total Endpoints: 100+_
_Public Endpoints: 20+_
_Authenticated Endpoints: 80+_
