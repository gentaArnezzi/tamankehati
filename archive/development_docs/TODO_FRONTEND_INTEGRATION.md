# TODO: FRONTEND INTEGRATION WITH RAILWAY BACKEND
**Created**: October 25, 2025  
**Backend Status**: ✅ Ready (18/18 CMS endpoints working)  
**Database**: ✅ Railway PostgreSQL Connected  
**Next Phase**: Frontend Integration

---

## 🎯 OVERVIEW

Backend sudah 100% ready dengan Railway database. Sekarang fokus ke:
1. Frontend integration dengan backend yang baru
2. Testing end-to-end workflow
3. Bug fixes & improvements
4. Deployment preparation

---

## 🔴 HIGH PRIORITY - FRONTEND INTEGRATION

### ✅ COMPLETED
- [x] Backend connected to Railway database
- [x] All CMS endpoints tested and working
- [x] Regional admin auto-filtering implemented
- [x] Documentation created (FRONTEND_INTEGRATION_FINAL.md)
- [x] Test credentials verified
- [x] Schema alignment completed

### 🔥 IMMEDIATE (Do First)

#### 1. Test Frontend Login with Railway Backend
**Priority**: 🔴 CRITICAL  
**Estimated Time**: 15 minutes

**Tasks**:
- [ ] Start backend (if not running): `cd apps/backend && uvicorn main:app --reload --port 8000`
- [ ] Start frontend: `cd apps/frontend && npm run dev -- --port 3000`
- [ ] Test login as Super Admin (`admin@kehati.org` / `password`)
- [ ] Test login as Regional Admin (`kaltim.admin@kehati.org` / `password`)
- [ ] Verify token is stored in localStorage
- [ ] Verify user data is correct

**Success Criteria**:
- ✅ Can login with both accounts
- ✅ Token saved to localStorage
- ✅ Redirected to dashboard after login
- ✅ User info displayed correctly

**Files to Check**:
- `apps/frontend/src/lib/useAuth.tsx`
- `apps/frontend/src/lib/api-client.ts`
- `apps/frontend/src/components/LoginPage.tsx`

---

#### 2. Test Dashboard Endpoints
**Priority**: 🔴 CRITICAL  
**Estimated Time**: 20 minutes

**Tasks**:
- [ ] Login as Super Admin
- [ ] Check dashboard stats display correctly
- [ ] Verify stats show counts for all regions
- [ ] Login as Regional Admin (KALTIM)
- [ ] Check dashboard stats show KALTIM data only
- [ ] Verify no errors in console

**Success Criteria**:
- ✅ Super Admin sees all data
- ✅ Regional Admin sees only KALTIM data
- ✅ Stats numbers are accurate
- ✅ No 500/401/403 errors

**API Endpoint**: `GET /api/v1/dashboard/`

**Files to Check**:
- `apps/frontend/src/components/Dashboard.tsx`
- `apps/frontend/src/app/dashboard/page.tsx`

---

#### 3. Test Parks (Taman) CRUD
**Priority**: 🔴 CRITICAL  
**Estimated Time**: 30 minutes

**Tasks**:
- [ ] Login as Regional Admin (KALTIM)
- [ ] Navigate to `/dashboard/taman`
- [ ] Verify form displays correctly
- [ ] Fill and submit park form:
  ```
  Name: Taman Kehati Test Borneo
  Region: Kalimantan Timur (ID: 23)
  Area: 150.75 ha
  Description: Test taman untuk integrasi
  SK Penetapan: SK/TEST/2025
  Pengelola: Dinas Lingkungan Hidup KALTIM
  ```
- [ ] Verify park created successfully (201 response)
- [ ] Verify park appears in submitted parks list
- [ ] Verify status shows "Draft"
- [ ] Check park has correct `created_by` (user ID)

**Success Criteria**:
- ✅ Form submission works
- ✅ Park appears in list
- ✅ Status badge shows correctly
- ✅ Regional admin only sees their parks

**API Endpoints**:
- `GET /api/v1/crud/parks/`
- `POST /api/v1/crud/parks/`

**Files to Check**:
- `apps/frontend/src/components/taman/TamanSubmissionPage.tsx`
- `apps/frontend/src/app/dashboard/taman/page.tsx`

---

#### 4. Test Approvals Page
**Priority**: 🔴 CRITICAL  
**Estimated Time**: 20 minutes

**Tasks**:
- [ ] Logout Regional Admin
- [ ] Login as Super Admin
- [ ] Navigate to `/dashboard/approval`
- [ ] Verify "Taman" tab exists
- [ ] Check submitted park appears in approvals
- [ ] Verify park details shown correctly
- [ ] Check counts are accurate (Taman: 1)

**Success Criteria**:
- ✅ Approvals page loads
- ✅ Taman tab visible
- ✅ Submitted park appears
- ✅ Counts accurate
- ✅ Can see submitter info

**API Endpoint**: `GET /api/v1/approvals/?entity_type=taman`

**Files to Check**:
- `apps/frontend/src/components/approval/ApprovalPage.tsx`
- `apps/frontend/src/app/dashboard/approval/page.tsx`

---

#### 5. Test Flora Listing
**Priority**: 🟡 HIGH  
**Estimated Time**: 15 minutes

**Tasks**:
- [ ] Login as Super Admin
- [ ] Navigate to `/dashboard/taman/flora`
- [ ] Verify flora list loads (may be empty)
- [ ] Login as Regional Admin (KALTIM)
- [ ] Navigate to `/dashboard/taman/flora`
- [ ] Verify only KALTIM flora shown (if any)
- [ ] Check no 500 errors

**Success Criteria**:
- ✅ Page loads without errors
- ✅ Regional filtering works
- ✅ Empty state handled gracefully

**API Endpoint**: `GET /api/v1/flora/`

**Files to Check**:
- `apps/frontend/src/components/flora/FloraPage.tsx`
- `apps/frontend/src/app/dashboard/taman/flora/page.tsx`

---

#### 6. Test Fauna Listing
**Priority**: 🟡 HIGH  
**Estimated Time**: 15 minutes

**Tasks**:
- [ ] Login as Super Admin
- [ ] Navigate to `/dashboard/taman/fauna`
- [ ] Verify fauna list loads (may be empty)
- [ ] Login as Regional Admin (KALTIM)
- [ ] Navigate to `/dashboard/taman/fauna`
- [ ] Verify only KALTIM fauna shown (if any)
- [ ] Check no 500 errors

**Success Criteria**:
- ✅ Page loads without errors
- ✅ Regional filtering works
- ✅ Empty state handled gracefully

**API Endpoint**: `GET /api/v1/fauna/`

**Files to Check**:
- `apps/frontend/src/components/fauna/FaunaPage.tsx`
- `apps/frontend/src/app/dashboard/taman/fauna/page.tsx`

---

#### 7. Test Activities Listing
**Priority**: 🟡 HIGH  
**Estimated Time**: 15 minutes

**Tasks**:
- [ ] Login as Super Admin
- [ ] Navigate to `/dashboard/activities`
- [ ] Verify activities list loads
- [ ] Login as Regional Admin (KALTIM)
- [ ] Verify only KALTIM activities shown
- [ ] Check no 500 errors

**Success Criteria**:
- ✅ Page loads without errors
- ✅ Regional filtering works
- ✅ Empty state handled gracefully

**API Endpoint**: `GET /api/v1/activities/`

**Files to Check**:
- `apps/frontend/src/components/activities/ActivitiesPage.tsx`
- `apps/frontend/src/app/dashboard/activities/page.tsx`

---

## 🟡 MEDIUM PRIORITY - ENHANCEMENTS

### 8. Add Parks Approve/Reject Functionality
**Priority**: 🟡 MEDIUM  
**Estimated Time**: 2 hours

**Tasks**:
- [ ] Create backend endpoints:
  - [ ] `POST /api/v1/crud/parks/{id}/approve`
  - [ ] `POST /api/v1/crud/parks/{id}/reject`
- [ ] Update `apps/backend/api/v1/routes/parks_crud.py`
- [ ] Add approve/reject buttons in ApprovalPage
- [ ] Add confirmation dialogs
- [ ] Update park status after action
- [ ] Refresh approvals list after action
- [ ] Test workflow end-to-end

**Success Criteria**:
- ✅ Super admin can approve parks
- ✅ Super admin can reject parks
- ✅ Status updates correctly (draft → published)
- ✅ Regional admin sees status change

**Files to Create/Modify**:
- `apps/backend/api/v1/routes/parks_crud.py` (add endpoints)
- `apps/frontend/src/components/approval/ApprovalPage.tsx` (add buttons)
- `apps/frontend/src/lib/api-client.ts` (add API calls)

---

### 9. Add Flora CRUD (Create/Edit/Delete)
**Priority**: 🟡 MEDIUM  
**Estimated Time**: 2 hours

**Tasks**:
- [ ] Verify backend endpoints exist:
  - [ ] `POST /api/v1/flora/`
  - [ ] `PUT /api/v1/flora/{id}`
  - [ ] `DELETE /api/v1/flora/{id}`
- [ ] Test endpoints with Postman/curl
- [ ] Update FloraForm component if needed
- [ ] Test create flora as regional admin
- [ ] Test edit flora
- [ ] Test delete flora
- [ ] Verify regional admin can only edit their flora

**Success Criteria**:
- ✅ Can create flora
- ✅ Can edit flora
- ✅ Can delete flora
- ✅ Regional filtering enforced

**Files to Check**:
- `apps/backend/api/v1/routes/flora.py`
- `apps/frontend/src/components/flora/FloraForm.tsx`
- `apps/frontend/src/components/flora/FloraPage.tsx`

---

### 10. Add Fauna CRUD (Create/Edit/Delete)
**Priority**: 🟡 MEDIUM  
**Estimated Time**: 2 hours

**Tasks**:
- [ ] Verify backend endpoints exist:
  - [ ] `POST /api/v1/fauna/`
  - [ ] `PUT /api/v1/fauna/{id}`
  - [ ] `DELETE /api/v1/fauna/{id}`
- [ ] Test endpoints with Postman/curl
- [ ] Update FaunaForm component if needed
- [ ] Test create fauna as regional admin
- [ ] Test edit fauna
- [ ] Test delete fauna
- [ ] Verify regional admin can only edit their fauna

**Success Criteria**:
- ✅ Can create fauna
- ✅ Can edit fauna
- ✅ Can delete fauna
- ✅ Regional filtering enforced

**Files to Check**:
- `apps/backend/api/v1/routes/fauna.py`
- `apps/frontend/src/components/fauna/FaunaForm.tsx`
- `apps/frontend/src/components/fauna/FaunaPage.tsx`

---

### 11. Test Articles & Galleries
**Priority**: 🟡 MEDIUM  
**Estimated Time**: 30 minutes

**Tasks**:
- [ ] Test articles listing
- [ ] Test galleries listing
- [ ] Verify regional filtering
- [ ] Check CRUD operations (if implemented)

**API Endpoints**:
- `GET /api/v1/articles/`
- `GET /api/v1/galleries/`

---

### 12. Add Loading States & Error Handling
**Priority**: 🟡 MEDIUM  
**Estimated Time**: 1 hour

**Tasks**:
- [ ] Add loading spinners to all data fetching
- [ ] Add error messages for failed requests
- [ ] Add retry buttons for failed requests
- [ ] Add toast notifications for success/error
- [ ] Handle 401 (redirect to login)
- [ ] Handle 403 (show permission denied)
- [ ] Handle 500 (show generic error)

**Files to Update**:
- All page components that fetch data
- `apps/frontend/src/lib/api-client.ts` (centralized error handling)

---

## 🟢 LOW PRIORITY - POLISH & OPTIMIZATION

### 13. Improve UI/UX
**Priority**: 🟢 LOW  
**Estimated Time**: 2 hours

**Tasks**:
- [ ] Add empty states for lists
- [ ] Improve form validation messages
- [ ] Add confirmation dialogs for delete actions
- [ ] Improve status badges styling
- [ ] Add breadcrumbs navigation
- [ ] Add tooltips for icons
- [ ] Improve mobile responsiveness

---

### 14. Add Search & Filters
**Priority**: 🟢 LOW  
**Estimated Time**: 2 hours

**Tasks**:
- [ ] Add search input to parks list
- [ ] Add search input to flora list
- [ ] Add search input to fauna list
- [ ] Add status filter dropdowns
- [ ] Add region filter for super admin
- [ ] Add date range filters

---

### 15. Add Pagination
**Priority**: 🟢 LOW  
**Estimated Time**: 1 hour

**Tasks**:
- [ ] Add pagination controls to all lists
- [ ] Implement page size selector
- [ ] Add "Go to page" input
- [ ] Show total items count
- [ ] Persist pagination state in URL

---

### 16. Add Data Export
**Priority**: 🟢 LOW  
**Estimated Time**: 1 hour

**Tasks**:
- [ ] Add "Export to CSV" button
- [ ] Add "Export to Excel" button
- [ ] Add "Print" button
- [ ] Implement export functionality

---

## 🔧 TECHNICAL DEBT & CLEANUP

### 17. Code Cleanup
**Priority**: 🟢 LOW  
**Estimated Time**: 1 hour

**Tasks**:
- [ ] Remove unused imports
- [ ] Remove commented code
- [ ] Fix linter warnings
- [ ] Add TypeScript types where missing
- [ ] Standardize naming conventions

---

### 18. Add Tests
**Priority**: 🟢 LOW  
**Estimated Time**: 4 hours

**Tasks**:
- [ ] Add unit tests for API client
- [ ] Add unit tests for auth hooks
- [ ] Add integration tests for login flow
- [ ] Add E2E tests for critical workflows
- [ ] Add backend endpoint tests

---

### 19. Performance Optimization
**Priority**: 🟢 LOW  
**Estimated Time**: 2 hours

**Tasks**:
- [ ] Add React Query for data caching
- [ ] Implement debouncing for search
- [ ] Add lazy loading for images
- [ ] Optimize bundle size
- [ ] Add service worker for offline support

---

## 📊 DATABASE TASKS

### 20. Seed Demo Data
**Priority**: 🟡 MEDIUM  
**Estimated Time**: 1 hour

**Tasks**:
- [ ] Create seed script for demo parks
- [ ] Create seed script for demo flora
- [ ] Create seed script for demo fauna
- [ ] Create seed script for demo activities
- [ ] Run seed scripts on Railway database

**Purpose**: Make testing easier with pre-populated data

---

### 21. Add More Regional Admins
**Priority**: 🟢 LOW  
**Estimated Time**: 30 minutes

**Tasks**:
- [ ] Create regional admins for other provinces:
  - [ ] SUMUT (sumut.admin@kehati.org)
  - [ ] JABAR (jabar.admin@kehati.org)
  - [ ] BALI (bali.admin@kehati.org)
  - [ ] SULSEL (sulsel.admin@kehati.org)
- [ ] Update documentation with new credentials

---

### 22. Database Backup Strategy
**Priority**: 🟡 MEDIUM  
**Estimated Time**: 30 minutes

**Tasks**:
- [ ] Setup automated daily backups on Railway
- [ ] Document backup restoration process
- [ ] Test backup restoration
- [ ] Create backup script for local testing

---

## 🔒 SECURITY TASKS

### 23. Security Audit
**Priority**: 🟡 MEDIUM  
**Estimated Time**: 2 hours

**Tasks**:
- [ ] Review authentication flow
- [ ] Check for SQL injection vulnerabilities
- [ ] Check for XSS vulnerabilities
- [ ] Review CORS configuration
- [ ] Add rate limiting to sensitive endpoints
- [ ] Add input sanitization
- [ ] Review password hashing (bcrypt)
- [ ] Add CSRF protection

---

### 24. Add Audit Logging
**Priority**: 🟢 LOW  
**Estimated Time**: 2 hours

**Tasks**:
- [ ] Log all CRUD operations
- [ ] Log authentication attempts
- [ ] Log approval/rejection actions
- [ ] Create audit log viewer for super admin

---

## 📚 DOCUMENTATION TASKS

### 25. Update Documentation
**Priority**: 🟢 LOW  
**Estimated Time**: 1 hour

**Tasks**:
- [ ] Update README with setup instructions
- [ ] Document environment variables
- [ ] Add API documentation (Swagger)
- [ ] Create user manual for admins
- [ ] Document deployment process

---

### 26. Create Video Tutorials
**Priority**: 🟢 LOW  
**Estimated Time**: 2 hours

**Tasks**:
- [ ] Record super admin workflow
- [ ] Record regional admin workflow
- [ ] Record park submission process
- [ ] Record approval process

---

## 🚀 DEPLOYMENT TASKS

### 27. Frontend Deployment
**Priority**: 🟡 MEDIUM  
**Estimated Time**: 1 hour

**Tasks**:
- [ ] Choose hosting platform (Vercel/Netlify/Railway)
- [ ] Configure environment variables
- [ ] Setup CI/CD pipeline
- [ ] Deploy frontend
- [ ] Test deployed frontend
- [ ] Update CORS in backend

---

### 28. Backend Deployment
**Priority**: 🟡 MEDIUM  
**Estimated Time**: 1 hour

**Tasks**:
- [ ] Backend already on Railway (if running locally)
- [ ] Or deploy to Railway/Heroku/DigitalOcean
- [ ] Configure production environment variables
- [ ] Setup SSL certificate
- [ ] Test deployed backend
- [ ] Update frontend API URL

---

### 29. Domain & DNS Setup
**Priority**: 🟢 LOW  
**Estimated Time**: 30 minutes

**Tasks**:
- [ ] Purchase domain (if needed)
- [ ] Configure DNS records
- [ ] Setup SSL certificate
- [ ] Update CORS with production domain

---

## 📊 MONITORING & ANALYTICS

### 30. Add Monitoring
**Priority**: 🟢 LOW  
**Estimated Time**: 1 hour

**Tasks**:
- [ ] Add error tracking (Sentry)
- [ ] Add analytics (Google Analytics)
- [ ] Add uptime monitoring
- [ ] Add performance monitoring
- [ ] Setup alerts for errors

---

## ✅ COMPLETION CHECKLIST

### Phase 1: Core Integration (Week 1)
- [ ] Tasks 1-7 completed (Frontend integration & testing)
- [ ] All critical endpoints working
- [ ] Regional admin filtering verified
- [ ] Basic CRUD operations working

### Phase 2: Enhancements (Week 2)
- [ ] Tasks 8-12 completed (Approve/reject, CRUD, error handling)
- [ ] All features functional
- [ ] Good user experience

### Phase 3: Polish (Week 3)
- [ ] Tasks 13-19 completed (UI/UX, optimization, cleanup)
- [ ] Code quality improved
- [ ] Performance optimized

### Phase 4: Production (Week 4)
- [ ] Tasks 20-30 completed (Security, deployment, monitoring)
- [ ] Deployed to production
- [ ] Monitoring active
- [ ] Documentation complete

---

## 📞 SUPPORT & RESOURCES

### Documentation References
- **`FRONTEND_INTEGRATION_FINAL.md`** - Complete API reference
- **`RAILWAY_MIGRATION_SUMMARY.md`** - What was done
- **`QUICK_START.md`** - Quick reference guide

### Test Credentials
```
Super Admin:
  Email: admin@kehati.org
  Password: password

Regional Admin (KALTIM):
  Email: kaltim.admin@kehati.org
  Password: password
```

### Backend Status
```
URL: http://localhost:8000
API Docs: http://localhost:8000/docs
Status: 🟢 Running
Endpoints: 18/18 working (100%)
```

### Test Commands
```bash
# Test backend
./apps/backend/test_all_endpoints.sh

# Start backend
cd apps/backend && uvicorn main:app --reload --port 8000

# Start frontend
cd apps/frontend && npm run dev -- --port 3000
```

---

## 🎯 PRIORITY SUMMARY

**🔴 DO FIRST (This Week)**:
1. Test Frontend Login (Task 1)
2. Test Dashboard (Task 2)
3. Test Parks CRUD (Task 3)
4. Test Approvals (Task 4)
5. Test Flora Listing (Task 5)
6. Test Fauna Listing (Task 6)
7. Test Activities (Task 7)

**🟡 DO NEXT (Next Week)**:
8. Add Approve/Reject (Task 8)
9. Flora CRUD (Task 9)
10. Fauna CRUD (Task 10)
11. Error Handling (Task 12)
12. Seed Demo Data (Task 20)

**🟢 DO LATER (When Ready)**:
13. UI/UX Polish (Tasks 13-16)
14. Security Audit (Tasks 23-24)
15. Deployment (Tasks 27-29)
16. Monitoring (Task 30)

---

**Created**: October 25, 2025  
**Status**: Ready to Start  
**Estimated Total Time**: 30-40 hours  
**Target Completion**: 4 weeks

---

🎯 **START WITH TASK 1: Test Frontend Login!**

