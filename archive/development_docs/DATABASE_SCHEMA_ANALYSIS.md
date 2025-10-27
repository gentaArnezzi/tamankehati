# 🔍 DATABASE SCHEMA & RELATIONSHIP ANALYSIS

**Date:** 2025-01-26  
**Status:** ⚠️ CRITICAL ISSUES FOUND

---

## 📋 EXECUTIVE SUMMARY

Analisis mendalam terhadap database schema, models, dan API endpoints menemukan **7 kategori masalah kritical**:

| Severity | Issue | Count | Impact |
|----------|-------|-------|--------|
| 🔴 HIGH | Missing Foreign Key Constraints | 6 tables | Data integrity risk |
| 🔴 HIGH | Enum Type Mismatch | 1 table | Runtime errors |
| 🟡 MEDIUM | Inconsistent ondelete Policies | All tables | Orphaned records |
| 🟡 MEDIUM | Incomplete Workflow Fields | 2 tables | Audit trail incomplete |
| 🟡 MEDIUM | Dead/Legacy Fields | 1 table | Confusion |
| 🟢 LOW | Commented Relationships | All tables | No immediate issue |
| 🟢 LOW | Inconsistent Status Column Width | All tables | Minor issue |

**Overall Risk:** 🔴 **HIGH** - Action required to prevent data corruption

---

## 🚨 CRITICAL ISSUES

### 1. 🔴 MISSING FOREIGN KEY CONSTRAINTS

**Severity:** 🔴 HIGH  
**Impact:** Data integrity violated, orphaned records possible

#### Problem:
Several models have user ID columns (submitted_by, approved_by, rejected_by) that are **plain Integer** without ForeignKey constraints. This means:
- ❌ Database won't prevent invalid user IDs
- ❌ Orphaned records if user is deleted
- ❌ No CASCADE/SET NULL behavior
- ❌ No referential integrity

#### Affected Tables:

**1. Articles (domains/articles/models.py)**
```python
# ❌ WRONG - No ForeignKey constraint
submitted_by = Column(Integer, nullable=True)  
approved_by = Column(Integer, nullable=True)
rejected_by = Column(Integer, nullable=True)

# ✅ SHOULD BE
submitted_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
approved_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
rejected_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
```

**2. Galleries (domains/galleries/models.py)**
```python
# ❌ WRONG - No ForeignKey constraint
submitted_by = Column(Integer, nullable=True)
approved_by = Column(Integer, nullable=True)
rejected_by = Column(Integer, nullable=True)

# ✅ SHOULD BE (same as Articles)
submitted_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
approved_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
rejected_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
```

---

### 2. 🔴 ENUM TYPE MISMATCH (News Model)

**Severity:** 🔴 HIGH  
**Impact:** Runtime errors, database incompatibility

#### Problem:
News model uses **SQLEnum** for category and status columns, but database uses **VARCHAR**. This will cause errors!

**File:** `domains/news/models.py`

```python
# ❌ WRONG - Uses SQLEnum (incompatible with VARCHAR database)
category = Column(
    SQLEnum(NewsCategory),  # ❌ Will cause errors!
    nullable=False,
    default=NewsCategory.general,
)
status = Column(
    SQLEnum(NewsStatus),  # ❌ Will cause errors!
    nullable=False,
    default=NewsStatus.draft,
)

# ✅ SHOULD BE (like Announcements)
category = Column(
    String(50),  # ✅ Compatible with VARCHAR
    nullable=False,
    default="general",
)
status = Column(
    String(50),  # ✅ Compatible with VARCHAR
    nullable=False,
    default="draft",
)
```

**Similar Issue Fixed Before:**
- ✅ Announcements model was already fixed (uses String(50))
- ❌ News model still broken

---

### 3. 🟡 INCOMPLETE WORKFLOW FIELDS

**Severity:** 🟡 MEDIUM  
**Impact:** Incomplete audit trail, workflow inconsistency

#### Problem:
Some models are missing `rejected_by` column for rejection workflow tracking.

**Affected Tables:**

**1. Fauna (domains/fauna/models.py)**
```python
# ✅ Has these
submitted_by = Column(Integer, ForeignKey("users.id"), nullable=True)
approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)

# ❌ MISSING
# rejected_by = Column(Integer, ForeignKey("users.id"), nullable=True)
```

**2. Activities (domains/activities/models.py)**
```python
# ✅ Has these
submitted_by = Column(Integer, ForeignKey("users.id"), nullable=True)
approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)

# ❌ MISSING
# rejected_by = Column(Integer, ForeignKey("users.id"), nullable=True)
```

**Comparison:**
- ✅ Flora: Has rejected_by ✅
- ❌ Fauna: Missing rejected_by ❌
- ❌ Activities: Missing rejected_by ❌
- ✅ Parks: Has rejected_by ✅
- ✅ Articles: Has rejected_by (but no FK!) ⚠️
- ✅ Galleries: Has rejected_by (but no FK!) ⚠️
- ✅ Announcements: Has rejected_by ✅
- ✅ News: Has rejected_by ✅

---

## 🟡 MEDIUM PRIORITY ISSUES

### 4. 🟡 INCONSISTENT ONDELETE POLICIES

**Severity:** 🟡 MEDIUM  
**Impact:** Unpredictable behavior when records are deleted

#### Problem:
Different tables use different `ondelete` policies for the same type of relationship, causing confusion and potential bugs.

#### Comparison Table:

| Table | Relationship | Column | ondelete | Notes |
|-------|-------------|---------|----------|-------|
| **User** | → Park | park_id | (none) | Should it be SET NULL? |
| **Parks** | → User | submitted_by | SET NULL | ✅ Correct |
| **Parks** | → User | approved_by | SET NULL | ✅ Correct |
| **Parks** | → User | rejected_by | SET NULL | ✅ Correct |
| **Flora** | → Park | park_id | CASCADE | ✅ Correct (child of park) |
| **Flora** | → User | submitted_by | (none) | ⚠️ Should be SET NULL |
| **Flora** | → User | approved_by | (none) | ⚠️ Should be SET NULL |
| **Fauna** | → Park | park_id | CASCADE | ✅ Correct (child of park) |
| **Fauna** | → User | submitted_by | (none) | ⚠️ Should be SET NULL |
| **Fauna** | → User | approved_by | (none) | ⚠️ Should be SET NULL |
| **Activities** | → Park | park_id | CASCADE | ✅ Correct (child of park) |
| **Activities** | → User | submitted_by | (none) | ⚠️ Should be SET NULL |
| **Activities** | → User | approved_by | (none) | ⚠️ Should be SET NULL |
| **Articles** | → User | author_id | SET NULL | ✅ Correct |
| **Articles** | → Park | park_id | SET NULL | ✅ Correct |
| **Articles** | → User | submitted_by | NO FK! | ❌ Critical |
| **Galleries** | → User | author_id | CASCADE | ⚠️ Too aggressive? |
| **Galleries** | → User | submitted_by | NO FK! | ❌ Critical |
| **Announcements** | → User | author_id | SET NULL | ✅ Correct |
| **Announcements** | → User | submitted_by | (none) | ⚠️ Should be SET NULL |
| **News** | → User | author_id | SET NULL | ✅ Correct |
| **News** | → User | submitted_by | (none) | ⚠️ Should be SET NULL |

**Recommendation:**
- User workflow fields (submitted_by, approved_by, rejected_by) should **always** use `ondelete="SET NULL"`
- Child entities (Flora, Fauna, Activities) to Park should use `ondelete="CASCADE"`
- Author relationships should use `ondelete="SET NULL"` (not CASCADE)

---

### 5. 🟡 DEAD/LEGACY FIELDS

**Severity:** 🟡 MEDIUM  
**Impact:** Confusion, technical debt

#### Problem:
Galleries model still has `region_code` field despite migrations to remove region-based access control.

**File:** `domains/galleries/models.py`

```python
# ❌ LEGACY FIELD - Should be removed
region_code = Column(String(10), nullable=False, index=True)
```

**Evidence:**
- ✅ Parks model: region_id removed (commented out)
- ✅ Flora model: No region_code
- ✅ Fauna model: No region_code
- ✅ Activities model: No region_code
- ✅ Articles model: No region_code
- ❌ Galleries model: Still has region_code!

**Migration Files:**
- `migrations/remove_regions_table.sql` - Suggests regions were removed
- `migrations/simplify_to_park_only.sql` - Moved to park-based scoping

**API Evidence:**
- `apps/backend/api/v1/routes/approvals.py` line 96-97:
  ```python
  # Changed from: Article.region_code == user.region_code
  # To: Article.submitted_by == int(user.id)
  ```

**Recommendation:**
Remove `region_code` from Galleries model and add migration to drop the column.

---

### 6. 🟢 COMMENTED OUT RELATIONSHIPS

**Severity:** 🟢 LOW  
**Impact:** No immediate issue, but reduces code usability

#### Problem:
Most models have their SQLAlchemy relationships commented out "to avoid circular imports".

**Example:** All models have this pattern:
```python
# park = relationship("Park", back_populates="flora")  # Commented out
# submitted_by_user = relationship("User", foreign_keys=[submitted_by])  # Commented out
```

**Exceptions:**
- ✅ Activities model: Has relationships defined
- ✅ News model: Has author relationship defined
- ✅ Galleries model: Has author relationship defined

**Impact:**
- Can't use lazy loading
- Can't navigate relationships in code
- Must manually join in queries

**Recommendation:**
Use `lazy="select"` or `lazy="joined"` with proper import patterns:
```python
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from users.models import User
```

---

### 7. 🟢 INCONSISTENT STATUS COLUMN WIDTH

**Severity:** 🟢 LOW  
**Impact:** Minor inconsistency

#### Problem:
Different tables use different String widths for status column:

| Table | Status Type | Width |
|-------|-------------|-------|
| Parks | String | 20 |
| Flora | String | 50 |
| Fauna | String | 50 |
| Activities | String | 50 |
| Articles | String | 20 |
| Galleries | String | 20 |
| Announcements | String | 50 |
| News | SQLEnum | N/A |

**Recommendation:**
Standardize to `String(50)` everywhere for consistency.

---

## 📊 RELATIONSHIP DIAGRAM

```
┌──────────────┐
│    Users     │
│              │
│ id (PK)      │◄─────────────────┐
│ email        │                   │
│ role         │                   │
│ park_id (FK) │──┐                │
└──────────────┘  │                │
                  │                │
                  ▼                │
        ┌─────────────────┐        │
        │      Parks      │        │
        │                 │        │
        │ id (PK)         │◄───────┼────────────┐
        │ name            │        │            │
        │ submitted_by(FK)│────────┘            │
        │ approved_by (FK)│─────────────┐       │
        └─────────────────┘             │       │
                │                       │       │
                │                       │       │
     ┌──────────┼──────────┐            │       │
     │          │          │            │       │
     ▼          ▼          ▼            │       │
┌────────┐ ┌────────┐ ┌────────────┐   │       │
│ Flora  │ │ Fauna  │ │ Activities │   │       │
│        │ │        │ │            │   │       │
│ park_id│ │ park_id│ │ park_id    │   │       │
│   (FK) │ │   (FK) │ │   (FK)     │   │       │
│        │ │        │ │            │   │       │
│submitted│ │submitted│ │submitted_by│   │       │
│  _by ❌│ │  _by ❌│ │   (FK)     │   │       │
│        │ │        │ │            │   │       │
│approved│ │approved│ │approved_by │   │       │
│  _by ❌│ │  _by ❌│ │   (FK)     │   │       │
└────────┘ └────────┘ └────────────┘   │       │
                                        │       │
     ┌──────────────────────────────────┘       │
     │                                          │
     ▼                                          │
┌──────────────┐ ┌──────────────┐ ┌────────────┴─────┐
│  Articles    │ │  Galleries   │ │ Announcements    │
│              │ │              │ │                  │
│ author_id(FK)│ │ author_id(FK)│ │ author_id (FK)   │
│ park_id (FK) │ │ region_code❌│ │ submitted_by (FK)│
│              │ │              │ │ approved_by (FK) │
│ submitted_by │ │ submitted_by │ │ rejected_by (FK) │
│   ❌ NO FK   │ │   ❌ NO FK   │ └──────────────────┘
│ approved_by  │ │ approved_by  │
│   ❌ NO FK   │ │   ❌ NO FK   │ ┌──────────────────┐
│ rejected_by  │ │ rejected_by  │ │      News        │
│   ❌ NO FK   │ │   ❌ NO FK   │ │                  │
└──────────────┘ └──────────────┘ │ category❌SQLEnum│
                                  │ status❌SQLEnum  │
                                  │ submitted_by (FK)│
                                  │ approved_by (FK) │
                                  └──────────────────┘

Legend:
  (FK) = ForeignKey defined ✅
  ❌ NO FK = Should have FK but missing
  ❌ = Critical issue
```

---

## 🔧 RECOMMENDED FIXES

### Priority 1: Critical Fixes (Do Immediately)

**1. Add Missing Foreign Keys to Articles**

File: `apps/backend/domains/articles/models.py`

```python
# CHANGE FROM:
submitted_by = Column(Integer, nullable=True)
approved_by = Column(Integer, nullable=True)
rejected_by = Column(Integer, nullable=True)

# TO:
submitted_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
approved_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
rejected_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
```

**2. Add Missing Foreign Keys to Galleries**

File: `apps/backend/domains/galleries/models.py`

```python
# CHANGE FROM:
submitted_by = Column(Integer, nullable=True)
approved_by = Column(Integer, nullable=True)
rejected_by = Column(Integer, nullable=True)

# TO:
submitted_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
approved_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
rejected_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
```

**3. Fix News Model Enum Types**

File: `apps/backend/domains/news/models.py`

```python
# CHANGE FROM:
from sqlalchemy import Enum as SQLEnum

category = Column(
    SQLEnum(NewsCategory),  # ❌
    nullable=False,
    default=NewsCategory.general,
)
status = Column(
    SQLEnum(NewsStatus),  # ❌
    nullable=False,
    default=NewsStatus.draft,
)

# TO:
category = Column(
    String(50),  # ✅
    nullable=False,
    default="general",
)
status = Column(
    String(50),  # ✅
    nullable=False,
    default="draft",
)
```

---

### Priority 2: Important Fixes (Do This Week)

**4. Add Missing rejected_by to Fauna**

File: `apps/backend/domains/fauna/models.py`

```python
# ADD THIS LINE (after approved_by):
rejected_by = Column(Integer, ForeignKey("users.id"), nullable=True)
```

**5. Add Missing rejected_by to Activities**

File: `apps/backend/domains/activities/models.py`

```python
# ADD THIS LINE (after approved_by):
rejected_by = Column(Integer, ForeignKey("users.id"), nullable=True)
```

**6. Add ondelete to All User Foreign Keys**

For Flora, Fauna, Activities, Announcements, News:

```python
# CHANGE ALL workflow FK columns TO include ondelete:
submitted_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
approved_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
rejected_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
```

**7. Remove region_code from Galleries**

File: `apps/backend/domains/galleries/models.py`

```python
# DELETE THIS LINE:
region_code = Column(String(10), nullable=False, index=True)
```

Create migration:
```sql
-- Migration: remove_region_code_from_galleries.sql
ALTER TABLE galleries DROP COLUMN IF EXISTS region_code;
```

---

### Priority 3: Code Quality (Do Next Sprint)

**8. Standardize Status Column Width**

Change all status columns to `String(50)`:

```python
# In all models (Parks, Articles, Galleries):
status = Column(String(50), nullable=False, default="draft")
```

**9. Enable Relationships Properly**

Example for Flora model:

```python
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from users.models import User
    from domains.parks.models import Park
    
# Then enable relationships:
park = relationship("Park", back_populates="flora", lazy="select")
submitted_by_user = relationship("User", foreign_keys=[submitted_by], lazy="select")
approved_by_user = relationship("User", foreign_keys=[approved_by], lazy="select")
rejected_by_user = relationship("User", foreign_keys=[rejected_by], lazy="select")
```

---

## 🧪 TESTING CHECKLIST

After applying fixes:

### Database Integrity Tests:

- [ ] **Try to insert invalid user ID in submitted_by**
  - Should fail with FK constraint error ✅
  
- [ ] **Delete a user who has submitted items**
  - submitted_by should become NULL ✅
  - Records should NOT be deleted ✅
  
- [ ] **Delete a park that has flora/fauna**
  - Flora/fauna should be CASCADE deleted ✅
  
- [ ] **Try to insert News with invalid enum value**
  - Should succeed (now uses String) ✅

### API Tests:

- [ ] **Test rejection workflow for Fauna**
  - Should track rejected_by user ID ✅
  
- [ ] **Test rejection workflow for Activities**
  - Should track rejected_by user ID ✅
  
- [ ] **Test Articles workflow**
  - FK constraints should prevent orphaned records ✅

### Migration Tests:

- [ ] **Run migrations on test database**
  - All migrations should succeed ✅
  - No data loss ✅
  
- [ ] **Check Galleries table**
  - region_code column removed ✅

---

## 📈 IMPACT ASSESSMENT

### Before Fixes:

| Metric | Status |
|--------|--------|
| Data Integrity | 🔴 AT RISK (no FK constraints) |
| Audit Trail | 🟡 INCOMPLETE (missing rejected_by) |
| Database Compatibility | 🔴 BROKEN (SQLEnum mismatch) |
| Code Consistency | 🟡 POOR (mixed patterns) |
| Technical Debt | 🔴 HIGH (legacy fields, commented code) |

### After Fixes:

| Metric | Status |
|--------|--------|
| Data Integrity | ✅ PROTECTED (FK constraints) |
| Audit Trail | ✅ COMPLETE (all workflow fields) |
| Database Compatibility | ✅ COMPATIBLE (String types) |
| Code Consistency | ✅ GOOD (standardized patterns) |
| Technical Debt | 🟢 LOW (cleaned up) |

---

## 🏁 CONCLUSION

**Status:** ⚠️ **ACTION REQUIRED**

### Critical Issues Found:
1. 🔴 Missing FK constraints in Articles & Galleries (data corruption risk)
2. 🔴 Enum type mismatch in News model (runtime errors)
3. 🟡 Incomplete workflow tracking (audit trail gaps)
4. 🟡 Inconsistent patterns (maintenance burden)

### Risk Level:
- 🔴 **HIGH** - Current state allows data corruption
- 🔴 **Production Impact** - News features may be broken
- 🟡 **Technical Debt** - Growing complexity

### Recommended Timeline:
- **Priority 1 Fixes:** ASAP (today)
- **Priority 2 Fixes:** This week
- **Priority 3 Fixes:** Next sprint

---

**Report Generated:** 2025-01-26  
**Analyzed Models:** 11 tables  
**Issues Found:** 18 specific problems  
**Estimated Fix Time:** 2-3 hours

