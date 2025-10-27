# 🔐 APIs YANG MEMERLUKAN AUTHENTICATION

## **1. AUTH APIs (Authentication)**

- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout

## **2. USER MANAGEMENT APIs**

- `GET /api/v1/users/me` - Get Current User
- `GET /api/v1/users/` - List Users
- `POST /api/v1/users/` - Create User
- `GET /api/v1/users/{user_id}` - Get User
- `PUT /api/v1/users/{user_id}` - Update User
- `PUT /api/v1/users/{user_id}/role` - Update User Role
- `PUT /api/v1/users/{user_id}/activate` - Activate User
- `PUT /api/v1/users/{user_id}/deactivate` - Deactivate User

## **3. FLORA MANAGEMENT APIs**

- `GET /api/v1/flora/` - List Flora
- `POST /api/v1/flora/` - Create Flora
- `GET /api/v1/flora/{flora_id}` - Get Flora
- `PUT /api/v1/flora/{flora_id}` - Update Flora
- `DELETE /api/v1/flora/{flora_id}` - Delete Flora
- `POST /api/v1/flora/{flora_id}/submit` - Submit Flora
- `POST /api/v1/flora/{flora_id}/approve` - Approve Flora
- `POST /api/v1/flora/{flora_id}/reject` - Reject Flora
- `GET /api/v1/flora/review` - Review Flora Inbox
- `POST /api/v1/flora/bulk` - Bulk Create Flora
- `GET /api/v1/flora/csv` - Export Flora CSV
- `GET /api/v1/flora/stats` - Flora Stats

## **4. FAUNA MANAGEMENT APIs**

- `GET /api/v1/fauna/` - List Fauna
- `POST /api/v1/fauna/` - Create Fauna
- `GET /api/v1/fauna/{fauna_id}` - Get Fauna
- `PUT /api/v1/fauna/{fauna_id}` - Update Fauna
- `DELETE /api/v1/fauna/{fauna_id}` - Delete Fauna
- `POST /api/v1/fauna/{fauna_id}/submit` - Submit Fauna
- `POST /api/v1/fauna/{fauna_id}/approve` - Approve Fauna
- `POST /api/v1/fauna/{fauna_id}/reject` - Reject Fauna

## **5. ACTIVITIES MANAGEMENT APIs**

- `GET /api/v1/activities/` - List Activities
- `POST /api/v1/activities/` - Create Activity
- `GET /api/v1/activities/{activity_id}` - Get Activity
- `PUT /api/v1/activities/{activity_id}` - Update Activity
- `DELETE /api/v1/activities/{activity_id}` - Delete Activity
- `POST /api/v1/activities/{activity_id}/submit` - Submit Activity
- `POST /api/v1/activities/{activity_id}/approve` - Approve Activity
- `POST /api/v1/activities/{activity_id}/reject` - Reject Activity

## **6. ARTICLES MANAGEMENT APIs**

- `GET /api/v1/articles/` - List Articles
- `POST /api/v1/articles/` - Create Article
- `GET /api/v1/articles/{article_id}` - Get Article
- `PUT /api/v1/articles/{article_id}` - Update Article
- `DELETE /api/v1/articles/{article_id}` - Delete Article
- `POST /api/v1/articles/{article_id}/submit` - Submit Article
- `POST /api/v1/articles/{article_id}/approve` - Approve Article
- `POST /api/v1/articles/{article_id}/reject` - Reject Article

## **7. GALLERIES MANAGEMENT APIs**

- `GET /api/v1/galleries/` - List Galleries
- `POST /api/v1/galleries/` - Create Gallery
- `GET /api/v1/galleries/{gallery_id}` - Get Gallery
- `PUT /api/v1/galleries/{gallery_id}` - Update Gallery
- `DELETE /api/v1/galleries/{gallery_id}` - Delete Gallery
- `POST /api/v1/galleries/{gallery_id}/submit` - Submit Gallery
- `POST /api/v1/galleries/{gallery_id}/approve` - Approve Gallery
- `POST /api/v1/galleries/{gallery_id}/reject` - Reject Gallery

## **8. UPLOAD APIs**

- `POST /api/v1/upload/gallery-image` - Upload Gallery Image
- `DELETE /api/v1/upload/gallery-image/{filename}` - Delete Gallery Image

## **9. PARKS MANAGEMENT APIs**

- `GET /api/v1/parks/` - List Parks
- `GET /api/v1/parks/{park_id}` - Get Park
- `GET /api/v1/parks/{park_id}/stats` - Get Park Stats

## **10. DASHBOARD APIs**

- `GET /api/v1/dashboard/` - Get Dashboard
- `GET /api/v1/dashboard/activity` - Get Recent Activity
- `GET /api/v1/dashboard/approvals` - Get Pending Approvals

## **11. CHAT APIs**

- `GET /api/v1/chat/sessions` - List Sessions
- `POST /api/v1/chat/sessions` - Create Session
- `GET /api/v1/chat/sessions/{session_id}/messages` - Get Messages
- `POST /api/v1/chat/sessions/{session_id}/messages` - Send Message
- `GET /api/v1/chat/sse/{session_id}` - Chat SSE

## **12. ANALYTICS APIs**

- `GET /api/v1/analytics/` - Analytics Root
- `GET /api/v1/analytics/regions/{region_code}/endemic` - Analytics Endemic
- `GET /api/v1/analytics/regions/{region_code}/endemic.csv` - Analytics Endemic CSV
- `GET /api/v1/analytics/regions/{region_code}/iucn` - Analytics IUCN
- `GET /api/v1/analytics/regions/{region_code}/iucn.csv` - Analytics IUCN CSV
- `GET /api/v1/analytics/dashboard` - Get Dashboard

## **13. APPROVALS APIs**

- `GET /api/v1/approvals/` - List Pending Approvals

## **14. SYSTEM SETTINGS APIs**

- `GET /api/v1/system-settings` - List System Settings
- `POST /api/v1/system-settings` - Create System Setting
- `GET /api/v1/system-settings/{setting_key}` - Get System Setting
- `PUT /api/v1/system-settings/{setting_key}` - Update System Setting
- `DELETE /api/v1/system-settings/{setting_key}` - Delete System Setting

## **15. SEARCH APIs**

- `GET /api/v1/search/` - Aggregated Search

## **16. CRUD APIs**

- `GET /api/v1/crud/regions/` - List Regions
- `POST /api/v1/crud/regions/` - Create Region
- `GET /api/v1/crud/parks/` - List Parks
- `POST /api/v1/crud/parks/` - Create Park
- `GET /api/v1/crud/zones/` - List Zones
- `POST /api/v1/crud/zones/` - Create Zone

## **17. REGIONS APIs**

- `GET /api/v1/regions/` - List Regions
- `POST /api/v1/regions/` - Create Region
- `GET /api/v1/regions/{region_id}` - Read Region
- `PUT /api/v1/regions/{region_id}` - Update Region
- `DELETE /api/v1/regions/{region_id}` - Delete Region

## **📊 SUMMARY:**

- **Total APIs requiring authentication**: 70+ endpoints
- **All `/api/v1/*` endpoints require authentication**
- **Public APIs (`/api/public/*`) do NOT require authentication**

## **🔐 AUTHENTICATION METHOD:**

- **Bearer Token** in Authorization header
- **Format**: `Authorization: Bearer <token>`
- **Token obtained from**: `POST /api/v1/auth/login`
