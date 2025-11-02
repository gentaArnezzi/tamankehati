"use client";

import { DetailPageSkeleton } from "../../../../components/ui/page-skeleton";

/**
 * Loading skeleton untuk artikel detail page
 * Ditampilkan saat navigation (tidak blocking)
 */
export default function Loading() {
  return <DetailPageSkeleton />;
}

