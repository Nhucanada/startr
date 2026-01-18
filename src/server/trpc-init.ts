import { initTRPC } from '@trpc/server'

export const createContext = () => ({});
export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.create()

export const router = t.router
export const publicProcedure = t.procedure