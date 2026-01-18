import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter, createContext } from '../src/server/trpc' // Adjust path as needed

export default async function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: '/api', // The path where your API is mounted
    req,
    router: appRouter,
    createContext,
  })
}