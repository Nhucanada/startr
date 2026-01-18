import { router, publicProcedure } from './trpc';
import { z } from 'zod';

export const habitsRouter = router({
    createHabit: publicProcedure.mutation(async (opts) => {
        
    }),

    deleteHabit: publicProcedure.mutation(async (opts) => {
        
    }),

    updateHabit: publicProcedure.mutation(async (opts) => {
        
    }),
});