import { Suspense } from "react";
import SearchClient from "./search-client";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-600">Loading search...</div>}>
      <SearchClient />
    </Suspense>
  );
}
