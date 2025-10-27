# 📢 Notification Flow Summary

## ✅ Updated RBAC Model

**BEFORE (Region-Based):**
- Regional Admin JKT → only see data from JKT region
- Regional Admin Bali → only see data from Bali region

**NOW (Submission-Based):**
- Regional Admin → only see data they submitted (`submitted_by = user.id`)
- Super Admin → see ALL data
- Notifications → sent directly to specific users (`to_user_id`)

---

## 🔔 Notification System Architecture

### 1. **Announcement Broadcast (Super Admin → All Regional Admins)**

```
Super Admin creates announcement
    ↓
    target_audience = "regional_admin" (default)
    ↓
    Super Admin clicks "Publish"
    ↓
    notify_announcement_published() is called
    ↓
    Query: SELECT * FROM users WHERE role = 'regional_admin' AND is_active = true
    ↓
    Create notification for EACH Regional Admin:
        - to_user_id = regional_admin_1.id
        - to_user_id = regional_admin_2.id
        - to_user_id = regional_admin_3.id
        - ... (all regional admins)
    ↓
    Each Regional Admin sees notification in their bell icon 🔔
```

### 2. **Target Audience Options**

| target_audience    | Who Gets Notified                      |
|--------------------|----------------------------------------|
| `"regional_admin"` | **ALL Regional Admins** (broadcast)    |
| `"super_admin"`    | ALL Super Admins                       |
| `"all"`            | Everyone (Regional + Super Admins)     |

**Default**: `"regional_admin"` (most common use case)

### 3. **Notification Filtering (Per User)**

```sql
-- Each user only sees their OWN notifications
SELECT * FROM notifications 
WHERE to_user_id = :current_user_id
ORDER BY created_at DESC
```

**No region filtering** - simple and straightforward!

---

## 📊 Example Scenarios

### Scenario 1: Super Admin publishes announcement
```
Input:
  - published_by: Super Admin (id=1)
  - target_audience: "regional_admin"
  - title: "New Policy Update"

Process:
  - Query all Regional Admins: [user_2, user_3, user_4, user_5]
  - Create 4 notifications

Result:
  - user_2 sees: "Pengumuman Baru: New Policy Update"
  - user_3 sees: "Pengumuman Baru: New Policy Update"
  - user_4 sees: "Pengumuman Baru: New Policy Update"
  - user_5 sees: "Pengumuman Baru: New Policy Update"
  - Super Admin (user_1) does NOT see it (published_by is excluded)
```

### Scenario 2: Regional Admin submits park for approval
```
Input:
  - submitted_by: Regional Admin JKT (id=2)
  - park_name: "Taman Kota Baru"

Process:
  - Query all Super Admins: [user_1]
  - Create 1 notification

Result:
  - user_1 (Super Admin) sees: "Persetujuan Diperlukan: Taman Kota Baru"
  - Regional Admin (user_2) does NOT see it
```

### Scenario 3: Super Admin approves park
```
Input:
  - approved_by: Super Admin (id=1)
  - submitted_by: Regional Admin JKT (id=2)
  - park_name: "Taman Kota Baru"

Process:
  - Create notification for submitter only: [user_2]
  - Create 1 notification

Result:
  - user_2 (Regional Admin) sees: "Taman Disetujui: Taman Kota Baru"
  - Super Admin (user_1) does NOT see it
```

---

## 🔧 Key Implementation Details

### Database Schema
```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    to_user_id INTEGER NOT NULL,           -- Who receives this
    from_user_id INTEGER,                  -- Who sent this (optional)
    type VARCHAR(50) NOT NULL,             -- e.g., "announcement_published"
    title VARCHAR(255) NOT NULL,           -- "Pengumuman Baru"
    message TEXT NOT NULL,                 -- Full message
    resource VARCHAR(100),                 -- "announcement", "park", "article"
    resource_id INTEGER,                   -- ID of the resource
    region_code VARCHAR(10),               -- Kept for audit (not used in filtering)
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Key Index for Performance
CREATE INDEX idx_notifications_to_user_id ON notifications(to_user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

### Backend Routes
- `GET /api/v1/notifications` - List user's notifications
- `GET /api/v1/notifications/unread-count` - Get unread count
- `POST /api/v1/notifications/{id}/read` - Mark as read
- `POST /api/v1/notifications/mark-all-read` - Mark all as read

### Frontend Components
- `NotificationDropdown.tsx` - Bell icon with dropdown
- `useNotifications.ts` - React hook for managing state
- Polling every 30 seconds for real-time updates

---

## 🎯 Benefits of This Approach

1. **✅ Simple** - One filter: `to_user_id`
2. **✅ Flexible** - Not tied to regions
3. **✅ Performant** - Direct index lookup
4. **✅ Secure** - Users only see their own notifications
5. **✅ Scalable** - Works with millions of notifications
6. **✅ Broadcast-ready** - Easy to notify all users of a role

---

## 🚀 Testing

### Test 1: Super Admin publishes announcement
```bash
# Login as Super Admin
# Create announcement with target_audience = "regional_admin"
# Click "Publish"
# Expected: All Regional Admins see notification in bell icon
```

### Test 2: Regional Admin receives notification
```bash
# Login as Regional Admin
# Check bell icon (should have unread count)
# Click bell → see list of notifications
# Click notification → mark as read → navigate to announcement
```

### Test 3: No region filtering
```bash
# Regional Admin JKT publishes announcement
# Regional Admin Bali should also see it (if target_audience = "all")
# No filtering by region_code
```

---

## 📝 Summary

**Key Points:**
- Super Admin publish announcement → **ALL Regional Admins** get notified
- No region-based filtering → **Submission-based** access control
- Notifications sent directly to `to_user_id` → Simple & fast
- `region_code` kept in table for audit, but not used for filtering

**Status:** ✅ **READY TO USE**

Start backend and test! 🚀


