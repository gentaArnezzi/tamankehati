"use client";

import { Skeleton } from "./skeleton";
import { Card, CardContent, CardHeader } from "./card";

/**
 * Fast loading skeleton untuk page
 * Menampilkan skeleton yang tidak blocking navigation
 */
export function PageSkeleton() {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 animate-in fade-in-50 duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact skeleton untuk detail pages
 */
export function DetailPageSkeleton() {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 animate-in fade-in-50 duration-200">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb Skeleton */}
        <Skeleton className="h-4 w-64" />

        {/* Title Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Image Skeleton */}
        <Skeleton className="h-96 w-full rounded-lg" />

        {/* Content Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}

/**
 * Table skeleton untuk list pages
 */
export function TableSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in-50 duration-200">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="border rounded-lg">
        <div className="border-b p-4">
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b p-4 last:border-b-0">
            <div className="grid grid-cols-4 gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

