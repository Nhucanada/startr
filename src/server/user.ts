import { router, publicProcedure } from './trpc-init.ts';
import { z } from 'zod';

export const userRouter = router({
  getUser: publicProcedure
    .input(z.string())
    .query((opts) => {
      return { id: opts.input, name: 'John Doe' };
    }),
  
  createUser: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation((opts) => {
      return { success: true };
    }),
});