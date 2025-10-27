'use client';

import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { PublicHeader } from './PublicHeader';
import { Footer } from './Footer';
import { RouteAnalytics } from './analytics/RouteAnalytics';

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-emerald-700 focus:px-4 focus:py-2 focus:text-white focus:ring-2 focus:ring-emerald-200"
      >
        Lewati ke konten
      </a>

      <Suspense fallback={null}>
        <RouteAnalytics />
      </Suspense>

      <PublicHeader />

      <main id="content" role="main" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <Footer />
      </footer>
    </div>
  );
}
