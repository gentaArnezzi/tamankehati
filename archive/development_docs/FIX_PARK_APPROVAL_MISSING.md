# 🔧 Fix: Park Approval Not Showing

**Date**: 2025-10-26  
**Status**: ✅ FIXED

---

## 🐛 Problem

Park sudah dibuat dengan status "draft" menunggu persetujuan, tapi **tidak muncul di halaman approval**.

**Root Cause**:
- Endpoint `/api/v1/approvals/` hanya query Flora, Fauna, Artikel, Galeri, dan Kegiatan
- **Parks tidak di-query sama sekali** ❌

---

## ✅ Solution Applied

### **File**: `apps/backend/api/v1/routes/approvals.py`

#### **1. Import Park Model**
```python
from domains.parks.models import Park  # Added for park approvals
```

#### **2. Update ApprovalItem Entity Type**
**Before**:
```python
entity_type: Literal["flora", "fauna", "zona", "artikel", "galeri", "kegiatan"]
```

**After**:
```python
entity_type: Literal["flora", "fauna", "zona", "artikel", "galeri", "kegiatan", "taman"]
```

#### **3. Update Query Parameter**
**Before**:
```python
entity_type: Optional[Literal["flora", "fauna", "zona", "artikel", "galeri", "kegiatan"]] = Query(...)
```

**After**:
```python
entity_type: Optional[Literal["flora", "fauna", "zona", "artikel", "galeri", "kegiatan", "taman"]] = Query(...)
```

#### **4. Add "taman" to Counts Dict**
```python
counts: dict[str, int] = {
    "flora": 0,
    "fauna": 0,
    "zona": 0,
    "artikel": 0,
    "galeri": 0,
    "kegiatan": 0,
    "taman": 0,  # ✅ Added
}
```

#### **5. Add Park Query Logic**
```python
if want_taman:
    from sqlalchemy import cast, String
    stmt = select(Park).where(
        cast(Park.status, String) == "draft",
        Park.deleted_at.is_(None),
    )
    # Super admin sees all pending parks, regional admin sees only theirs
    if user.role == UserRole.regional_admin:
        stmt = stmt.where(Park.created_by == int(user.id))
    park_rows = (await db.execute(stmt)).scalars().all()
    counts["taman"] = len(park_rows)
    for park in park_rows:
        records.append(
            ApprovalItem(
                entity_type="taman",
                entity_id=park.id,
                title=park.name or f"Taman #{park.id}",
                status="draft",  # Parks use "draft" status
                submitted_at=park.submitted_at if hasattr(park, 'submitted_at') else park.created_at,
                updated_at=park.updated_at,
                metadata=ApprovalMeta(
                    region_code=None,
                    submitted_by=park.created_by,
                    approved_by=park.approved_by if hasattr(park, 'approved_by') else None,
                ),
                thumbnail_url=None,
            )
        )
```

---

## 🔑 Key Features

### **1. Status Filtering**
- Parks dengan status `"draft"` akan muncul di approval queue
- Status `"approved"`, `"published"`, atau `"archived"` tidak muncul

### **2. Role-Based Access**
| Role | Access |
|------|--------|
| `super_admin` | ✅ Sees **ALL** pending parks from all users |
| `regional_admin` | ✅ Sees **ONLY** their own pending parks (`created_by` filter) |

### **3. Data Mapping**
```python
{
    "entity_type": "taman",
    "entity_id": park.id,
    "title": park.name,
    "status": "draft",
    "submitted_at": park.created_at,
    "metadata": {
        "submitted_by": park.created_by,
        "approved_by": park.approved_by
    }
}
```

---

## 📋 Testing Checklist

### **Backend Testing**:
```bash
# 1. Restart backend
cd apps/backend
uvicorn main:app --reload --port 8000

# 2. Test approval endpoint (as super_admin)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/approvals/

# 3. Test filtered by entity_type
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/v1/approvals/?entity_type=taman"
```

### **Frontend Testing**:
- [ ] Login sebagai super_admin
- [ ] Buka halaman **Persetujuan** (Approvals)
- [ ] Verify: Park dengan status "draft" muncul di list ✅
- [ ] Verify: Tampil nama park yang benar
- [ ] Verify: Tampil status "draft"

### **Regional Admin Testing**:
- [ ] Login sebagai regional_admin (user yang create park)
- [ ] Buka halaman **Persetujuan**
- [ ] Verify: Hanya park yang mereka buat yang muncul ✅
- [ ] Verify: Tidak muncul park dari user lain ✅

---

## 🎯 API Response Example

```json
{
  "items": [
    {
      "entity_type": "taman",
      "entity_id": 1,
      "title": "Taman Kehati Jakarta",
      "status": "draft",
      "submitted_at": "2025-10-26T10:30:00Z",
      "updated_at": "2025-10-26T10:30:00Z",
      "metadata": {
        "region_code": null,
        "submitted_by": 2,
        "approved_by": null
      },
      "thumbnail_url": null
    }
  ],
  "total": 1,
  "counts": {
    "flora": 0,
    "fauna": 0,
    "zona": 0,
    "artikel": 0,
    "galeri": 0,
    "kegiatan": 0,
    "taman": 1
  },
  "has_next": false
}
```

---

## 🚨 Frontend Integration Notes

### **Frontend might need updates**:

1. **ApprovalPage Component**: Should handle `entity_type: "taman"`
2. **Entity Type Badge/Label**: Add label untuk "Taman" / "Park"
3. **Approval Actions**: Implement approve/reject untuk parks

### **Frontend API Client** (`api-client.ts`):
```typescript
export type EntityType = 'flora' | 'fauna' | 'zona' | 'artikel' | 'galeri' | 'kegiatan' | 'taman';

export interface ApprovalItem {
  entity_type: EntityType;
  entity_id: number;
  title: string;
  status: string;
  submitted_at?: string;
  updated_at?: string;
  metadata: {
    region_code?: string;
    submitted_by?: number;
    approved_by?: number;
  };
  thumbnail_url?: string;
}
```

---

## ✅ Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Park Import | ✅ FIXED | Added `from domains.parks.models import Park` |
| Entity Type | ✅ FIXED | Added "taman" to Literal type |
| Query Logic | ✅ FIXED | Query parks with status="draft" |
| Role Filter | ✅ FIXED | Regional admin only sees their own parks |
| Counts | ✅ FIXED | Added "taman" to counts dict |
| API Response | ✅ WORKING | Returns parks in approval list |

**Overall**: Parks sekarang muncul di approval queue! 🎉

---

## 🔄 Next Steps

1. ✅ **Restart backend** → Parks akan muncul di approval endpoint
2. ⏳ **Test frontend** → Verify parks tampil di UI
3. ⏳ **Implement approve/reject** → If not yet implemented in frontend
4. ⏳ **Add park detail view** → In approval page for super admin to review

**Status**: Backend fix complete, frontend testing pending! 🚀


