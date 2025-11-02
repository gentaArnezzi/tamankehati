"use client";

import { ReactNode } from "react";
import { PageSkeleton, DetailPageSkeleton, TableSkeleton } from "./page-skeleton";

type LoadingType = "page" | "detail" | "table" | "minimal";

interface PageLoadingProps {
  type?: LoadingType;
  children?: ReactNode;
}

/**
 * Fast loading component yang tidak blocking navigation
 * Menampilkan skeleton dengan animasi fade-in yang cepat
 */
export function PageLoading({ type = "page", children }: PageLoadingProps) {
  if (children) {
    return <div className="animate-in fade-in-50 duration-150">{children}</div>;
  }

  switch (type) {
    case "detail":
      return <DetailPageSkeleton />;
    case "table":
      return <TableSkeleton />;
    case "minimal":
      return (
        <div className="flex items-center justify-center min-h-[200px] animate-in fade-in-50 duration-150">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Memuat...</p>
          </div>
        </div>
      );
    default:
      return <PageSkeleton />;
  }
}

/**
 * Inline loading untuk section tertentu
 */
export function InlineLoading() {
  return (
    <div className="flex items-center justify-center py-8 animate-in fade-in-50 duration-150">
      <div className="text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto mb-2"></div>
        <p className="text-xs text-muted-foreground">Memuat...</p>
      </div>
    </div>
  );
}

/**
 * Overlay loading yang tidak blocking
 */
export function OverlayLoading({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in-50 duration-150">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    </div>
  );
}

