"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, PropsWithChildren } from "react";

export default function Provider({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
