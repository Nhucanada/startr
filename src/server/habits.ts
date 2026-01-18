import { router, publicProcedure } from './trpc-init.ts';
import { z } from 'zod';

export const habitsRouter = router({
    createHabit: publicProcedure.mutation(async (opts) => {
        
    }),

    deleteHabit: publicProcedure.mutation(async (opts) => {
        
    }),

    updateHabit: publicProcedure.mutation(async (opts) => {
        
    }),
});