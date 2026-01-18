import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { supabase } from '../lib/supabase.js'

import { userRouter } from './user.js';
import { habitsRouter } from './habits.js';

export const createContext = () => ({});
export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.create()

export const router = t.router
export const publicProcedure = t.procedure

export const appRouter = router({
  user: userRouter,
  habits: habitsRouter,
})

export type AppRouter = typeof appRouter