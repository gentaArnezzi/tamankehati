import type { ReactNode } from "react";
import PublicLayout from "@/components/public/PublicLayout";
import { NavigationLoader } from "@/components/public/NavigationLoader";

export default function PublicRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <NavigationLoader />
      <PublicLayout>{children}</PublicLayout>
    </>
  );
}
