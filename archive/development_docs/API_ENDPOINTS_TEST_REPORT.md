# API Endpoints Test Report
**Date:** October 26, 2025  
**Backend URL:** http://localhost:8000  
**Authentication:** Super Admin (admin@kehati.org)

---

## 📊 Test Summary

| Metric | Value |
|--------|-------|
| **Total Endpoints Tested** | 50 |
| **✅ Passed (200-299)** | 14 (28%) |
| **❌ Failed** | 36 (72%) |
| **⚠️ Method Not Allowed (405)** | 30 |
| **❌ Server Error (500)** | 2 |
| **❌ Validation Error (422)** | 1 |

---

## ✅ Working Endpoints (14)

### 1. Authentication & User Management
- ✅ `GET /api/v1/users/me` - Get current user profile

### 2. Dashboard
- ✅ `GET /api/v1/dashboard/test` - Dashboard test endpoint
- ✅ `GET /api/v1/dashboard/overview-simple` - Simple overview
- ✅ `GET /api/v1/dashboard/comprehensive-simple` - Comprehensive dashboard
- ✅ `GET /api/v1/dashboard/activity` - Recent activity
- ✅ `GET /api/v1/dashboard/approvals` - Pending approvals

### 3. Flora
- ✅ `GET /api/v1/flora` - List all flora
- ✅ `GET /api/v1/flora?status=approved` - List approved flora

### 4. Fauna
- ✅ `GET /api/v1/fauna` - List all fauna
- ✅ `GET /api/v1/fauna?status=approved` - List approved fauna

### 5. News
- ✅ `GET /api/v1/news/public` - Public news list

### 6. Health & Info
- ✅ `GET /health` - Health check
- ✅ `GET /healthz` - Alternative health check
- ✅ `GET /` - Root API info

---

## ⚠️ Endpoints with Issues

### Method Not Allowed (405) - Likely POST Endpoints

These endpoints return 405, which usually means they require POST method instead of GET:

#### Authentication & Users
- ❌ `GET /api/v1/auth/me` → **405**
- ❌ `GET /api/v1/users` → **405**

#### Dashboard
- ❌ `GET /api/v1/dashboard` → **405**

#### Parks
- ❌ `GET /api/v1/parks` → **405**
- ❌ `GET /api/v1/parks?status=approved` → **405**
- ❌ `GET /api/v1/parks?status=draft` → **405**

#### Activities
- ❌ `GET /api/v1/activities` → **405**
- ❌ `GET /api/v1/activities?status=approved` → **405**

#### Articles
- ❌ `GET /api/v1/articles` → **405**
- ❌ `GET /api/v1/articles?status=approved` → **405**
- ❌ `GET /api/public/artikel` → **405**

#### News
- ❌ `GET /api/v1/news` → **405**

#### Announcements
- ❌ `GET /api/v1/announcements` → **405**
- ❌ `GET /api/v1/announcements?status=active` → **405**
- ❌ `GET /api/public/announcements` → **405**

#### Galleries
- ❌ `GET /api/v1/galleries` → **405**
- ❌ `GET /api/public/galeri` → **405**

#### Approvals
- ❌ `GET /api/v1/approvals` → **405**
- ❌ `GET /api/v1/approvals?entity_type=flora` → **405**
- ❌ `GET /api/v1/approvals?entity_type=fauna` → **405**

#### Notifications
- ❌ `GET /api/v1/notifications` → **405**

#### Search
- ❌ `GET /api/v1/search?q=flora` → **405**
- ❌ `GET /api/public/search?q=flora` → **405**

#### System Settings
- ❌ `GET /api/v1/system-settings` → **405**

#### Analytics
- ❌ `GET /api/v1/analytics` → **405**

#### Indonesia Regions
- ❌ `GET /api/v1/indonesia/provinces` → **405**
- ❌ `GET /api/v1/indonesia/regencies` → **405**

#### Public Stats
- ❌ `GET /api/public/stats` → **405**
- ❌ `GET /api/public/stats/biodiversity` → **405**

#### AI Chatbot
- ❌ `GET /api/v1/ai/chat/sessions` → **405**
- ❌ `GET /api/public/chat/health` → **405**

### Server Errors (500)
- ❌ `GET /api/public/parks` → **500** (Internal Server Error)
- ❌ `GET /api/v1/analytics/dashboard` → **500** (Internal Server Error)

### Validation Errors (422)
- ❌ `GET /api/v1/notifications/unread` → **422** (Unprocessable Entity)

### Method Not Allowed (405) - Public Flora/Fauna
- ❌ `GET /api/public/flora` → **405**
- ❌ `GET /api/public/fauna` → **405**

---

## 📝 Recommendations

### 1. Fix 405 Method Not Allowed Errors
Most endpoints returning 405 need to be checked for correct HTTP method. The routes might be:
- Using POST instead of GET
- Missing route decorators
- Incorrect route definitions

### 2. Fix 500 Server Errors
Critical endpoints with server errors:
- `/api/public/parks` - Public parks list (high priority)
- `/api/v1/analytics/dashboard` - Analytics dashboard

### 3. Fix Validation Error
- `/api/v1/notifications/unread` - Returns 422, likely missing query parameters or incorrect request format

### 4. Verify Route Definitions
Check the following route files for correct HTTP methods:
- `apps/backend/api/v1/routes/parks.py`
- `apps/backend/api/v1/routes/articles.py`
- `apps/backend/api/v1/routes/announcements.py`
- `apps/backend/api/v1/routes/approvals.py`
- `apps/backend/api/v1/routes/notifications.py`
- `apps/backend/api/v1/routes/search.py`
- `apps/backend/api/v1/public/*.py`

---

## 🎯 Priority Actions

### High Priority (Critical for Frontend)
1. ✅ Flora endpoints - **WORKING**
2. ✅ Fauna endpoints - **WORKING**
3. ❌ Parks endpoints - **NEEDS FIX** (405 errors)
4. ❌ Public parks endpoint - **NEEDS FIX** (500 error)
5. ❌ Articles endpoints - **NEEDS FIX** (405 errors)
6. ❌ Galleries endpoints - **NEEDS FIX** (405 errors)

### Medium Priority
1. ❌ Announcements - **NEEDS FIX** (405 errors)
2. ❌ Search functionality - **NEEDS FIX** (405 errors)
3. ❌ Approvals system - **NEEDS FIX** (405 errors)
4. ❌ Notifications - **NEEDS FIX** (405 & 422 errors)

### Low Priority
1. ❌ Analytics dashboard - **NEEDS FIX** (500 error)
2. ❌ Indonesia regions - **NEEDS FIX** (405 errors)
3. ❌ AI Chatbot - **NEEDS FIX** (405 errors)
4. ❌ Public stats - **NEEDS FIX** (405 errors)

---

## 📖 Next Steps

1. **Review Route Definitions**: Check all route files to ensure they use correct HTTP methods
2. **Fix Server Errors**: Debug the 500 errors in parks and analytics endpoints
3. **Test with POST**: Try POST method for endpoints returning 405
4. **Update Frontend**: Ensure frontend uses correct HTTP methods for each endpoint
5. **Add API Documentation**: Generate OpenAPI/Swagger docs for all endpoints
6. **Create Integration Tests**: Add automated tests for all critical endpoints

---

## 🔗 Related Files

- Test Script: `test_endpoints_report.sh`
- Backend Main: `apps/backend/main.py`
- Route Definitions: `apps/backend/api/v1/routes/`
- Public Routes: `apps/backend/api/v1/public/`

---

**Generated:** October 26, 2025  
**Status:** ⚠️ Many endpoints need fixes before production use

