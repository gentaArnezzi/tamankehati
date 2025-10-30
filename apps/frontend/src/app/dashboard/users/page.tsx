"use client";

import { CollapsibleDashboardLayout } from "../../../components/CollapsibleDashboardLayout";
import { UserPage } from "../../../components/users/UserPage";
import { RBACGuard } from "../../../components/RBACGuard";
import { useAuth } from "../../../lib/useAuth";
import { useRouter, usePathname } from "next/navigation";

export default function UsersDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <RBACGuard allowedRoles={["super_admin"]}>
      <CollapsibleDashboardLayout
        user={user}
        currentPath={pathname}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        <UserPage />
      </CollapsibleDashboardLayout>
    </RBACGuard>
  );
}
