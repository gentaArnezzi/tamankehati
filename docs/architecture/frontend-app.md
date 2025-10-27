# 🎨 Frontend Application Architecture

Comprehensive documentation of the Next.js frontend architecture and design patterns.

## Overview

The Taman Kehati frontend is built with Next.js 14, providing a modern, responsive, and performant user interface for biodiversity management. It follows React best practices with TypeScript for type safety.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│                 (React Components & Pages)                  │
├─────────────────────────────────────────────────────────────┤
│                    State Management                          │
│              (TanStack Query + Zustand)                     │
├─────────────────────────────────────────────────────────────┤
│                     API Layer                               │
│                (Axios + API Client)                         │
├─────────────────────────────────────────────────────────────┤
│                    Utility Layer                            │
│              (Utils, Hooks, Types)                         │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
apps/frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth route group
│   │   ├── (dashboard)/       # Dashboard route group
│   │   ├── api/               # API routes
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable components
│   │   ├── ui/                # Base UI components
│   │   ├── forms/             # Form components
│   │   ├── layout/            # Layout components
│   │   └── features/          # Feature-specific components
│   ├── lib/                   # Utility libraries
│   │   ├── api-client.ts      # API client configuration
│   │   ├── auth.ts            # Authentication utilities
│   │   ├── utils.ts           # General utilities
│   │   └── validations.ts     # Form validation schemas
│   ├── hooks/                 # Custom React hooks
│   ├── stores/                # State management stores
│   ├── types/                 # TypeScript type definitions
│   └── styles/                # Additional styles
├── public/                    # Static assets
├── package.json               # Dependencies
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## Core Technologies

### Framework & Runtime
- **Next.js 14**: React framework with App Router
- **React 18**: UI library with concurrent features
- **TypeScript**: Type-safe JavaScript
- **Node.js 20**: JavaScript runtime

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Animation library
- **Lucide React**: Icon library

### State Management
- **TanStack Query**: Server state management
- **Zustand**: Client state management
- **React Hook Form**: Form state management

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Jest**: Testing framework

## Application Architecture

### 1. App Router Structure

#### Root Layout
```typescript
// src/app/layout.tsx
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Taman Kehati',
  description: 'Biodiversity Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

#### Route Groups
```typescript
// src/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        {children}
      </div>
    </div>
  );
}

// src/app/(dashboard)/layout.tsx
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 2. Component Architecture

#### Base UI Components
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

#### Feature Components
```typescript
// src/components/features/park-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Park } from '@/types/park';

interface ParkCardProps {
  park: Park;
  onEdit?: (park: Park) => void;
  onDelete?: (park: Park) => void;
}

export function ParkCard({ park, onEdit, onDelete }: ParkCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {park.name}
          <Badge variant="secondary">{park.area} ha</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{park.description}</p>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(park)}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(park)}>
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3. State Management

#### TanStack Query Setup
```typescript
// src/components/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 3,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

#### API Hooks
```typescript
// src/hooks/use-parks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parkApi } from '@/lib/api-client';
import { Park, ParkCreate, ParkUpdate } from '@/types/park';

export function useParks() {
  return useQuery({
    queryKey: ['parks'],
    queryFn: parkApi.getParks,
  });
}

export function usePark(id: number) {
  return useQuery({
    queryKey: ['parks', id],
    queryFn: () => parkApi.getPark(id),
    enabled: !!id,
  });
}

export function useCreatePark() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: parkApi.createPark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parks'] });
    },
  });
}

export function useUpdatePark() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ParkUpdate }) =>
      parkApi.updatePark(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['parks'] });
      queryClient.invalidateQueries({ queryKey: ['parks', id] });
    },
  });
}

export function useDeletePark() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: parkApi.deletePark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parks'] });
    },
  });
}
```

#### Client State Management
```typescript
// src/stores/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

### 4. API Client

#### API Client Configuration
```typescript
// src/lib/api-client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth-store';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();

// API endpoints
export const parkApi = {
  getParks: () => apiClient.get('/api/v1/parks'),
  getPark: (id: number) => apiClient.get(`/api/v1/parks/${id}`),
  createPark: (data: any) => apiClient.post('/api/v1/parks', data),
  updatePark: (id: number, data: any) => apiClient.put(`/api/v1/parks/${id}`, data),
  deletePark: (id: number) => apiClient.delete(`/api/v1/parks/${id}`),
};
```

### 5. Form Handling

#### Form Components
```typescript
// src/components/forms/park-form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Park, ParkCreate } from '@/types/park';

const parkSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().optional(),
  location: z.string().optional(),
  area: z.number().min(0, 'Area must be positive').optional(),
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
      name: park?.name || '',
      description: park?.description || '',
      location: park?.location || '',
      area: park?.area || undefined,
    },
  });

  const handleSubmit = (data: ParkFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Park name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Park description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
          name="area"
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

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### 6. Type Definitions

#### TypeScript Types
```typescript
// src/types/park.ts
export interface Park {
  id: number;
  name: string;
  description?: string;
  location?: string;
  area?: number;
  created_at: string;
  updated_at: string;
  zones?: Zone[];
  flora?: Flora[];
  fauna?: Fauna[];
}

export interface ParkCreate {
  name: string;
  description?: string;
  location?: string;
  area?: number;
}

export interface ParkUpdate {
  name?: string;
  description?: string;
  location?: string;
  area?: number;
}

export interface Zone {
  id: number;
  name: string;
  description?: string;
  park_id: number;
  created_at: string;
  updated_at: string;
}

export interface Flora {
  id: number;
  name: string;
  scientific_name?: string;
  description?: string;
  park_id: number;
  created_at: string;
  updated_at: string;
}

export interface Fauna {
  id: number;
  name: string;
  scientific_name?: string;
  description?: string;
  park_id: number;
  created_at: string;
  updated_at: string;
}
```

### 7. Styling System

#### Tailwind Configuration
```typescript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

## Performance Optimization

### Code Splitting
```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/features/map'), {
  loading: () => <div>Loading map...</div>,
  ssr: false,
});

const ChartComponent = dynamic(() => import('@/components/features/chart'), {
  loading: () => <div>Loading chart...</div>,
});
```

### Image Optimization
```typescript
// Next.js Image component
import Image from 'next/image';

export function ParkImage({ src, alt, ...props }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={300}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
      {...props}
    />
  );
}
```

### Bundle Optimization
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    };
    return config;
  },
};

module.exports = nextConfig;
```

## Testing

### Component Testing
```typescript
// src/components/__tests__/park-card.test.tsx
import { render, screen } from '@testing-library/react';
import { ParkCard } from '../features/park-card';
import { Park } from '@/types/park';

const mockPark: Park = {
  id: 1,
  name: 'Test Park',
  description: 'Test Description',
  location: 'Test Location',
  area: 100,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

describe('ParkCard', () => {
  it('renders park information', () => {
    render(<ParkCard park={mockPark} />);
    
    expect(screen.getByText('Test Park')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('100 ha')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<ParkCard park={mockPark} onEdit={onEdit} />);
    
    screen.getByText('Edit').click();
    expect(onEdit).toHaveBeenCalledWith(mockPark);
  });
});
```

## Related Documentation

- [System Architecture Overview](overview.md)
- [Backend API Architecture](backend-api.md)
- [Database Schema Design](database-schema.md)
- [Development Workflow](../development/workflow.md)
- [Frontend Components](../development/frontend-components.md)
