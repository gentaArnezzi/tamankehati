# 🎨 Form UI/UX Implementation Guide

Panduan lengkap penggunaan komponen form yang telah diimplementasikan untuk meningkatkan user experience dalam input data.

## 📋 Table of Contents
1. [Overview](#overview)
2. [Components](#components)
3. [Usage Examples](#usage-examples)
4. [Best Practices](#best-practices)

---

## Overview

Sistem form ini menyediakan 3 pattern utama:

### 1. **FormSheet** - Side Panel Form
- ✅ **Use Case**: Form medium-complex (5-10 fields)
- ✅ **Width**: 400-800px (configurable)
- ✅ **Features**: Scrollable body, sticky header/footer, smooth animation

### 2. **Full Page Form**
- ✅ **Use Case**: Form complex (10+ fields)  
- ✅ **Example**: Medium-style article editor
- ✅ **Features**: Maximum space, no distractions, multi-step support

### 3. **ActionDialog** - Quick Action Modal
- ✅ **Use Case**: Approve/Reject/Delete actions
- ✅ **Features**: Focused interaction, optional reason input
- ✅ **Size**: Compact (max-w-md)

---

## Components

### 1. FormSheet

**File**: `apps/frontend/src/components/ui/form-sheet.tsx`

Side panel component untuk form input dengan scrollable body dan sticky footer.

#### Props

```typescript
interface FormSheetProps {
  open: boolean;                    // Control visibility
  onOpenChange: (open: boolean) => void;
  title: string;                    // Sheet title
  description?: string;             // Optional subtitle
  children: React.ReactNode;        // Form content
  onSubmit?: () => void;            // Submit handler
  onCancel?: () => void;            // Cancel handler (default: close sheet)
  submitLabel?: string;             // Default: "Simpan"
  cancelLabel?: string;             // Default: "Batal"
  isSubmitting?: boolean;           // Show loading state
  side?: 'right' | 'left';         // Default: 'right'
  width?: 'sm' | 'md' | 'lg' | 'xl'; // Default: 'lg'
  showFooter?: boolean;             // Default: true
}
```

#### Width Options
- `sm`: max-w-sm (~384px)
- `md`: max-w-md (~448px)
- `lg`: max-w-lg (~512px)
- `xl`: max-w-xl (~576px)

#### FormSection Component

Organize form fields into logical sections:

```typescript
interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}
```

---

### 2. ActionDialog

**File**: `apps/frontend/src/components/ui/action-dialog.tsx`

Modal dialog untuk quick actions dengan pre-configured types.

#### Props

```typescript
interface ActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'approve' | 'reject' | 'delete' | 'confirm' | 'info';
  title?: string;                   // Override default title
  description?: string;             // Override default description
  onConfirm: (reason?: string) => void | Promise<void>;
  onCancel?: () => void;
  confirmLabel?: string;            // Override default button label
  cancelLabel?: string;             // Default: "Batal"
  isLoading?: boolean;
  requireReason?: boolean;          // Show reason textarea
  reasonLabel?: string;             // Default: "Alasan"
  reasonPlaceholder?: string;
}
```

#### Pre-configured Types

| Type | Icon | Color | Default Title | Confirm Button |
|------|------|-------|---------------|----------------|
| `approve` | CheckCircle | Green | "Setujui Data" | "Ya, Setujui" |
| `reject` | XCircle | Red | "Tolak Data" | "Ya, Tolak" (requires reason) |
| `delete` | AlertCircle | Red | "Hapus Data" | "Ya, Hapus" |
| `confirm` | Info | Blue | "Konfirmasi" | "Ya, Lanjutkan" |
| `info` | Info | Blue | "Informasi" | "OK" (no cancel) |

#### ApprovalDialog

Simplified component for approve/reject workflow:

```typescript
<ApprovalDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  onApprove={handleApprove}
  onReject={handleReject}
  isLoading={isSubmitting}
  itemName="data flora"
/>
```

---

## Usage Examples

### Example 1: Flora Form with FormSheet

**File**: `apps/frontend/src/components/flora/FloraFormSheet.tsx`

```tsx
import { FloraFormSheet } from '@/components/flora/FloraFormSheet';

function FloraPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFlora, setSelectedFlora] = useState<Flora | null>(null);

  const handleSuccess = () => {
    // Refresh data
    loadFloraData();
  };

  return (
    <>
      <Button onClick={() => {
        setSelectedFlora(null);
        setIsOpen(true);
      }}>
        Tambah Flora
      </Button>

      <FloraFormSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        flora={selectedFlora}
        onSuccess={handleSuccess}
      />
    </>
  );
}
```

### Example 2: Custom Form with FormSheet

```tsx
import { FormSheet, FormSection } from '@/components/ui/form-sheet';

function CustomForm() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = async () => {
    // API call
    await api.create(formData);
    setOpen(false);
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      title="Add User"
      description="Create a new user account"
      onSubmit={handleSubmit}
      width="md"
    >
      <FormSection title="Basic Information">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              name: e.target.value
            }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              email: e.target.value
            }))}
          />
        </div>
      </FormSection>
    </FormSheet>
  );
}
```

### Example 3: Action Dialogs

```tsx
import { ActionDialog, ApprovalDialog } from '@/components/ui/action-dialog';

function ApprovalPage() {
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Approval Dialog
  const handleApprove = async () => {
    await floraApi.approve(floraId);
    toast.success('Data disetujui');
    setApprovalOpen(false);
  };

  const handleReject = async (reason: string) => {
    await floraApi.reject(floraId, reason);
    toast.success('Data ditolak');
    setApprovalOpen(false);
  };

  // Delete Dialog
  const handleDelete = async () => {
    await floraApi.delete(floraId);
    toast.success('Data dihapus');
    setDeleteOpen(false);
  };

  return (
    <>
      {/* Simple Approval Flow */}
      <ApprovalDialog
        open={approvalOpen}
        onOpenChange={setApprovalOpen}
        onApprove={handleApprove}
        onReject={handleReject}
        itemName="data flora"
      />

      {/* Delete Confirmation */}
      <ActionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        type="delete"
        description="Data flora ini akan dihapus permanen. Lanjutkan?"
        onConfirm={handleDelete}
      />
    </>
  );
}
```

### Example 4: Custom Action Dialog

```tsx
<ActionDialog
  open={open}
  onOpenChange={setOpen}
  type="reject"
  title="Tolak Submission"
  description="Berikan alasan penolakan yang jelas"
  requireReason={true}
  reasonLabel="Alasan Penolakan"
  reasonPlaceholder="Jelaskan mengapa data ini ditolak..."
  confirmLabel="Tolak & Kirim Notifikasi"
  onConfirm={async (reason) => {
    await api.reject(id, reason);
    await api.sendNotification(userId, reason);
  }}
/>
```

---

## Best Practices

### 1. FormSheet Best Practices

#### ✅ DO:
- **Use for medium complexity forms** (5-10 fields)
- **Group related fields** using `FormSection`
- **Show validation errors** inline below each field
- **Auto-save drafts** for important forms
- **Set appropriate width** based on content
- **Use sticky footer** for actions

#### ❌ DON'T:
- Don't use for very simple forms (use inline editing)
- Don't use for very complex forms (use full page)
- Don't hide required field indicators
- Don't forget loading states
- Don't make it too narrow (< 400px)

#### Example Structure:

```tsx
<FormSheet title="..." width="lg">
  {/* Section 1: Basic Info */}
  <FormSection title="Basic Information">
    <Field1 />
    <Field2 />
  </FormSection>

  {/* Section 2: Details */}
  <FormSection title="Detailed Information">
    <Field3 />
    <Field4 />
  </FormSection>

  {/* Section 3: Additional */}
  <FormSection title="Additional">
    <Field5 />
  </FormSection>
</FormSheet>
```

---

### 2. ActionDialog Best Practices

#### ✅ DO:
- **Use descriptive titles** - clearly state what will happen
- **Require reasons** for destructive actions (reject, delete)
- **Show loading states** during API calls
- **Use appropriate types** - don't use 'delete' for approve
- **Provide context** - mention what item is being affected

#### ❌ DON'T:
- Don't use for multi-step processes
- Don't hide important warnings
- Don't make confirmations too easy (especially delete)
- Don't forget to handle errors

#### Action Type Selection:

```
approve  → Approve submissions, enable features
reject   → Reject submissions (always require reason)
delete   → Delete data (permanent action)
confirm  → Generic confirmations
info     → Display information (no cancel button)
```

---

### 3. Form Validation

Always validate on both client and server:

```tsx
const handleSubmit = async () => {
  // Client-side validation
  if (!formData.nama_ilmiah.trim()) {
    toast.error('Nama ilmiah wajib diisi');
    return;
  }

  if (formData.email && !isValidEmail(formData.email)) {
    toast.error('Format email tidak valid');
    return;
  }

  try {
    setIsSubmitting(true);
    await api.create(formData);
    toast.success('Data berhasil disimpan');
    onOpenChange(false);
  } catch (error: any) {
    // Server-side validation errors
    toast.error(error.message || 'Gagal menyimpan data');
  } finally {
    setIsSubmitting(false);
  }
};
```

---

### 4. Error Handling

```tsx
try {
  setIsSubmitting(true);
  const result = await api.create(formData);
  
  toast.success('Data berhasil disimpan');
  onOpenChange(false);
  
  if (onSuccess) {
    onSuccess(result);
  }
} catch (error: any) {
  console.error('Error saving data:', error);
  
  // Handle specific errors
  if (error.status === 409) {
    toast.error('Data sudah ada');
  } else if (error.status === 403) {
    toast.error('Anda tidak memiliki akses');
  } else {
    toast.error(error.message || 'Gagal menyimpan data');
  }
} finally {
  setIsSubmitting(false);
}
```

---

### 5. Accessibility

All components follow accessibility best practices:

- **Keyboard navigation**: Tab, Enter, Escape
- **Focus management**: Auto-focus first field
- **Screen readers**: Proper ARIA labels
- **Loading states**: Disabled buttons with feedback

---

## Component Hierarchy

```
FormSheet (Side Panel)
├── SheetHeader (Fixed)
│   ├── Title
│   └── Description
├── ScrollArea (Scrollable Body)
│   └── Form Content
│       ├── FormSection
│       │   ├── Section Title
│       │   └── Fields
│       └── FormSection
│           └── Fields
└── SheetFooter (Fixed)
    ├── Cancel Button
    └── Submit Button
```

```
ActionDialog (Modal)
├── DialogHeader
│   ├── Icon
│   ├── Title
│   └── Description
├── Content (Optional)
│   └── Reason Textarea
└── DialogFooter
    ├── Cancel Button
    └── Confirm Button
```

---

## Migration Guide

### From Old Modal to FormSheet:

**Before:**
```tsx
<Dialog open={open}>
  <DialogContent>
    <DialogHeader>Title</DialogHeader>
    <form>
      {/* Lots of fields - hard to scroll */}
    </form>
  </DialogContent>
</Dialog>
```

**After:**
```tsx
<FormSheet
  open={open}
  onOpenChange={setOpen}
  title="Title"
  width="lg"
>
  <FormSection title="Section 1">
    {/* Fields */}
  </FormSection>
  <FormSection title="Section 2">
    {/* Fields */}
  </FormSection>
</FormSheet>
```

---

## 🎯 Quick Decision Guide

**Choose FormSheet when:**
- ✅ 5-10 form fields
- ✅ Need to see existing data
- ✅ Frequent action (add/edit)
- ✅ Context is important

**Choose Full Page when:**
- ✅ 10+ form fields
- ✅ Rich text editor
- ✅ File uploads
- ✅ Multi-step process

**Choose ActionDialog when:**
- ✅ Single action (approve/reject/delete)
- ✅ Need confirmation
- ✅ Quick interaction
- ✅ Focus is critical

---

## 📚 Related Documentation

- [Medium Editor Guide](./MEDIUM_EDITOR_QUICK_START.md)
- [Component Library](./apps/frontend/src/components/ui/)
- [API Client](./apps/frontend/src/lib/api-client.ts)

---

## 🚀 Next Steps

1. **Test the Flora form**: Navigate to Flora page and click "Tambah Flora"
2. **Test the Fauna form**: Navigate to Fauna page and click "Tambah Fauna"
3. **Test Approval flow**: Go to Approvals page and test approve/reject
4. **Customize as needed**: Adjust widths, colors, labels per your requirements

---

**Need help?** Check the example implementations in:
- `apps/frontend/src/components/flora/FloraFormSheet.tsx`
- `apps/frontend/src/components/fauna/FaunaFormSheet.tsx`

