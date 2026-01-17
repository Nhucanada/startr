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
      url: '/api/trpc',
    }),
  ],
})

export { queryClient }