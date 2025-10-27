# 🚀 Form UI/UX - Quick Start

Panduan cepat implementasi sistem form baru untuk aplikasi Taman Kehati.

## ✨ Yang Sudah Diimplementasikan

### 1. **FormSheet** - Side Panel Form ✅
- Form Flora (dengan validasi lengkap)
- Form Fauna (dengan conditional fields)
- Reusable component untuk form lainnya

### 2. **ActionDialog** - Quick Action Modal ✅  
- Approve/Reject workflow
- Delete confirmation
- Generic confirmation dialog

### 3. **Documentation** ✅
- Comprehensive guide
- Best practices
- Usage examples

---

## 🎯 Quick Usage

### Contoh 1: Tambah/Edit Flora

```tsx
import { FloraFormSheet } from '@/components/flora/FloraFormSheet';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

function MyFloraPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFlora, setSelectedFlora] = useState<Flora | null>(null);

  // Tambah flora baru
  const handleAdd = () => {
    setSelectedFlora(null);
    setIsFormOpen(true);
  };

  // Edit flora existing
  const handleEdit = (flora: Flora) => {
    setSelectedFlora(flora);
    setIsFormOpen(true);
  };

  // Refresh data setelah berhasil
  const handleSuccess = () => {
    loadFloraData(); // Your function to reload data
  };

  return (
    <>
      <Button onClick={handleAdd}>
        ➕ Tambah Flora
      </Button>

      <FloraFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        flora={selectedFlora}
        onSuccess={handleSuccess}
      />
    </>
  );
}
```

### Contoh 2: Tambah/Edit Fauna

```tsx
import { FaunaFormSheet } from '@/components/fauna/FaunaFormSheet';

function MyFaunaPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFauna, setSelectedFauna] = useState<Fauna | null>(null);

  return (
    <>
      <Button onClick={() => {
        setSelectedFauna(null);
        setIsFormOpen(true);
      }}>
        ➕ Tambah Fauna
      </Button>

      <FaunaFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        fauna={selectedFauna}
        onSuccess={() => loadFaunaData()}
      />
    </>
  );
}
```

### Contoh 3: Approval Flow

```tsx
import { ApprovalDialog } from '@/components/ui/action-dialog';
import { toast } from 'sonner';

function MyApprovalPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleApprove = async () => {
    try {
      await floraApi.approve(selectedItem.id);
      toast.success('Data berhasil disetujui');
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Gagal menyetujui data');
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await floraApi.reject(selectedItem.id, reason);
      toast.success('Data berhasil ditolak');
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Gagal menolak data');
    }
  };

  return (
    <>
      <Button onClick={() => {
        setSelectedItem(item);
        setIsDialogOpen(true);
      }}>
        Review
      </Button>

      <ApprovalDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onApprove={handleApprove}
        onReject={handleReject}
        itemName={`data ${selectedItem?.nama_ilmiah || 'flora'}`}
      />
    </>
  );
}
```

### Contoh 4: Delete Confirmation

```tsx
import { ActionDialog } from '@/components/ui/action-dialog';

function MyDataTable() {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      await floraApi.delete(selectedId);
      toast.success('Data berhasil dihapus');
      setIsDeleteOpen(false);
      loadData();
    } catch (error) {
      toast.error('Gagal menghapus data');
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => {
          setSelectedId(item.id);
          setIsDeleteOpen(true);
        }}
      >
        🗑️ Hapus
      </Button>

      <ActionDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        type="delete"
        title="Hapus Data Flora"
        description={`Data "${item.nama_ilmiah}" akan dihapus permanen. Lanjutkan?`}
        onConfirm={handleDelete}
      />
    </>
  );
}
```

---

## 🎨 Customization

### Custom FormSheet Width

```tsx
<FormSheet
  width="sm"   // Small: ~384px
  width="md"   // Medium: ~448px
  width="lg"   // Large: ~512px (default)
  width="xl"   // Extra Large: ~576px
/>
```

### Custom Side

```tsx
<FormSheet
  side="right"  // Default: slide from right
  side="left"   // Slide from left
/>
```

### Hide Footer

```tsx
<FormSheet
  showFooter={false}  // Hide footer if you want custom actions
>
  {/* Your custom footer */}
</FormSheet>
```

---

## 📝 Create Your Own Form

### Step 1: Copy Template

```tsx
'use client';

import { useState, useEffect } from 'react';
import { FormSheet, FormSection } from '../ui/form-sheet';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';

interface MyFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: any | null;
  onSuccess?: () => void;
}

export function MyFormSheet({ 
  open, 
  onOpenChange, 
  data, 
  onSuccess 
}: MyFormSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  // Reset or populate form when opened
  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        description: data.description || '',
      });
    } else {
      setFormData({ name: '', description: '' });
    }
  }, [data, open]);

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (data?.id) {
        // Update
        await api.update(data.id, formData);
        toast.success('Data updated');
      } else {
        // Create
        await api.create(formData);
        toast.success('Data created');
      }

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={data ? 'Edit Data' : 'Add Data'}
      description="Fill in the form below"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      width="md"
    >
      <FormSection title="Basic Information">
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-red-500">*</span>
          </Label>
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
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              description: e.target.value
            }))}
          />
        </div>
      </FormSection>
    </FormSheet>
  );
}
```

### Step 2: Use in Your Page

```tsx
import { MyFormSheet } from '@/components/my-module/MyFormSheet';

function MyPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsFormOpen(true)}>
        Add Data
      </Button>

      <MyFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => console.log('Success!')}
      />
    </>
  );
}
```

---

## 🔧 Common Patterns

### Pattern 1: Form with Sections

```tsx
<FormSheet title="User Profile" width="lg">
  <FormSection title="Personal Info" description="Basic information">
    <Field1 />
    <Field2 />
  </FormSection>

  <FormSection title="Contact" description="Contact details">
    <Field3 />
    <Field4 />
  </FormSection>

  <FormSection title="Preferences">
    <Field5 />
  </FormSection>
</FormSheet>
```

### Pattern 2: Conditional Fields

```tsx
<FormSheet>
  <FormSection>
    <Select
      value={type}
      onValueChange={setType}
    >
      <SelectItem value="A">Type A</SelectItem>
      <SelectItem value="B">Type B</SelectItem>
    </Select>

    {/* Show only if Type A */}
    {type === 'A' && (
      <Input placeholder="Field for Type A" />
    )}

    {/* Show only if Type B */}
    {type === 'B' && (
      <Input placeholder="Field for Type B" />
    )}
  </FormSection>
</FormSheet>
```

### Pattern 3: Image Preview

```tsx
<FormSection title="Image">
  <Input
    type="url"
    value={imageUrl}
    onChange={(e) => setImageUrl(e.target.value)}
  />
  
  {imageUrl && (
    <div className="mt-2 rounded-lg border p-2">
      <img
        src={imageUrl}
        alt="Preview"
        className="h-32 w-full object-cover rounded"
      />
    </div>
  )}
</FormSection>
```

---

## ⚡ Performance Tips

### 1. Memoize Form Components

```tsx
import { memo } from 'react';

export const MyFormSheet = memo(function MyFormSheet(props) {
  // Component code
});
```

### 2. Debounce Validation

```tsx
import { useDebounce } from '@/hooks/useDebounce';

const debouncedValue = useDebounce(formData.email, 500);

useEffect(() => {
  if (debouncedValue) {
    validateEmail(debouncedValue);
  }
}, [debouncedValue]);
```

### 3. Lazy Load Heavy Components

```tsx
import dynamic from 'next/dynamic';

const HeavyFormSheet = dynamic(
  () => import('@/components/HeavyFormSheet'),
  { ssr: false }
);
```

---

## 🐛 Troubleshooting

### Problem: Sheet not opening
**Solution**: Check if `open` prop is properly controlled
```tsx
const [open, setOpen] = useState(false); // Must be state
<FormSheet open={open} onOpenChange={setOpen} />
```

### Problem: Form not submitting
**Solution**: Check if `onSubmit` is provided and form validation passes
```tsx
<FormSheet onSubmit={handleSubmit} /> // Must provide handler
```

### Problem: Dialog behind other content
**Solution**: Check z-index. Sheet uses z-50 by default
```tsx
// If needed, adjust in tailwind.config.js
```

### Problem: Scroll not working
**Solution**: FormSheet uses ScrollArea. Check if content is properly nested
```tsx
<FormSheet>
  {/* Content goes directly here, not in extra divs */}
  <FormSection>...</FormSection>
</FormSheet>
```

---

## 📚 Full Documentation

Untuk dokumentasi lengkap, lihat:
- [FORM_UI_UX_GUIDE.md](./FORM_UI_UX_GUIDE.md) - Comprehensive guide
- [Component Files](./apps/frontend/src/components/ui/)
  - `form-sheet.tsx` - FormSheet component
  - `action-dialog.tsx` - ActionDialog component
- [Example Implementations](./apps/frontend/src/components/)
  - `flora/FloraFormSheet.tsx` - Flora form example
  - `fauna/FaunaFormSheet.tsx` - Fauna form example

---

## 🎯 Next Steps

1. ✅ Test Flora form: `/dashboard/flora`
2. ✅ Test Fauna form: `/dashboard/fauna`
3. ✅ Create your own forms using the template
4. ✅ Customize styling per your brand
5. ✅ Add to other modules (Activities, Articles, etc.)

---

**Questions?** Check the examples or documentation above! 🚀

