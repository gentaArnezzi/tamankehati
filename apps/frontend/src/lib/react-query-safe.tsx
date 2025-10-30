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
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes default
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
    mutations: {
      retry: false, // Don't retry mutations by default
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
