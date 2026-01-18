import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { QueryClient } from '@tanstack/react-query'
import { trpc } from './trpc.js'
import type { AppRouter } from '../server/trpc.js'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/',
      headers() {
        const token = localStorage.getItem('auth_token')
        console.log('[trpcClient] Auth token:', token ? 'present' : 'missing')
        return token ? { Authorization: `Bearer ${token}` } : {}
      },
    }),
  ],
})

// Vanilla client for use outside React components
export const vanillaTrpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/',
      headers() {
        const token = localStorage.getItem('auth_token')
        return token ? { Authorization: `Bearer ${token}` } : {}
      },
    }),
  ],
})

export { queryClient }