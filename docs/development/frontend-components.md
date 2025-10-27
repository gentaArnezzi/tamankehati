# 🎨 Frontend Components

Comprehensive guide to the frontend component library and UI patterns used in Taman Kehati.

## Overview

The Taman Kehati frontend uses a modern component-based architecture built with React, TypeScript, and Tailwind CSS. This guide covers the component library, design patterns, and best practices.

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Page Components                          │
│                 (App Router Pages)                         │
├─────────────────────────────────────────────────────────────┤
│                   Feature Components                        │
│              (Business Logic Components)                   │
├─────────────────────────────────────────────────────────────┤
│                    Layout Components                        │
│              (Navigation, Sidebar, Header)                 │
├─────────────────────────────────────────────────────────────┤
│                     UI Components                           │
│              (Buttons, Forms, Cards, etc.)                 │
└─────────────────────────────────────────────────────────────┘
```

## Component Structure

```
src/components/
├── ui/                    # Base UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   ├── table.tsx
│   ├── badge.tsx
│   ├── avatar.tsx
│   ├── dropdown-menu.tsx
│   ├── select.tsx
│   ├── textarea.tsx
│   ├── checkbox.tsx
│   ├── radio-group.tsx
│   ├── switch.tsx
│   ├── slider.tsx
│   ├── progress.tsx
│   ├── toast.tsx
│   ├── alert.tsx
│   ├── tabs.tsx
│   ├── accordion.tsx
│   ├── collapsible.tsx
│   ├── separator.tsx
│   ├── skeleton.tsx
│   ├── tooltip.tsx
│   ├── popover.tsx
│   ├── sheet.tsx
│   ├── navigation-menu.tsx
│   ├── breadcrumb.tsx
│   ├── pagination.tsx
│   └── index.ts
├── layout/                # Layout components
│   ├── header.tsx
│   ├── sidebar.tsx
│   ├── footer.tsx
│   ├── main-layout.tsx
│   ├── auth-layout.tsx
│   └── dashboard-layout.tsx
├── forms/                 # Form components
│   ├── park-form.tsx
│   ├── flora-form.tsx
│   ├── fauna-form.tsx
│   ├── activity-form.tsx
│   ├── user-form.tsx
│   └── announcement-form.tsx
├── features/              # Feature-specific components
│   ├── parks/
│   │   ├── park-card.tsx
│   │   ├── park-list.tsx
│   │   ├── park-details.tsx
│   │   ├── park-map.tsx
│   │   └── park-stats.tsx
│   ├── flora/
│   │   ├── flora-card.tsx
│   │   ├── flora-list.tsx
│   │   ├── flora-details.tsx
│   │   └── flora-gallery.tsx
│   ├── fauna/
│   │   ├── fauna-card.tsx
│   │   ├── fauna-list.tsx
│   │   ├── fauna-details.tsx
│   │   └── fauna-gallery.tsx
│   ├── activities/
│   │   ├── activity-card.tsx
│   │   ├── activity-list.tsx
│   │   ├── activity-details.tsx
│   │   └── activity-calendar.tsx
│   ├── dashboard/
│   │   ├── stats-cards.tsx
│   │   ├── recent-activities.tsx
│   │   ├── park-overview.tsx
│   │   └── biodiversity-chart.tsx
│   └── maps/
│       ├── interactive-map.tsx
│       ├── map-marker.tsx
│       ├── map-popup.tsx
│       └── map-controls.tsx
└── common/                # Common components
    ├── loading.tsx
    ├── error-boundary.tsx
    ├── not-found.tsx
    ├── empty-state.tsx
    ├── search-bar.tsx
    ├── filter-panel.tsx
    ├── pagination.tsx
    └── file-upload.tsx
```

## Base UI Components

### Button Component
```typescript
// src/components/ui/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### Card Component
```typescript
// src/components/ui/card.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

### Input Component
```typescript
// src/components/ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
```

## Layout Components

### Header Component
```typescript
// src/components/layout/header.tsx
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Menu, Search } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export function Header() {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-gray-900">Taman Kehati</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.full_name} />
                  <AvatarFallback>
                    {user?.full_name?.charAt(0) || user?.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
```

### Sidebar Component
```typescript
// src/components/layout/sidebar.tsx
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Map, TreePine, Rabbit, Calendar, FileText, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Parks", href: "/parks", icon: Map },
  { name: "Flora", href: "/flora", icon: TreePine },
  { name: "Fauna", href: "/fauna", icon: Rabbit },
  { name: "Activities", href: "/activities", icon: Calendar },
  { name: "Announcements", href: "/announcements", icon: FileText },
  { name: "Users", href: "/users", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Taman Kehati
          </h2>
          <ScrollArea className="px-1">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}
```

## Feature Components

### Park Card Component
```typescript
// src/components/features/parks/park-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, Edit, Trash2, Eye } from "lucide-react";
import { Park } from "@/types/park";
import { formatDistanceToNow } from "date-fns";

interface ParkCardProps {
  park: Park;
  onEdit?: (park: Park) => void;
  onDelete?: (park: Park) => void;
  onView?: (park: Park) => void;
  isLoading?: boolean;
}

export function ParkCard({ park, onEdit, onDelete, onView, isLoading }: ParkCardProps) {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{park.name}</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{park.location}</span>
            </div>
          </div>
          <Badge variant={park.status === 'active' ? 'default' : 'secondary'}>
            {park.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {park.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {park.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDistanceToNow(new Date(park.created_at))} ago</span>
            </div>
            {park.area_hectares && (
              <Badge variant="outline">
                {park.area_hectares} ha
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {park.zones && park.zones.length > 0 && (
                <Badge variant="outline">
                  {park.zones.length} zones
                </Badge>
              )}
              {park.flora && park.flora.length > 0 && (
                <Badge variant="outline">
                  {park.flora.length} flora
                </Badge>
              )}
              {park.fauna && park.fauna.length > 0 && (
                <Badge variant="outline">
                  {park.fauna.length} fauna
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              {onView && (
                <Button variant="ghost" size="sm" onClick={() => onView(park)}>
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onEdit && (
                <Button variant="ghost" size="sm" onClick={() => onEdit(park)}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="sm" onClick={() => onDelete(park)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Park List Component
```typescript
// src/components/features/parks/park-list.tsx
import { useState } from "react";
import { ParkCard } from "./park-card";
import { Park } from "@/types/park";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { Loading } from "@/components/common/loading";

interface ParkListProps {
  parks: Park[];
  isLoading?: boolean;
  onEdit?: (park: Park) => void;
  onDelete?: (park: Park) => void;
  onView?: (park: Park) => void;
  onCreate?: () => void;
}

export function ParkList({ 
  parks, 
  isLoading, 
  onEdit, 
  onDelete, 
  onView, 
  onCreate 
}: ParkListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredParks = parks.filter(park => {
    const matchesSearch = park.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         park.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || park.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <ParkCard key={index} park={{} as Park} isLoading />
        ))}
      </div>
    );
  }

  if (parks.length === 0) {
    return (
      <EmptyState
        title="No parks found"
        description="Get started by creating your first park"
        action={
          onCreate && (
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Park
            </Button>
          )
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search parks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>

        {onCreate && (
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Park
          </Button>
        )}
      </div>

      {/* Parks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParks.map((park) => (
          <ParkCard
            key={park.id}
            park={park}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        ))}
      </div>

      {filteredParks.length === 0 && parks.length > 0 && (
        <EmptyState
          title="No parks match your search"
          description="Try adjusting your search terms or filters"
        />
      )}
    </div>
  );
}
```

## Form Components

### Park Form Component
```typescript
// src/components/forms/park-form.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Park, ParkCreate } from "@/types/park";

const parkSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().optional(),
  location: z.string().optional(),
  area_hectares: z.number().min(0, "Area must be positive").optional(),
  status: z.enum(["active", "inactive", "maintenance"]).default("active"),
});

type ParkFormData = z.infer<typeof parkSchema>;

interface ParkFormProps {
  park?: Park;
  onSubmit: (data: ParkCreate) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ParkForm({ park, onSubmit, onCancel, isLoading }: ParkFormProps) {
  const form = useForm<ParkFormData>({
    resolver: zodResolver(parkSchema),
    defaultValues: {
      name: park?.name || "",
      description: park?.description || "",
      location: park?.location || "",
      area_hectares: park?.area_hectares || undefined,
      status: park?.status || "active",
    },
  });

  const handleSubmit = (data: ParkFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Park name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Park description" 
                  rows={4}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Park location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="area_hectares"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Area (hectares)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Area in hectares"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : park ? "Update Park" : "Create Park"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

## Common Components

### Loading Component
```typescript
// src/components/common/loading.tsx
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function Loading({ size = "md", className, text }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex items-center space-x-2">
        <Loader2 className={cn("animate-spin", sizeClasses[size])} />
        {text && <span className="text-sm text-gray-600">{text}</span>}
      </div>
    </div>
  );
}
```

### Empty State Component
```typescript
// src/components/common/empty-state.tsx
import { Button } from "@/components/ui/button";
import { FileX } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-gray-400 mb-4">
        {icon || <FileX className="h-12 w-12" />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 text-center mb-6 max-w-sm">
        {description}
      </p>
      {action}
    </div>
  );
}
```

### Error Boundary Component
```typescript
// src/components/common/error-boundary.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            reset={() => this.setState({ hasError: false, error: undefined })}
          />
        );
      }

      return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6 max-w-sm">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <Button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Component Patterns

### Compound Components
```typescript
// Example: Modal compound component
const Modal = ({ children, ...props }) => { /* ... */ };
const ModalHeader = ({ children, ...props }) => { /* ... */ };
const ModalBody = ({ children, ...props }) => { /* ... */ };
const ModalFooter = ({ children, ...props }) => { /* ... */ };

// Usage
<Modal>
  <ModalHeader>Title</ModalHeader>
  <ModalBody>Content</ModalBody>
  <ModalFooter>Actions</ModalFooter>
</Modal>
```

### Render Props
```typescript
interface DataProviderProps {
  children: (data: any, loading: boolean, error: any) => React.ReactNode;
}

const DataProvider = ({ children }: DataProviderProps) => {
  const { data, loading, error } = useQuery();
  return <>{children(data, loading, error)}</>;
};
```

### Higher-Order Components
```typescript
const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
      return <LoginPage />;
    }
    
    return <Component {...props} />;
  };
};
```

## Best Practices

### Component Design
- Keep components small and focused
- Use TypeScript for type safety
- Follow single responsibility principle
- Use composition over inheritance
- Make components reusable and configurable

### Props Design
- Use descriptive prop names
- Provide default values where appropriate
- Use union types for variants
- Document prop interfaces
- Use optional props for non-essential features

### State Management
- Use local state for component-specific data
- Use global state for shared data
- Avoid prop drilling
- Use custom hooks for complex logic
- Keep state as close to where it's used as possible

### Performance
- Use React.memo for expensive components
- Use useMemo and useCallback for expensive calculations
- Avoid creating objects in render
- Use lazy loading for large components
- Optimize re-renders

## Related Documentation

- [Frontend Application Architecture](../architecture/frontend-app.md)
- [Development Workflow](workflow.md)
- [Testing Guide](testing.md)
- [API Documentation](api-docs.md)
