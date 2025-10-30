import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "minimal" | "icon-only";
  className?: string;
}

export function Logo({
  size = "md",
  variant = "default",
  className = "",
}: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const LogoIcon = () => (
    <img
      src="/logo/logo_klh.png"
      alt="Logo Kementerian Lingkungan Hidup"
      className={`${sizeClasses[size]} object-contain`}
    />
  );

  if (variant === "icon-only") {
    return <LogoIcon />;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoIcon />
      {variant !== "minimal" && (
        <span
          className={`font-semibold text-slate-800 ${textSizeClasses[size]}`}
        >
          Taman Kehati
        </span>
      )}
    </div>
  );
}
