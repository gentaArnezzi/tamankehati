"use client";

import { useEffect } from "react";
import { CollapsibleDashboardLayout } from "../../../components/CollapsibleDashboardLayout";
import { AnnouncementsPage } from "../../../components/announcements/AnnouncementsPage";
import { RegionalAnnouncementsPage } from "../../../components/announcements/RegionalAnnouncementsPage";
import { useAuth } from "../../../lib/useAuth";
import { useRouter, usePathname } from "next/navigation";

export default function AnnouncementsDashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to login if not authenticated (must be in useEffect, not during render)
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
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
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Mengalihkan...</p>
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
      {user.role === "super_admin" ? (
        <AnnouncementsPage />
      ) : (
        <RegionalAnnouncementsPage />
      )}
    </CollapsibleDashboardLayout>
  );
}
