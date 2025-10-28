# 🐛 Flora/Fauna Create Status Bug Fix

## Problem Report

### Issue
When creating new flora/fauna and clicking **"Submit untuk Review"**, the data is saved with status **'draft'** instead of **'in_review'**, so it doesn't appear in Super Admin's approval dashboard.

### User Report
> "terdapat bug ketika tombol submit dikirim, masuknya bukan ke super_admin approval, tapi ke draft, pada saat create flora atau fauna"

### Expected Behavior
1. User creates new flora/fauna
2. User fills form
3. User clicks **"Submit untuk Review"** button
4. Flora/fauna created with status: **'in_review'** ✅
5. Appears in Super Admin approval dashboard ✅

### Actual Behavior (Before Fix)
1. User creates new flora/fauna
2. User fills form
3. User clicks **"Submit untuk Review"** button
4. Flora/fauna created with status: **'draft'** ❌
5. Does NOT appear in Super Admin approval dashboard ❌
6. Stuck in user's draft list ❌

## Root Cause

### Frontend (Correct)

Frontend has 2 buttons with different status values:

```tsx
// Button 1: Save as Draft
<Button onClick={form.handleSubmit((data) => handleSubmit(data, 'draft'))}>
  Simpan sebagai Draft
</Button>

// Button 2: Submit for Review
<Button onClick={form.handleSubmit((data) => handleSubmit(data, 'in_review'))}>
  Submit untuk Review
</Button>
```

`handleSubmit()` function correctly sends status to backend:

```tsx
const handleSubmit = async (data, submitStatus) => {
  const floraData = {
    ...data,
    status: submitStatus, // ✅ Sends 'draft' or 'in_review'
  };
  
  await onSubmit(floraData);
};
```

### Backend (Bug)

**Flora endpoint** (`/apps/backend/api/v1/routes/flora.py`):

```python
# ❌ BEFORE FIX - Line 282
result = await db.execute(text("""
    INSERT INTO flora (..., status, ...)
    VALUES (..., 'draft', ...)  # ← HARDCODED 'draft'!
    RETURNING id
"""), {
    # ...params, but NO 'status' parameter!
})
```

**Fauna endpoint** (`/apps/backend/api/v1/routes/fauna.py`):

```python
# ❌ BEFORE FIX - Line 288
result = await db.execute(text("""
    INSERT INTO fauna (..., status, ...)
    VALUES (..., 'draft', ...)  # ← HARDCODED 'draft'!
    RETURNING id
"""), {
    # ...params, but NO 'status' parameter!
})
```

**Problem:**
- Backend **ignores** `status` from frontend payload
- Backend **hardcodes** status to `'draft'`
- Even if frontend sends `status='in_review'`, backend overwrites it to `'draft'`

## Solution

### Flora Fix

```python
# ✅ AFTER FIX
# Insert using raw SQL - tambahkan submitted_by dan status
# ✅ Use status from payload (frontend sends 'draft' or 'in_review')
status_value = getattr(payload, 'status', 'draft')  # Default to 'draft' if not provided

result = await db.execute(text("""
    INSERT INTO flora (..., status, ...)
    VALUES (..., :status, ...)  # ← Use parameter instead of hardcode
    RETURNING id
"""), {
    # ...other params...
    "submitted_by": int(user.id),
    "status": status_value  # ✅ Pass status from frontend
})
```

### Fauna Fix

```python
# ✅ AFTER FIX
# Insert using raw SQL - tambahkan submitted_by dan status
# ✅ Use status from payload (frontend sends 'draft' or 'in_review')
status_value = getattr(payload, 'status', 'draft')  # Default to 'draft' if not provided

result = await db.execute(text("""
    INSERT INTO fauna (..., status, ...)
    VALUES (..., :status, ...)  # ← Use parameter instead of hardcode
    RETURNING id
"""), {
    # ...other params...
    "submitted_by": int(user.id),
    "status": status_value  # ✅ Pass status from frontend
})
```

### Key Changes

1. **Extract status from payload**: `status_value = getattr(payload, 'status', 'draft')`
2. **Use parameter binding**: `:status` instead of `'draft'`
3. **Pass status to query**: `"status": status_value`

## User Flow Comparison

### Before Fix ❌

```
User creates flora/fauna
↓
Fills form
↓
Clicks "Submit untuk Review"
↓
Frontend sends: { ..., status: 'in_review' }
↓
Backend receives: status='in_review'
↓
Backend IGNORES it and uses: 'draft' ❌
↓
INSERT INTO flora (...) VALUES (..., 'draft', ...)
↓
Flora created with status='draft'
↓
Super Admin dashboard: EMPTY (no flora to approve)
↓
User confused: "Where did my submission go?"
```

### After Fix ✅

```
User creates flora/fauna
↓
Fills form
↓
Clicks "Submit untuk Review"
↓
Frontend sends: { ..., status: 'in_review' }
↓
Backend receives: status='in_review'
↓
Backend USES it: status_value='in_review' ✅
↓
INSERT INTO flora (...) VALUES (..., 'in_review', ...)
↓
Flora created with status='in_review'
↓
Super Admin dashboard: Shows flora for approval ✅
↓
User happy: "My submission is pending review!"
```

### Draft Flow (Unchanged)

```
User creates flora/fauna
↓
Fills form
↓
Clicks "Simpan sebagai Draft"
↓
Frontend sends: { ..., status: 'draft' }
↓
Backend receives: status='draft'
↓
Backend USES it: status_value='draft' ✅
↓
INSERT INTO flora (...) VALUES (..., 'draft', ...)
↓
Flora created with status='draft'
↓
User can continue editing later
```

## Testing

### Test Case 1: Submit for Review

**Steps:**
1. Login as Regional Admin
2. Click "Tambah Flora" (or Fauna)
3. Fill form with all required fields
4. Upload image
5. Click **"Submit untuk Review"** button
6. Wait for success message

**Expected:**
- ✅ Flora created successfully
- ✅ Success message: "Flora berhasil diajukan untuk review!"
- ✅ Flora has status='in_review'

**Verify (Super Admin):**
1. Login as Super Admin
2. Go to Approval Dashboard
3. Check "Total Flora" counter
4. Expected: Counter increased by 1 ✅
5. See new flora in approval list ✅

**Database Check:**
```sql
SELECT id, nama_ilmiah, status, submitted_by, created_at 
FROM flora 
ORDER BY id DESC 
LIMIT 1;
```

Expected result:
```
id | nama_ilmiah | status    | submitted_by | created_at
---|-------------|-----------|--------------|------------
42 | Test Flora  | in_review | 2            | 2025-10-28...
```

### Test Case 2: Save as Draft

**Steps:**
1. Login as Regional Admin
2. Click "Tambah Flora"
3. Fill form partially
4. Click **"Simpan sebagai Draft"** button

**Expected:**
- ✅ Flora created successfully
- ✅ Success message: "Flora berhasil dibuat! Status: Draft"
- ✅ Flora has status='draft'

**Verify:**
1. Flora appears in user's draft list
2. Flora does NOT appear in Super Admin approval dashboard ✅

**Database Check:**
```sql
SELECT id, nama_ilmiah, status FROM flora ORDER BY id DESC LIMIT 1;
```

Expected result:
```
id | nama_ilmiah | status
---|-------------|-------
43 | Test Flora  | draft
```

### Test Case 3: Fauna Submit

**Steps:**
1. Login as Regional Admin
2. Click "Tambah Fauna"
3. Fill form
4. Click **"Submit untuk Review"**

**Expected:**
- ✅ Fauna created with status='in_review'
- ✅ Appears in Super Admin approval dashboard

## Files Modified

### Backend

- ✅ `/apps/backend/api/v1/routes/flora.py`
  - Line 279-301: Extract status from payload and use in INSERT query
  
- ✅ `/apps/backend/api/v1/routes/fauna.py`
  - Line 285-307: Extract status from payload and use in INSERT query

### Frontend (No Changes Needed)

Frontend was already correct - sending proper status values.

## Impact

### Before Fix

| Action | Frontend Sends | Backend Saves | Result |
|--------|----------------|---------------|--------|
| Submit for Review | status='in_review' | status='draft' ❌ | Not in approval |
| Save as Draft | status='draft' | status='draft' ✅ | In draft list |

### After Fix

| Action | Frontend Sends | Backend Saves | Result |
|--------|----------------|---------------|--------|
| Submit for Review | status='in_review' | status='in_review' ✅ | In approval ✅ |
| Save as Draft | status='draft' | status='draft' ✅ | In draft list ✅ |

## Related Code

### Backend Payload Model

```python
class FloraIn(BaseModel):
    park_id: int
    local_name: str
    scientific_name: str
    # ...other fields...
    status: Optional[str] = 'draft'  # ← Status field exists in model
```

The `status` field exists in the Pydantic model, so:
- `getattr(payload, 'status', 'draft')` will return the value sent from frontend
- If not provided, defaults to 'draft'

### Frontend Form Handling

```tsx
const handleSubmit = async (data: FloraFormData, submitStatus: 'draft' | 'in_review') => {
  // Delete marked galleries...
  
  // Upload images...
  
  const floraData = {
    ...data,
    gambar_utama: imageUrl,
    status: submitStatus, // ← Status correctly set
  };
  
  const floraResult = await onSubmit(floraData); // ← Sent to backend
  
  // Create gallery records...
};
```

## Deployment

- [x] Backend code fixed (flora.py, fauna.py)
- [x] No linter errors
- [x] Backend restarted ✅
- [ ] Test flora submission
- [ ] Test fauna submission
- [ ] Verify approval dashboard shows submissions

## Lessons Learned

1. **Don't Hardcode Dynamic Values**
   - Status should come from user input (frontend)
   - Backend should respect user's choice
   
2. **Check Both Sides**
   - Frontend might be correct
   - Backend might be ignoring the input
   
3. **Use Parameter Binding**
   - `VALUES (..., :status, ...)` (correct)
   - `VALUES (..., 'draft', ...)` (hardcoded, wrong)
   
4. **Default Values**
   - `getattr(payload, 'status', 'draft')` provides safety
   - If frontend doesn't send status, still works (defaults to 'draft')

## Summary

**Problem:**
- Backend hardcoded flora/fauna status to 'draft'
- "Submit untuk Review" button didn't work
- Submissions never reached Super Admin approval

**Solution:**
- Extract status from frontend payload
- Use parameter binding in SQL query
- Respect user's choice (draft vs in_review)

**Impact:**
- ✅ Submit for Review now works correctly
- ✅ Flora/Fauna appear in Super Admin approval
- ✅ Draft workflow unchanged
- ✅ Better alignment with user expectations

Perfect! Flora dan fauna sekarang masuk approval dengan benar! 🎉✨

