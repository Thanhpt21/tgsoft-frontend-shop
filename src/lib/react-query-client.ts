// lib/react-query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // cache 1 phút
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
