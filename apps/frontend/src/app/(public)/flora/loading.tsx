"use client";

import { PageSkeleton } from "../../../components/ui/page-skeleton";

/**
 * Loading skeleton untuk flora list page
 * Ditampilkan saat navigation (tidak blocking)
 */
export default function Loading() {
  return <PageSkeleton />;
}
