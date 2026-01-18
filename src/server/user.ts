import { router, publicProcedure } from './trpc';
import { z } from 'zod';

export const userRouter = router({
  getUser: publicProcedure
    .input(z.string())  // user uuid
    .query((opts) => {
      return { id: opts.input, name: 'John Doe' };
    }),
  
  createUser: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation((opts) => {
      // Database logic here
      return { success: true };
    }),
});