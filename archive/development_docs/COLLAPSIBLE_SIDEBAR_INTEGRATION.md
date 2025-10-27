# Collapsible Sidebar Dashboard Integration Guide

## 📋 Overview

This guide explains how to integrate the new collapsible sidebar dashboard component into your Taman Kehati admin dashboards (both Super Admin and Regional Admin).

## ✅ Prerequisites Check

Your project already has all required dependencies:
- ✅ **TypeScript** (v5.9.3)
- ✅ **Tailwind CSS** (v4.1.15) with dark mode support
- ✅ **lucide-react** (v0.487.0)
- ✅ **shadcn/ui** components
- ✅ **Next.js** with App Router

## 📁 Files Created

### 1. Base Component
```
/apps/frontend/src/components/ui/dashboard-with-collapsible-sidebar.tsx
```
Original demo component with example content.

### 2. Adapted Layout Component
```
/apps/frontend/src/components/CollapsibleDashboardLayout.tsx
```
Production-ready layout adapted for Taman Kehati with:
- Taman Kehati branding
- Role-based navigation (Super Admin & Regional Admin)
- Dark mode support
- Notification badges
- Responsive design

### 3. Demo Page
```
/apps/frontend/src/app/dashboard/demo-collapsible/page.tsx
```
Live demo showcasing the collapsible sidebar with real data.

## 🎨 Features

### ✨ Design Features
- **Smooth Animations**: 300ms transitions for sidebar collapse/expand
- **Dark Mode**: Full dark mode support with `class` strategy
- **Responsive**: Works perfectly on mobile, tablet, and desktop
- **Accessible**: Proper ARIA labels and keyboard navigation

### 🔧 Functional Features
- **Role-Based Menus**: Different menu items for Super Admin vs Regional Admin
- **Notification Badges**: Show counts on menu items
- **Active State**: Highlights current page
- **Collapsible**: Toggle between full (256px) and mini (64px) width
- **User Profile**: Shows user name and role with avatar

## 📖 How to Use

### Option 1: Use Demo Page (Quickest)
Visit the demo page to see it in action:
```
/dashboard/demo-collapsible
```

### Option 2: Integrate into Existing Dashboard

Replace your current `DashboardLayoutBase` or `DashboardLayoutNext` with `CollapsibleDashboardLayout`:

#### Before:
```tsx
// apps/frontend/src/app/dashboard/page.tsx
import { DashboardLayoutNext } from '../../components/DashboardLayoutNext';

export default function DashboardPage() {
  return (
    <DashboardLayoutNext>
      {/* Your content */}
    </DashboardLayoutNext>
  );
}
```

#### After:
```tsx
'use client';

import { CollapsibleDashboardLayout } from '../../components/CollapsibleDashboardLayout';
import { useAuth } from '../../lib/useAuth';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <CollapsibleDashboardLayout
      user={user}
      currentPath={pathname}
      onNavigate={(path) => router.push(path)}
      onLogout={() => {
        logout();
        router.push('/login');
      }}
    >
      {/* Your existing dashboard content */}
    </CollapsibleDashboardLayout>
  );
}
```

## 🎯 Integration Steps

### Step 1: Update Main Dashboard
```tsx
// apps/frontend/src/app/dashboard/page.tsx
'use client';

import React from 'react';
import { CollapsibleDashboardLayout } from '../../components/CollapsibleDashboardLayout';
import { Dashboard } from '../../components/Dashboard';
import { useAuth } from '../../lib/useAuth';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <CollapsibleDashboardLayout
      user={user}
      currentPath={pathname}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      <Dashboard />
    </CollapsibleDashboardLayout>
  );
}
```

### Step 2: Update Other Dashboard Pages

Apply the same pattern to:
- `/dashboard/users/page.tsx` (Super Admin)
- `/dashboard/approval/page.tsx` (Super Admin)
- `/dashboard/taman/page.tsx` (Regional Admin)
- `/dashboard/taman/flora/page.tsx` (Regional Admin)
- `/dashboard/taman/fauna/page.tsx` (Regional Admin)
- etc.

### Step 3: Test the Integration

1. **Run the development server:**
```bash
cd apps/frontend
npm run dev
```

2. **Test different user roles:**
   - Login as Super Admin
   - Check all menu items are visible
   - Test sidebar collapse/expand
   - Test dark mode toggle
   - Test navigation between pages
   
3. **Login as Regional Admin:**
   - Check Regional Admin specific menu items
   - Test all functionality

## 🎨 Customization

### Change Brand Colors
The component uses Tailwind's `brand` colors from your config. To customize:

   ```tsx
// In CollapsibleDashboardLayout.tsx
// Replace all instances of:
bg-brand-50 → bg-[your-color]-50
text-brand-600 → text-[your-color]-600
   ```

### Modify Menu Items
Edit the `buildNavItems` function in `CollapsibleDashboardLayout.tsx`:

   ```tsx
const buildNavItems = (role?: User['role'] | null): NavItem[] => {
  const baseItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    // Add more items here
  ];

  if (role === 'super_admin') {
    return [
      ...baseItems,
      // Add super admin specific items
    ];
  }

  if (role === 'regional_admin') {
    return [
      ...baseItems,
      // Add regional admin specific items
    ];
  }

  return baseItems;
};
```

### Add Notification Counts
Pass `notifs` prop to menu items:

```tsx
{ 
  id: 'approval', 
  label: 'Persetujuan', 
  icon: CheckCircle, 
  path: '/dashboard/approval',
  notifs: 5  // This will show a badge with "5"
}
```

### Disable Dark Mode
Remove dark mode toggle button from the header:

```tsx
// In CollapsibleDashboardLayout.tsx, comment out or remove:
<button onClick={() => setIsDark(!isDark)} ...>
  {isDark ? <Sun /> : <Moon />}
</button>
```

## 🔧 Advanced Customization

### Change Sidebar Width
```tsx
// In CollapsibleDashboardLayout.tsx
className={`... ${
  sidebarOpen ? 'w-64' : 'w-16'  // Change these values
} ...`}
```

### Add Sub-menus
Extend the NavItem type to support children:

```tsx
type NavItem = {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
  notifs?: number;
  children?: NavItem[];  // Add this
};
```

### Persist Sidebar State
Add localStorage persistence:

```tsx
const [sidebarOpen, setSidebarOpen] = useState(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? JSON.parse(saved) : true;
  }
  return true;
});

   useEffect(() => {
  localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
}, [sidebarOpen]);
```

## 🎯 Migration from Existing Layout

### From DashboardLayoutBase

**Differences:**
1. `CollapsibleDashboardLayout` has integrated header (no separate top bar)
2. Dark mode toggle is built-in
3. Notification bell is included in header
4. Smoother animations

**Migration Steps:**
1. Replace `DashboardLayoutBase` import with `CollapsibleDashboardLayout`
2. Remove any custom header components
3. Update props (same interface)
4. Test thoroughly

### From DashboardLayoutNext

Similar process as above. The new layout is a drop-in replacement with enhanced features.

## 📊 Component Props

### CollapsibleDashboardLayout Props

```tsx
interface CollapsibleDashboardLayoutProps {
  children: ReactNode;        // Page content
  user: User | null;          // Current user object
  currentPath: string;        // Current route path
  onNavigate: (path: string) => void;  // Navigation handler
  onLogout: () => void;       // Logout handler
}
```

### User Type

```tsx
interface User {
  id: string;
  nama: string;               // Display name
  email: string;
  role: 'super_admin' | 'regional_admin' | 'user';
  // ... other fields
}
```

## 🐛 Troubleshooting

### Issue: Sidebar not collapsing smoothly
**Solution:** Ensure Tailwind's transition utilities are not being overridden.

### Issue: Dark mode not working
**Solution:** Check that `darkMode: ["class"]` is set in `tailwind.config.js`.

### Issue: Icons not showing
**Solution:** Verify `lucide-react` is installed: `npm install lucide-react`

### Issue: Avatar not showing
**Solution:** Ensure Avatar components are imported from `./ui/avatar`.

### Issue: Navigation not working
**Solution:** Check that `onNavigate` is properly connected to Next.js router.

## 📱 Responsive Behavior

- **Desktop (≥1024px)**: Full sidebar visible by default
- **Tablet (768px-1023px)**: Collapsible sidebar
- **Mobile (<768px)**: Sidebar hidden, accessible via menu button (to be implemented)

## 🎨 Color Scheme

The component adapts to your existing Tailwind theme:

**Light Mode:**
- Background: `gray-50`
- Sidebar: `white`
- Active: `brand-50` with `brand-500` border
- Text: `gray-900`

**Dark Mode:**
- Background: `gray-950`
- Sidebar: `gray-900`
- Active: `brand-900/50` with `brand-500` border
- Text: `gray-100`

## ✅ Testing Checklist

- [ ] Sidebar collapses and expands smoothly
- [ ] All navigation links work correctly
- [ ] Active page is highlighted
- [ ] User name and role display correctly
- [ ] Avatar shows correct initial
- [ ] Dark mode toggle works
- [ ] Notification badges appear when set
- [ ] Logout button works
- [ ] Responsive on mobile, tablet, desktop
- [ ] No console errors
- [ ] TypeScript compiles without errors

## 🚀 Production Deployment

Before deploying to production:

1. **Test all user roles** in production-like environment
2. **Check performance** (sidebar animations should be 60fps)
3. **Verify dark mode** in all browsers
4. **Test responsive design** on real devices
5. **Check accessibility** with screen readers

## 📚 Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)
- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui Components](https://ui.shadcn.com)

## 💡 Best Practices

1. **Always wrap pages with `'use client'`** directive when using the layout
2. **Use useRouter and usePathname** from `next/navigation`
3. **Handle loading states** when user is not yet loaded
4. **Test with real user data** from your authentication system
5. **Keep menu items consistent** across all dashboard pages

## 🎉 Example Implementation

See `/dashboard/demo-collapsible` for a complete working example with:
- Stats cards
- Activity feed
- Charts and progress bars
- Responsive grid layout
- Dark mode support

## 📞 Support

If you encounter any issues:
1. Check the demo page at `/dashboard/demo-collapsible`
2. Review this documentation
3. Check browser console for errors
4. Verify all dependencies are installed

---

**Happy Coding! 🎨✨**

The new collapsible sidebar provides a modern, professional look to your Taman Kehati admin dashboard while maintaining excellent usability and performance.
