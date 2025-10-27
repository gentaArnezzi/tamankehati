# 🔄 WORKFLOW: SUPER ADMIN TO REGIONAL ADMIN

## 📋 OVERVIEW

This document outlines the complete workflow for managing the transition from **Super Admin** to **Regional Admin** roles in the Taman Kehati system, including content approval processes, user management, and system administration.

---

## 🔐 AUTHENTICATION WORKFLOW

### **1. Login Process**

```bash
# Super Admin Login
POST /api/v1/auth/login
{
  "email": "admin@kehati.org",
  "password": "password"
}

# Regional Admin Login
POST /api/v1/auth/login
{
  "email": "kaltim.admin@kehati.org",
  "password": "password"
}
```

### **2. Token Management**

- **JWT Token:** 24-hour expiration
- **Role-based Access:** Token contains user role
- **Header:** `Authorization: Bearer <token>`

---

## 👥 USER MANAGEMENT WORKFLOW

### **Super Admin: Full User Management**

#### **Create Regional Admin:**

```bash
POST /api/v1/users/
{
  "email": "new.regional@kehati.org",
  "password": "secure_password",
  "display_name": "Regional Administrator",
  "role": "regional_admin"
}
```

#### **Update User Role:**

```bash
PUT /api/v1/users/{user_id}/role
{
  "role": "regional_admin"
}
```

#### **Activate/Deactivate Users:**

```bash
PUT /api/v1/users/{user_id}/activate
PUT /api/v1/users/{user_id}/deactivate
```

### **Regional Admin: Limited User Access**

#### **View Users (Limited Scope):**

```bash
GET /api/v1/users/  # Can only see users in their scope
GET /api/v1/users/{user_id}  # Can only access if permitted
```

---

## 📊 DASHBOARD WORKFLOW

### **Super Admin Dashboard:**

```bash
GET /api/v1/dashboard/
# Returns: Full system statistics
{
  "role": "super_admin",
  "stats": {
    "parks": {"total": 6},
    "regions": {"total": 38},
    "users": {"total": 3},
    "flora": {"total": 8},
    "fauna": {"total": 5},
    "articles": {"total": 0},
    "galleries": {"total": 0},
    "zones": {"total": 0}
  }
}
```

### **Regional Admin Dashboard:**

```bash
GET /api/v1/dashboard/
# Returns: Regional statistics only
{
  "role": "regional_admin",
  "stats": {
    "parks": {"total": 6},
    "users": {"total": 3},
    "flora": {"total": 8},
    "fauna": {"total": 5},
    "articles": {"total": 0},
    "galleries": {"total": 0},
    "zones": {"total": 0}
  }
}
```

---

## 🌿 CONTENT MANAGEMENT WORKFLOW

### **Content Creation Process**

#### **1. Regional Admin Creates Content:**

```bash
# Create Flora
POST /api/v1/flora/
{
  "scientific_name": "Tectona grandis",
  "local_name": "Pohon Jati",
  "family": "Lamiaceae",
  "description": "Pohon jati yang terkenal dengan kayunya yang kuat",
  "is_endemic": false,
  "iucn_status": "LC"
}

# Create Fauna
POST /api/v1/fauna/
{
  "scientific_name": "Pongo pygmaeus",
  "local_name": "Orangutan Kalimantan",
  "family": "Hominidae",
  "description": "Kera besar endemik Borneo",
  "is_endemic": true,
  "iucn_status": "CR"
}

# Create Article
POST /api/v1/articles/
{
  "title": "Keanekaragaman Hayati Indonesia",
  "content": "Indonesia memiliki keanekaragaman hayati yang sangat tinggi...",
  "category": "Konservasi"
}

# Create Gallery
POST /api/v1/galleries/
{
  "title": "Flora Endemik",
  "description": "Koleksi foto flora endemik",
  "image_url": "https://example.com/image.jpg"
}
```

#### **2. Submit for Review:**

```bash
# Regional Admin submits content for review
POST /api/v1/flora/{flora_id}/submit
POST /api/v1/fauna/{fauna_id}/submit
POST /api/v1/articles/{article_id}/submit
POST /api/v1/galleries/{gallery_id}/submit
```

### **Content Approval Process**

#### **3. Super Admin Reviews:**

```bash
# Get pending approvals
GET /api/v1/approvals/

# Approve content
POST /api/v1/flora/{flora_id}/approve
POST /api/v1/fauna/{fauna_id}/approve
POST /api/v1/articles/{article_id}/approve
POST /api/v1/galleries/{gallery_id}/approve

# Reject content with reason
POST /api/v1/flora/{flora_id}/reject
{
  "reason": "Data tidak lengkap, mohon lengkapi informasi habitat"
}
```

---

## 🔄 CONTENT STATUS WORKFLOW

### **Content Status Flow:**

```
DRAFT → IN_REVIEW → APPROVED
  ↓         ↓
REJECTED ← REJECTED
```

### **Status Definitions:**

- **DRAFT:** Content being created/edited
- **IN_REVIEW:** Submitted for approval
- **APPROVED:** Published and visible to public
- **REJECTED:** Rejected with reason

### **Role Permissions by Status:**

| Status        | Regional Admin                    | Super Admin                       |
| ------------- | --------------------------------- | --------------------------------- |
| **DRAFT**     | ✅ Create, Update, Submit, Delete | ✅ Create, Update, Submit, Delete |
| **IN_REVIEW** | ❌ View Only                      | ✅ Approve, Reject                |
| **APPROVED**  | ❌ View Only                      | ✅ View, Delete                   |
| **REJECTED**  | ✅ View, Update, Resubmit, Delete | ✅ View, Delete                   |

---

## 📤 UPLOAD WORKFLOW

### **File Upload Process:**

```bash
# Upload Gallery Image
POST /api/v1/upload/gallery-image
Content-Type: multipart/form-data
file: [image_file]

# Upload Flora Image
POST /api/v1/upload/flora-image
Content-Type: multipart/form-data
file: [image_file]

# Upload Fauna Image
POST /api/v1/upload/fauna-image
Content-Type: multipart/form-data
file: [image_file]
```

### **Upload Permissions:**

- **Regional Admin:** ✅ Can upload files
- **Super Admin:** ✅ Can upload files
- **Public:** ❌ Cannot upload files

---

## 🏞️ PARKS & REGIONS WORKFLOW

### **Parks Management:**

```bash
# List Parks
GET /api/v1/parks/

# Create Park (Super Admin only)
POST /api/v1/parks/
{
  "name": "Taman Nasional Gunung Leuser",
  "slug": "gunung-leuser",
  "region_id": 1,
  "area_ha": 7927.75,
  "description": "Taman nasional di Sumatera"
}

# Update Park (Super Admin only)
PUT /api/v1/parks/{park_id}
{
  "name": "Updated Park Name",
  "area_ha": 8000.00
}
```

### **Regions Management:**

```bash
# List Regions
GET /api/v1/regions/

# Create Region (Super Admin only)
POST /api/v1/regions/
{
  "name": "Kalimantan Timur",
  "code": "KALTIM",
  "is_active": true
}
```

---

## 🤖 AI & CHAT WORKFLOW

### **Chat with AI:**

```bash
# Start Chat Session
POST /api/v1/chat/
{
  "message": "Apa saja flora endemik di Kalimantan?",
  "context": "flora_kalimantan"
}

# Stream Chat Response
GET /api/v1/chat/stream
# Returns: Streaming response

# WebSocket Chat
GET /api/v1/chat/ws
# Returns: WebSocket connection
```

### **AI Permissions:**

- **Regional Admin:** ✅ Can use AI chat
- **Super Admin:** ✅ Can use AI chat
- **Public:** ❌ Cannot use AI chat

---

## 📊 ANALYTICS WORKFLOW

### **Analytics Access:**

```bash
# Get Analytics Dashboard
GET /api/v1/analytics/dashboard

# Get Recent Activity
GET /api/v1/dashboard/activity

# Get Pending Approvals
GET /api/v1/dashboard/approvals
```

### **Analytics Permissions:**

- **Super Admin:** ✅ Full analytics access
- **Regional Admin:** ✅ Regional analytics only
- **Public:** ❌ No analytics access

---

## 🔧 SYSTEM SETTINGS WORKFLOW

### **System Settings (Super Admin Only):**

```bash
# Get System Settings
GET /api/v1/system-settings/

# Update System Settings
PUT /api/v1/system-settings/
{
  "site_name": "Taman Kehati",
  "maintenance_mode": false,
  "max_upload_size": 10485760
}
```

### **Settings Permissions:**

- **Super Admin:** ✅ Full system settings access
- **Regional Admin:** ❌ Cannot access system settings
- **Public:** ❌ Cannot access system settings

---

## 🚫 RESTRICTED OPERATIONS

### **Super Admin Only:**

- ❌ **User Role Changes**
- ❌ **System Settings**
- ❌ **Content Approval/Rejection**
- ❌ **Content Deletion**
- ❌ **Bulk Operations**
- ❌ **Export Functions**
- ❌ **User Activation/Deactivation**

### **Regional Admin Limitations:**

- ❌ **Cannot approve/reject** content (can only submit for review)
- ❌ **Cannot change user roles**
- ❌ **Cannot access system settings**
- ❌ **Cannot perform bulk operations**
- ❌ **Cannot export data**
- ✅ **Can delete** content (but needs approval for changes)

---

## 🔄 TYPICAL WORKFLOW SCENARIOS

### **Scenario 1: New Regional Admin Onboarding**

1. **Super Admin** creates new regional admin user
2. **Super Admin** assigns regional admin role
3. **Regional Admin** logs in and accesses dashboard
4. **Regional Admin** starts creating content
5. **Regional Admin** submits content for review
6. **Super Admin** reviews and approves content
7. **Content** becomes visible to public

### **Scenario 2: Content Management**

1. **Regional Admin** creates flora/fauna data
2. **Regional Admin** uploads images
3. **Regional Admin** submits for review
4. **Super Admin** reviews content
5. **Super Admin** approves or rejects
6. **Approved content** appears in public APIs

### **Scenario 3: User Management**

1. **Super Admin** creates new users
2. **Super Admin** assigns appropriate roles
3. **Super Admin** activates/deactivates users
4. **Regional Admin** can view users in their scope
5. **Public** can only see approved content

---

## 📋 CHECKLIST FOR ROLE TRANSITION

### **Super Admin Checklist:**

- ✅ Create regional admin users
- ✅ Assign appropriate roles
- ✅ Set up regional permissions
- ✅ Review and approve content
- ✅ Manage system settings
- ✅ Monitor system analytics

### **Regional Admin Checklist:**

- ✅ Access regional dashboard
- ✅ Create and manage content
- ✅ Submit content for review
- ✅ Upload files and images
- ✅ Use AI chat features
- ✅ View regional analytics

---

## 🎯 BEST PRACTICES

### **For Super Admins:**

1. **Regular Reviews:** Check pending approvals daily
2. **User Management:** Monitor user activity and roles
3. **System Monitoring:** Keep track of system performance
4. **Content Quality:** Ensure approved content meets standards

### **For Regional Admins:**

1. **Content Creation:** Create high-quality, detailed content
2. **Image Uploads:** Use appropriate, high-resolution images
3. **Review Process:** Submit complete information for review
4. **Regional Focus:** Focus on regional-specific content

---

_Generated on: $(date)_
_System Version: 1.0.0_
_Total Workflows: 15+_
_Supported Roles: 2 (Super Admin, Regional Admin)_
