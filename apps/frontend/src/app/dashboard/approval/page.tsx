"use client";

import { CollapsibleDashboardLayout } from "../../../components/CollapsibleDashboardLayout";
import { ApprovalPage } from "../../../components/approval/ApprovalPage";
import { RBACGuard } from "../../../components/RBACGuard";
import { useAuth } from "../../../lib/useAuth";
import { useRouter, usePathname } from "next/navigation";

export default function ApprovalDashboardPage() {
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
        <ApprovalPage />
      </CollapsibleDashboardLayout>
    </RBACGuard>
  );
}
