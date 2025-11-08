"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#00ab6c] mx-auto mb-4" />
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Persetujuan Data
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Tinjau dan proses konten yang menunggu persetujuan
          </p>
        </div>
      </div>

      {/* Grouped view by park */}
      <GroupedApprovalView />
    </div>
  );
}
