"use client";

import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../lib/useAuth";
import { GroupedApprovalView } from "./GroupedApprovalView";

export function ApprovalPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Check if user has admin privileges
    if (user.role !== "super_admin" && user.role !== "regional_admin") {
      toast.error(
        "Akses ditolak: Hanya admin yang dapat mengakses halaman persetujuan",
      );
      setLoading(false);
      return;
    }

    setLoading(false);
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#233c2b] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl mb-2 flex items-center gap-2">
          <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: "#356447" }} />
          Persetujuan Data
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Tinjau dan proses konten yang menunggu persetujuan sebelum
          dipublikasikan. Data dikelompokkan berdasarkan taman untuk memudahkan
          bulk approval.
        </p>
      </div>

      {/* Grouped view by park */}
      <GroupedApprovalView />
    </div>
  );
}
