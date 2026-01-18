import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from './trpc-init.ts';
// Import the singleton you defined
import { supabase } from '../lib/supabase.ts'; 

import { GeminiService } from '../lib/gemini.ts';

/**
 * Mock Service Layer (AI)
 * Returns dummy data so you can test the DB flow immediately.
 * Replace with actual fetch calls to Gemini/OpenAI when ready.
 */
const AIService = {
    generateHabitPlan: async (desc: string) => {
        // SIMULATION: Call Gemini
        const response = await GeminiService.getInstance().ai.models.generateContent({
            model: GeminiService.MODELS.GENERAL, // Uses 'gemini-3-flash-preview'
            contents: '',
        });
        return {
            title: desc,
            frequency: "daily",
            steps: ["Step 1: Do the thing", "Step 2: Check it off"],
            fun_fact: "AI generated this plan."
        };
    },
    generateHabitImage: async (habitContext: any) => {
        // SIMULATION: Call Image Gen API
        // Returning a placeholder image URL or Base64 string
        return "https://placehold.co/600x400/png"; 
    },
};

/**
 * Real Service Layer (Database)
 * Interacts directly with Supabase tables.
 */
const HabitService = {
    create: async (userId: string, planData: any, imageUrl: string) => { 
        const { data, error } = await supabase
            .from('habits')
            .insert({
                // id: uuid (automatically generated)
                // created_at: timestamp (now())
                user_id: userId,
                name: planData.title || 'New Habit',
                desc: planData,
                backdrop_url: imageUrl // Assuming column is text/varchar
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    deleteById: async (userId: string, habitId: string) => {
        const { data, error } = await supabase
            .from('habits')
            .delete()
            .eq('id', habitId)
            .eq('user_id', userId) // Security: Ensure user owns it
            .select();

        if (error) throw error;
        if (!data || data.length === 0) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Habit not found or unauthorized' });
        }
        return { success: true, deleted: data[0] };
    },

    deleteByDescription: async (userId: string, description: string) => { 
        // Hackathon logic: Delete the most recent one matching the description
        // 1. Find it
        const { data: found } = await supabase
            .from('habits')
            .select('id')
            .eq('user_id', userId)
            .ilike('desc', description)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!found) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'No habit found with that description' });
        }

        // 2. Delete it
        const { error } = await supabase
            .from('habits')
            .delete()
            .eq('id', found.id);

        if (error) throw error;
        return { success: true, id: found.id };
    },

    update: async (userId: string, habitId: string, updates: any) => { 
        const { data, error } = await supabase
            .from('habits')
            .update(updates)
            .eq('id', habitId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    findClosestMatch: async (userId: string, name: string) => { 
        // Simple fuzzy search using ILIKE
        // For production, swap this with .textSearch() or pgvector
        const { data, error } = await supabase
            .from('habits')
            .select('*') // Exclude image_url if heavy?
            .eq('user_id', userId)
            .ilike('name', `%${name}%`)
            .limit(1)
            .single();

        // Don't throw error on null, just return null (handled in router)
        if (error && error.code !== 'PGRST116') throw error; 
        return data;
    },

    findAllByUser: async (userId: string) => { 
        // PERF: Explicitly selecting columns to EXCLUDE the potentially heavy 'image_url'
        const { data, error } = await supabase
            .from('habits')
            .select('id, user_id, description, status, plan, created_at') 
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    getBackdrop: async (userId: string, habitId: string) => { 
        // Only fetch the image column
        const { data, error } = await supabase
            .from('habits')
            .select('backdrop_url')
            .eq('id', habitId)
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data; // Returns { image_url: "..." }
    },

    getPanicPhoto: async (userId: string, habitId: string) => { 
        // Only fetch the image column
        const { data, error } = await supabase
            .from('habits')
            .select('backdrop_url')
            .eq('id', habitId)
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data; // Returns { image_url: "..." }
    },
};

// --- Router Definition ---

export const habitsRouter = router({
    // 1. Create: /habits/create/
    createHabit: protectedProcedure
        .input(z.object({
            description: z.string().min(1, "Description is required"),
            style: z.string().optional().default("minimalist"),
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                const userId = ctx.user.id;

                // Step 1 (Mocked AI): Generate Plan
                const habitPlan = await AIService.generateHabitPlan(input.description);

                // Step 2 (Mocked AI): Generate Image
                const generatedImage = await AIService.generateHabitImage({
                    plan: habitPlan,
                    style: input.style
                });

                // Step 3: Persist to Supabase
                const newHabit = await HabitService.create(userId, habitPlan, generatedImage);

                return newHabit;
            } catch (error: any) {
                console.error("Create Habit Error:", error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create habit generation sequence.',
                    cause: error,
                });
            }
        }),

    // 2. Delete: /habits/delete/
    deleteHabit: protectedProcedure
        .input(z.object({
            uuid: z.string().uuid().optional(),
            description: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { uuid, description } = input;
            const userId = ctx.user.id;

            try {
                if (uuid) {
                    return await HabitService.deleteById(userId, uuid);
                } 
                if (description) {
                    return await HabitService.deleteByDescription(userId, description);
                }
            } catch (e) {
                // Pass through TRPC errors, wrap generic ones
                if (e instanceof TRPCError) throw e;
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB Error during deletion', cause: e });
            }

            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Either a valid UUID or a Description is required.',
            });
        }),

    // 3. Update: /habits/update/
    updateHabit: protectedProcedure
        .input(z.object({
            uuid: z.string().uuid(),
            data: z.object({
                description: z.string().optional(),
                status: z.enum(['active', 'completed', 'archived']).optional(),
            }),
        }))
        .mutation(async ({ ctx, input }) => {
            return await HabitService.update(ctx.user.id, input.uuid, input.data);
        }),

    // 4. Get User Habit (Text Match): /user/get/ 
    getHabitByDescription: protectedProcedure
        .input(z.object({
            description: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const match = await HabitService.findClosestMatch(ctx.user.id, input.description);
            
            if (!match) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'No similar habit found.' });
            }
            return match;
        }),

    // 5. Get User Habits (List): /user/get
    getUserHabits: protectedProcedure
        .query(async ({ ctx }) => {
            return await HabitService.findAllByUser(ctx.user.id);
        }),

    // 6. Photos: /photos/get/
    getHabitPhoto: protectedProcedure
        .input(z.object({
            habitId: z.string().uuid(),
        }))
        .query(async ({ ctx, input }) => {
            const photoData = await HabitService.getPhoto(ctx.user.id, input.habitId);
            
            if (!photoData || !photoData.image_url) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Photo not found for this habit.' });
            }
            return photoData;
        }),
});