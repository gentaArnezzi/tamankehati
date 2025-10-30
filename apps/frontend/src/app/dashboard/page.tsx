"use client";

import React, { useEffect, useState } from "react";
import { CollapsibleDashboardLayout } from "../../components/CollapsibleDashboardLayout";
import { DashboardWithAnalytics } from "../../components/DashboardWithAnalytics";
import { useAuth } from "../../lib/useAuth";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Redirect to login if not authenticated (must be in useEffect, not during render)
  useEffect(() => {
    // Wait for auth to finish loading
    if (!loading) {
      setHasCheckedAuth(true);

      // Only redirect if we're sure there's no user after loading is complete
      if (!user) {
        // Small delay to ensure localStorage is fully read
        const timer = setTimeout(() => {
          // Double check localStorage directly as fallback
          const storedUser = localStorage.getItem("auth_user");
          const storedToken = localStorage.getItem("auth_token");

          if (!storedUser || !storedToken) {
            router.push("/login");
          }
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [loading, user, router]);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Show loading spinner while checking auth
  if (loading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pengguna...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting to login
  if (!user && hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Mengalihkan ke login...</p>
        </div>
      </div>
    );
  }

  return (
    <CollapsibleDashboardLayout
      user={user}
      currentPath={pathname}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      <DashboardWithAnalytics />
    </CollapsibleDashboardLayout>
  );
}
