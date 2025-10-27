'use client';

import React from 'react';
import { ThemeProvider } from '../lib/theme-provider';
import { ReactQueryProvider } from '../lib/react-query-safe';
import { AuthProvider } from '../lib/useAuth';
import { Toaster } from '../components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="taman-kehati-theme">
      <ReactQueryProvider>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </ReactQueryProvider>
    </ThemeProvider>
  );
}
