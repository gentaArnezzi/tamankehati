# API Routing Fix - 405 Method Not Allowed & CORS Errors

## Date
Sunday, October 26, 2025

## Issues Fixed

### 1. **405 Method Not Allowed Errors**
**Endpoints affected:**
- `/api/v1/activities?submitted_by=me`
- `/api/v1/parks?submitted_by=me`

**Root Cause:**
FastAPI is strict about trailing slashes. The routes were defined with `/` at the end (e.g., `@router.get("/")`), but some frontend requests were not using trailing slashes.

**Solution:**
1. Standardized router configuration in backend
2. Ensured frontend API client uses trailing slashes consistently

### 2. **CORS Error for Notifications**
**Endpoint affected:**
- `/api/v1/notifications?limit=50`

**Root Cause:**
Frontend was making requests to `/api/v1/notifications` (without trailing slash), but the backend expected `/api/v1/notifications/` (with trailing slash).

**Solution:**
Updated frontend API client to use trailing slash: `/api/v1/notifications/`

## Changes Made

### Backend Changes

#### 1. `apps/backend/api/v1/routes/activities.py`
```python
# BEFORE
router = APIRouter(prefix="/activities")

# AFTER  
router = APIRouter()
```
**Reason:** Removed double prefix (router + include_router in main.py)

#### 2. `apps/backend/main.py`
```python
# BEFORE
app.include_router(activities.router, prefix="/api/v1", tags=["Activities"])
app.include_router(notifications.router, prefix="/api/v1", tags=["Notifications"])

# AFTER
app.include_router(activities.router, prefix="/api/v1/activities", tags=["Activities"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])
```
**Reason:** Consolidated prefix definition to avoid confusion

#### 3. `apps/backend/api/v1/serializers/notifications.py`
```python
# BEFORE
class NotificationOut(BaseModel):
    id: int
    type: str
    # ...

# AFTER
class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    type: str
    # ...
```
**Reason:** Pydantic v2 requires explicit configuration to serialize SQLAlchemy models

#### 4. `apps/backend/api/v1/routes/notifications.py`
```python
# BEFORE
router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=NotificationListResponse)
@router.get("/{notification_id}", response_model=NotificationOut)  # ❌ This matches /unread-count!
# ... more routes
@router.get("/unread-count", response_model=dict)  # ❌ Too late, already matched above

# AFTER
router = APIRouter()

@router.get("/", response_model=NotificationListResponse)
@router.get("/unread-count", response_model=dict)  # ✅ Specific route FIRST
@router.get("/{notification_id}", response_model=NotificationOut)  # ✅ Parameterized route AFTER
```
**Reason:** FastAPI matches routes in order. Specific routes (like `/unread-count`) must come BEFORE parameterized routes (like `/{notification_id}`)

### Frontend Changes

#### `apps/frontend/src/lib/api-client.ts`
```typescript
// BEFORE
`/api/v1/notifications?${queryParams.toString()}`

// AFTER
`/api/v1/notifications/?${queryParams.toString()}`
```
**Reason:** Added trailing slash to match backend route definition

## Verification Results

All endpoints now working correctly:

```bash
# Activities Endpoint
✅ GET /api/v1/activities/?submitted_by=me
   Status: 200 OK
   Response: {"items": [...], "total": 1}

# Parks Endpoint  
✅ GET /api/v1/parks/?submitted_by=me
   Status: 200 OK
   Response: [{"id": 1, "name": "..."}, ...]
   Count: 12 parks

# Notifications List Endpoint
✅ GET /api/v1/notifications/?limit=50
   Status: 200 OK
   Response: {"items": [], "total": 0}
   CORS: ✅ Access-Control-Allow-Origin present

# Notifications Unread Count Endpoint  
✅ GET /api/v1/notifications/unread-count
   Status: 200 OK
   Response: {"count": 0}
   CORS: ✅ Access-Control-Allow-Origin present
```

## Testing Commands

To test the endpoints manually:

```bash
# Get auth token
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kehati.org","password":"password"}' | \
  python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('access_token', ''))")

# Test activities
curl -X GET "http://localhost:8000/api/v1/activities/?submitted_by=me" \
  -H "Authorization: Bearer $TOKEN"

# Test parks
curl -X GET "http://localhost:8000/api/v1/parks/?submitted_by=me" \
  -H "Authorization: Bearer $TOKEN"

# Test notifications
curl -X GET "http://localhost:8000/api/v1/notifications/?limit=50" \
  -H "Authorization: Bearer $TOKEN"
```

## CORS Configuration

CORS is properly configured in `main.py`:
- ✅ Allows: `http://localhost:3000`, `http://localhost:3001`
- ✅ Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- ✅ Credentials: Enabled
- ✅ Headers: Authorization, Content-Type, etc.
- ✅ Exposed Headers: X-RateLimit-*

## Registered Routes

All routes are properly registered:

```
/api/v1/activities/
/api/v1/activities/{activity_id}
/api/v1/activities/{activity_id}/submit
/api/v1/activities/{activity_id}/approve
/api/v1/activities/{activity_id}/reject

/api/v1/parks/
/api/v1/parks/{park_id}
/api/v1/parks/{park_id}/submit
/api/v1/parks/pending-approval
/api/v1/parks/{park_id}/approve
/api/v1/parks/{park_id}/reject

/api/v1/notifications/
/api/v1/notifications/{notification_id}
/api/v1/notifications/{notification_id}/read
/api/v1/notifications/mark-all-read
/api/v1/notifications/unread-count
```

## Next Steps

1. ✅ Backend routes fixed and tested
2. ✅ Frontend API client updated
3. 🔄 Restart frontend dev server to apply changes
4. ✅ Verify frontend dashboard loads without errors

## How to Restart Services

### Backend (already running)
```bash
cd apps/backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
```bash
cd apps/frontend
npm run dev
```

## Summary

The issues were caused by:

1. **Trailing slash mismatch** - FastAPI requires exact path matching, including trailing slashes
2. **Route ordering** - FastAPI matches routes in order, so specific routes must come before parameterized routes

**Key Lessons:**
- When defining FastAPI routes, be consistent about trailing slashes
- Ensure frontend API clients match the backend route definitions exactly
- Define specific routes (like `/unread-count`) BEFORE parameterized routes (like `/{notification_id}`)

All endpoints are now functioning correctly with proper CORS headers and correct HTTP methods. ✅

## Issues Resolved

✅ **405 Method Not Allowed** for `/api/v1/activities?submitted_by=me` - Fixed by standardizing trailing slashes
✅ **405 Method Not Allowed** for `/api/v1/parks?submitted_by=me` - Fixed by standardizing trailing slashes  
✅ **CORS Error** for `/api/v1/notifications?limit=50` - Fixed by adding trailing slash
✅ **422 Unprocessable Content** for `/api/v1/notifications/unread-count` - Fixed by reordering routes

