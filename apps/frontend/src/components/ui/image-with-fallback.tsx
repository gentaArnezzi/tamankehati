"use client";

import { useState } from "react";
import Image from "next/image";
import { imageUrl as getImageUrl } from "../../lib/api-url";

type ImageWithFallbackProps = {
  src?: string | null;
  alt: string;
  title: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  width?: number;
  height?: number;
};

export function ImageWithFallback({
  src,
  alt,
  title,
  fill = false,
  className = "",
  sizes,
  priority = false,
  loading = "lazy",
  width,
  height,
}: ImageWithFallbackProps) {
  const [imageError, setImageError] = useState(false);

  const shouldShowFallback = !src || src.trim() === "" || imageError;

  if (shouldShowFallback) {
    return (
      <div
        className={`relative flex items-center justify-center bg-slate-800 ${className}`}
      >
        <div className="text-center text-white max-w-full p-6 md:p-8 lg:p-12">
          <p className="text-xl md:text-2xl lg:text-3xl font-light italic line-clamp-3">
            {title}
          </p>
        </div>
      </div>
    );
  }

  // Build full URL using centralized helper (this will normalize localhost:8000)
  // MUST normalize before passing to Next.js Image component
  const normalizedImageUrl = getImageUrl(src);
  
  // Double-check: ensure no localhost URLs reach Next.js Image
  // (Next.js will throw error if localhost is not in next.config.js)
  const finalUrl = normalizedImageUrl.includes("localhost") 
    ? normalizedImageUrl.replace(/http:\/\/localhost:8000|https:\/\/localhost:8000|http:\/\/127\.0\.0\.1:8000/gi, 
        process.env.NEXT_PUBLIC_API_URL || "https://tamankehati-backend-pxnu.onrender.com")
    : normalizedImageUrl;

  const imageProps: any = {
    src: finalUrl,
    alt,
    className,
    sizes,
    onError: () => {
      setImageError(true);
    },
    // Skip Next.js optimization for external images that might fail
    // This prevents 404 errors from breaking the page
    unoptimized: false,
  };

  // Priority and loading are mutually exclusive
  // Only set priority if true, otherwise use loading
  if (priority) {
    imageProps.priority = true;
  } else if (loading) {
    imageProps.loading = loading;
  }

  if (fill) {
    imageProps.fill = true;
  } else {
    imageProps.width = width;
    imageProps.height = height;
  }

  return <Image {...imageProps} />;
}
