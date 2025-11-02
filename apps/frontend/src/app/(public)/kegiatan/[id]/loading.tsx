"use client";

import { DetailPageSkeleton } from "../../../../components/ui/page-skeleton";

/**
 * Loading skeleton untuk kegiatan detail page
 * Ditampilkan saat navigation (tidak blocking)
 */
export default function Loading() {
  return <DetailPageSkeleton />;
}

