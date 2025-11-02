"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export function NavigationLoader() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const prevPathnameRef = useRef(pathname);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only show loader if pathname actually changed
    if (prevPathnameRef.current !== pathname) {
      // Start progress
      setProgress(10);

      // Simulate smooth progress
      let currentProgress = 10;
      timerRef.current = setInterval(() => {
        currentProgress += Math.random() * 15;
        if (currentProgress >= 90) {
          currentProgress = 90;
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
        setProgress(currentProgress);
      }, 100);

      // Complete after short delay
      const completeTimer = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setProgress(0);
        }, 150);
      }, 400);

      prevPathnameRef.current = pathname;

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        clearTimeout(completeTimer);
      };
    }
  }, [pathname]);

  if (progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent pointer-events-none">
      <div
        className="h-full bg-emerald-500 transition-all duration-150 ease-out shadow-sm"
        style={{ width: `${progress}%`, boxShadow: "0 0 10px rgba(16, 185, 129, 0.5)" }}
      />
    </div>
  );
}

