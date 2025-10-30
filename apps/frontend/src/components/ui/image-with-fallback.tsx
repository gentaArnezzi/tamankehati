"use client";

import { useState } from "react";
import Image from "next/image";

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

  const imageProps: any = {
    src: src.startsWith("http")
      ? src
      : `${process.env.NEXT_PUBLIC_API_URL || "https://tamankehati-backend-pxnu.onrender.com"}${src}`,
    alt,
    className,
    sizes,
    onError: () => setImageError(true),
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
