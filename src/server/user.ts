import { router, publicProcedure } from './trpc-init.ts'; // Assuming context type is exported here
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const userRouter = router({
  // 1. Registration: /auth/register
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: input.name,
          },
        },
      });

      if (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        });
      }

      return { success: true, user: data.user, session: data.session };
    }),

  // 2. Login: /auth/login
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: error.message,
        });
      }

      return { success: true, session: data.session };
    }),

  // 3. Logout: /auth/logout
  logout: publicProcedure.mutation(async ({ ctx }) => {
    const { error } = await ctx.supabase.auth.signOut();

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      });
    }

    return { success: true };
  }),

  // 4. Token (Refresh): /auth/token
  token: publicProcedure
    .input(z.object({ refreshToken: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase.auth.refreshSession({
        refresh_token: input.refreshToken,
      });

      if (error) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired refresh token',
        });
      }

      return { session: data.session };
    }),

  // 5. User (Get Current): /auth/user
  // Note: This relies on the session/token being passed in the headers 
  // and forwarded to the Supabase client in the Context.
  user: publicProcedure.query(async ({ ctx }) => {
    const {
      data: { user },
      error,
    } = await ctx.supabase.auth.getUser();

    if (error || !user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'No active session found',
      });
    }

    return { user };
  }),

  // 6. Password Reset: /auth/password/reset
  // We use a nested router to create the path /password/reset
  password: router({
    reset: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input, ctx }) => {
        const { error } = await ctx.supabase.auth.resetPasswordForEmail(
          input.email,
          {
            // You typically need a frontend URL here for the redirect
            redirectTo: 'https://your-app.com/update-password',
          }
        );

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
          });
        }

        return { success: true, message: 'Password reset email sent' };
      }),
  }),
});