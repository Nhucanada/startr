import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { supabase } from '../lib/supabase.js'

const t = initTRPC.create()

export const router = t.router
export const publicProcedure = t.procedure

export const appRouter = router({
  getUsers: publicProcedure
    .query(async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')

      if (error) {
        throw new Error(error.message)
      }

      return data
    }),

  createUser: publicProcedure
    .input(z.object({
      name: z.string(),
      email: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from('users')
        .insert([input])
        .select()

      if (error) {
        throw new Error(error.message)
      }

      return data[0]
    }),

  getUserById: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', input.id)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    }),
})

export type AppRouter = typeof appRouter