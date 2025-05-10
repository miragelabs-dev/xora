'use client';

import { api } from '@/utils/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000,
        retry: 0
      },
    },
  }));

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpLink({
          url: '/api/trpc',
          transformer: superjson,
          fetch: (url, options) => {
            return fetch(url, {
              ...options,
              credentials: 'include',
            });
          }
        }),
      ],
    })
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
} 