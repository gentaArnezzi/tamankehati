"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { prefetch } from "../../lib/api/prefetch";
import { ComponentProps } from "react";

/**
 * Link component dengan prefetch untuk optimasi navigasi
 * Automatically prefetch data saat user hover
 */
type PrefetchLinkProps = ComponentProps<typeof Link> & {
  prefetchType?: "flora" | "fauna" | "gallery" | "article" | "taman" | "news" | "dashboard";
  prefetchId?: string | number;
  prefetchParams?: Record<string, any>;
};

export function PrefetchLink({
  prefetchType,
  prefetchId,
  prefetchParams,
  href,
  children,
  onMouseEnter,
  ...props
}: PrefetchLinkProps) {
  const queryClient = useQueryClient();

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Prefetch data saat hover untuk instant load
    if (prefetchType && typeof window !== "undefined") {
      try {
        switch (prefetchType) {
          case "flora":
            if (prefetchId) {
              prefetch.floraDetail(queryClient, String(prefetchId));
            } else {
              prefetch.floraList(queryClient, prefetchParams);
            }
            break;
          case "fauna":
            if (prefetchId) {
              prefetch.faunaDetail(queryClient, String(prefetchId));
            } else {
              prefetch.faunaList(queryClient, prefetchParams);
            }
            break;
          case "gallery":
            if (prefetchId) {
              prefetch.galleryDetail(queryClient, String(prefetchId));
            } else {
              prefetch.galleryList(queryClient, prefetchParams);
            }
            break;
          case "article":
            if (prefetchId) {
              prefetch.articleDetail(queryClient, String(prefetchId));
            } else {
              prefetch.articlesList(queryClient, prefetchParams);
            }
            break;
          case "taman":
            if (prefetchId) {
              prefetch.tamanDetail(queryClient, String(prefetchId));
            } else {
              prefetch.tamanList(queryClient, prefetchParams);
            }
            break;
          case "news":
            if (prefetchId) {
              prefetch.newsDetail(queryClient, String(prefetchId));
            } else {
              prefetch.newsList(queryClient, prefetchParams);
            }
            break;
          case "dashboard":
            prefetch.dashboard(queryClient, prefetchParams?.time_range || "yearly");
            break;
        }
      } catch (error) {
        // Silent fail - prefetch is optional
        console.debug("Prefetch failed:", error);
      }
    }

    // Call original onMouseEnter if provided
    if (onMouseEnter) {
      onMouseEnter(e);
    }
  };

  return (
    <Link 
      href={href} 
      onMouseEnter={handleMouseEnter}
      prefetch={true} // Enable Next.js prefetch untuk instant navigation
      {...props}
    >
      {children}
    </Link>
  );
}

