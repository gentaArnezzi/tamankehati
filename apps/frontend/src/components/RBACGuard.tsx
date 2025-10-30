import { ReactNode } from "react";
import { useAuth } from "../lib/useAuth";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle } from "lucide-react";

interface RBACGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
  requireParkId?: number;
  fallback?: ReactNode;
}

export function RBACGuard({
  children,
  allowedRoles,
  requireParkId,
  fallback,
}: RBACGuardProps) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#233c2b] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Akses Ditolak</AlertTitle>
          <AlertDescription>
            Anda harus masuk ke sistem untuk mengakses halaman ini.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check role access
  if (allowedRoles && user) {
    const hasAccess = allowedRoles.includes(user.role);
    if (!hasAccess) {
      if (fallback) return <>{fallback}</>;
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Akses Ditolak</AlertTitle>
            <AlertDescription>
              Anda tidak memiliki izin untuk mengakses halaman ini.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  }

  // Check park access
  if (requireParkId && user) {
    const canAccess =
      user.role === "super_admin" || user.park_id === requireParkId;
    if (!canAccess) {
      if (fallback) return <>{fallback}</>;
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Akses Ditolak</AlertTitle>
            <AlertDescription>
              Anda tidak memiliki izin untuk mengakses data wilayah ini.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  }

  return <>{children}</>;
}
