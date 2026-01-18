import { router, publicProcedure } from './trpc-init.ts'; // Assuming context type is exported here
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import { createClient } from '@supabase/supabase-js';

// Create backend-specific Supabase client with secret key
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error('Missing backend Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Helper to handle the upload logic cleanly
async function uploadToSupabase(buffer: Buffer, bucketName: string) {
    const fileName = `private/panic-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

    const { error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, buffer, {
            contentType: 'image/jpeg',
            upsert: false
        });

    if (error) {
        console.error("Supabase Upload Error:", error);
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to upload image to storage: ${error.message}`
        });
    }

    // Get the public URL to return to the client
    const { data: publicData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

    return publicData.publicUrl;
}

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
      .mutation(async ({ input }) => {
          const { data, error } = await supabase.auth.signUp({
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
        email: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
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
  logout: publicProcedure.mutation(async () => {
    const { error } = await supabase.auth.signOut();

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
    .mutation(async ({ input }) => {
      const { data, error } = await supabase.auth.refreshSession({
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
  user: publicProcedure.query(async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

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
      .mutation(async ({ input }) => {
        const { error } = await supabase.auth.resetPasswordForEmail(
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

  // 7. Upload Image: /upload/image
  uploadImage: publicProcedure
    .input(z.object({
      image: z.string(), // Base64 image data
      bucketName: z.string().default('panic_images')
    }))
    .mutation(async ({ input }) => {
      try {
        // Convert base64 to buffer
        const base64Data = input.image.replace(/^data:image\/[a-z]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Upload to Supabase
        const publicUrl = await uploadToSupabase(buffer, input.bucketName);

        return {
          success: true,
          url: publicUrl,
          message: 'Image uploaded successfully'
        };
      } catch (error) {
        console.error('Upload endpoint error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }),
});