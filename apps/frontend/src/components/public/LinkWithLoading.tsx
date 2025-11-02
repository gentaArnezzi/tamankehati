"use client";

import { useState, MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LinkWithLoadingProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  [key: string]: any;
}

export function LinkWithLoading({
  href,
  children,
  className = "",
  prefetch = true,
  onClick,
  ...props
}: LinkWithLoadingProps) {
  const router = useRouter();

  return (
    <Link
      href={href}
      className={className}
      prefetch={prefetch}
      onClick={onClick}
      {...props}
    >
      {children}
    </Link>
  );
}

