"use client";

import Image from "next/image";
import { imageUrl } from "../../lib/api-url";
import type { ImageProps } from "next/image";

/**
 * SafeImage - Wrapper for Next.js Image that guarantees no localhost URLs
 * 
 * This component automatically normalizes all image URLs to prevent
 * "localhost is not configured" errors in Next.js Image component.
 * 
 * Use this instead of Image directly when dealing with dynamic image URLs
 * from API responses.
 */
export function SafeImage({
  src,
  alt = "",
  ...props
}: Omit<ImageProps, 'src'> & { src: string | null | undefined; alt?: string }) {
  // Normalize the URL using centralized helper
  let normalizedSrc = imageUrl(src);
  
  // CRITICAL: Final safety check - ensure absolutely no localhost
  // This is a last resort check that should never be needed if imageUrl() works correctly
  // but we include it as a safety net
  if (normalizedSrc.includes('localhost:8000') || normalizedSrc.includes('127.0.0.1:8000')) {
    console.error('⚠️ SafeImage: localhost detected after normalization!', {
      original: src,
      normalized: normalizedSrc
    });
    
    // Force replacement
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://38.47.93.167:8080";
    
    // Extract path
    const pathMatch = normalizedSrc.match(/(\/uploads\/[^?\s]*)/);
    if (pathMatch) {
      normalizedSrc = `${baseUrl}${pathMatch[1]}`;
    } else {
      // Fallback: aggressive replacement
      normalizedSrc = normalizedSrc
        .replace(/https?:\/\/localhost:8000[^\/]*/gi, baseUrl)
        .replace(/https?:\/\/127\.0\.0\.1:8000[^\/]*/gi, baseUrl)
        .replace(/localhost:8000/gi, baseUrl)
        .replace(/127\.0\.0\.1:8000/gi, baseUrl);
    }
  }
  
  // Final verification - if still contains localhost, use fallback
  if (normalizedSrc.includes('localhost:8000') || normalizedSrc.includes('127.0.0.1:8000')) {
    console.error('❌ SafeImage: Failed to normalize localhost URL, using fallback', {
      original: src,
      final: normalizedSrc
    });
    normalizedSrc = "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=400&fit=crop";
  }
  
  return <Image src={normalizedSrc} alt={alt} {...props} />;
}

