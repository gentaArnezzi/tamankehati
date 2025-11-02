"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface ReactQueryProviderProps {
  children: ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors (kurangi retry untuk faster UX)
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes default - data dianggap fresh selama 5 menit
      gcTime: 15 * 60 * 1000, // 15 minutes (formerly cacheTime) - cache data lebih lama
      refetchOnWindowFocus: false, // Disable auto-refetch on focus untuk better UX
      refetchOnReconnect: true, // Refetch saat reconnect untuk data fresh
      refetchOnMount: true, // Refetch saat mount jika data stale
      // Enable background refetch untuk silent updates
      refetchInterval: false, // Disable auto polling by default
    },
    mutations: {
      retry: false, // Don't retry mutations by default
      // Optimistic updates can be added per mutation
    },
  },
});

// Safe DevTools component that handles chunk loading errors
const SafeReactQueryDevtools = () => {
  const [DevTools, setDevTools] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    // Only load DevTools if not in error state
    if (!error) {
      import("@tanstack/react-query-devtools")
        .then((module) => {
          setDevTools(() => module.ReactQueryDevtools);
        })
        .catch((err) => {
          console.warn("Failed to load React Query DevTools:", err);
          setError(true);
        });
    }
  }, [error]);

  if (!DevTools || error) {
    return null;
  }

  return <DevTools initialIsOpen={false} />;
};

export const ReactQueryProvider: React.FC<ReactQueryProviderProps> = ({
  children,
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <SafeReactQueryDevtools />
    </QueryClientProvider>
  );
};
