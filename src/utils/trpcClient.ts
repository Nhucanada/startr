import { httpBatchLink } from '@trpc/client'
import { QueryClient } from '@tanstack/react-query'
import { trpc } from './trpc.js'

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
        return token ? { Authorization: `Bearer ${token}` } : {}
      },
    }),
  ],
})

export { queryClient }