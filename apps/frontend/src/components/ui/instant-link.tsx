"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { prefetch } from "../../lib/api/prefetch";
import { ComponentProps, useEffect, useRef } from "react";

/**
 * Instant Link - Prefetch yang lebih agresif
 * Prefetch saat link masuk viewport (sebelum hover)
 * Navigasi instant tanpa delay
 */
type InstantLinkProps = ComponentProps<typeof Link> & {
  prefetchType?: "flora" | "fauna" | "gallery" | "article" | "taman" | "news" | "dashboard";
  prefetchId?: string | number;
  prefetchParams?: Record<string, any>;
};

export function InstantLink({
  prefetchType,
  prefetchId,
  prefetchParams,
  href,
  children,
  onMouseEnter,
  ...props
}: InstantLinkProps) {
  const queryClient = useQueryClient();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const hasPrefetched = useRef(false);

  // Prefetch saat link masuk viewport (lebih agresif)
  useEffect(() => {
    if (!prefetchType || !linkRef.current || hasPrefetched.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasPrefetched.current) {
            hasPrefetched.current = true;
            prefetchData();
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "100px", // Prefetch saat masih 100px sebelum masuk viewport
        threshold: 0.1,
      }
    );

    observer.observe(linkRef.current);

    return () => observer.disconnect();
  }, [prefetchType, prefetchId, prefetchParams]);

  // Juga prefetch saat hover (fallback)
  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!hasPrefetched.current) {
      prefetchData();
    }

    if (onMouseEnter) {
      onMouseEnter(e);
    }
  };

  const prefetchData = () => {
    if (!prefetchType || typeof window === "undefined") return;

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
  };

  return (
    <Link
      ref={linkRef}
      href={href}
      onMouseEnter={handleMouseEnter}
      prefetch={true} // Enable Next.js prefetch untuk instant navigation
      className={props.className}
      {...props}
    >
      {children}
    </Link>
  );
}

