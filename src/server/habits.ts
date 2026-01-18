import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { SupabaseClient } from '@supabase/supabase-js';
import { router, protectedProcedure } from './trpc-init.ts';

// Type definitions
interface HabitPlan {
    title: string;
    frequency: string;
    steps: string[];
    fun_fact: string;
}

interface HabitUpdates {
    name?: string;
    desc?: string;
    backdrop_url?: string;
    panic_image_id?: string;
}

/**
 * Mock Service Layer (AI)
 * Returns dummy data so you can test the DB flow immediately.
 * Replace with actual fetch calls to Gemini/OpenAI when ready.
 */
const AIService = {
    generateHabitPlan: async (name: string) => {
        // SIMULATION: Returns mock data for testing
        // TODO: Replace with actual Gemini API call when ready
        return {
            title: name,
            frequency: "daily",
            steps: ["Step 1: Do the thing", "Step 2: Check it off"],
            fun_fact: "AI generated this plan."
        };
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    generateHabitImage: async (_habitContext: { plan: HabitPlan; style: string }) => {
        // SIMULATION: Call Image Gen API
        // Returning a placeholder image URL or Base64 string
        return "https://placehold.co/600x400/png";
    },
};

/**
 * Real Service Layer (Database)
 * Interacts directly with Supabase tables.
 * All methods take a supabase client as the first parameter for RLS authentication.
 */
const HabitService = {
    create: async (supabase: SupabaseClient, userId: string, planData: HabitPlan, imageUrl: string, desc?: string) => {
        const { data, error } = await supabase
            .from('habits')
            .insert({
                // id: uuid (automatically generated)
                // created_at: timestamp (now())
                user_id: userId,
                name: planData.title || 'New Habit',
                desc: desc ?? null,
                backdrop_url: imageUrl
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    deleteById: async (supabase: SupabaseClient, userId: string, habitId: string) => {
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

    deleteByDescription: async (supabase: SupabaseClient, userId: string, name: string) => {
        // Hackathon logic: Delete the most recent one matching the name
        // 1. Find it
        const { data: found } = await supabase
            .from('habits')
            .select('id')
            .eq('user_id', userId)
            .ilike('name', name)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!found) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'No habit found with that name' });
        }

        // 2. Delete it
        const { error } = await supabase
            .from('habits')
            .delete()
            .eq('id', found.id);

        if (error) throw error;
        return { success: true, id: found.id };
    },

    update: async (supabase: SupabaseClient, userId: string, habitId: string, updates: HabitUpdates) => {
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

    findClosestMatch: async (supabase: SupabaseClient, userId: string, name: string) => {
        // Simple fuzzy search using ILIKE on habit names
        // For production, swap this with .textSearch() or pgvector
        const { data, error } = await supabase
            .from('habits')
            .select('*') // Exclude heavy fields if needed
            .eq('user_id', userId)
            .ilike('name', `%${name}%`)
            .limit(1)
            .single();

        // Don't throw error on null, just return null (handled in router)
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    findAllByUser: async (supabase: SupabaseClient, userId: string) => {
        console.log('[HabitService.findAllByUser] Querying for userId:', userId)
        // PERF: Explicitly selecting columns to EXCLUDE any heavy fields
        const { data, error } = await supabase
            .from('habits')
            .select('id, user_id, name, desc, backdrop_url, panic_image_id, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[HabitService.findAllByUser] Supabase error:', error)
            throw error;
        }
        console.log('[HabitService.findAllByUser] Query successful, found', data?.length ?? 0, 'habits')
        return data;
    },

    getBackdrop: async (supabase: SupabaseClient, userId: string, habitId: string) => {
        // Only fetch the image column
        const { data, error } = await supabase
            .from('habits')
            .select('backdrop_url')
            .eq('id', habitId)
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data; // Returns { backdrop_url: "..." }
    },

    getPanicPhoto: async (supabase: SupabaseClient, userId: string, habitId: string) => {
        // Panic image is stored on the habit as a foreign key
        const { data, error } = await supabase
            .from('habits')
            .select('panic_image_id')
            .eq('id', habitId)
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data; // Returns { backdrop_url: "..." }
    },

    completeHabit: async (supabase: SupabaseClient, adminSupabase: SupabaseClient, userId: string, habitId: string) => {
        // Ensure the habit belongs to the user before inserting completion
        const { data: habit, error: habitError } = await supabase
            .from('habits')
            .select('id')
            .eq('id', habitId)
            .eq('user_id', userId)
            .single();

        if (habitError || !habit) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Habit not found or unauthorized' });
        }

        // Use admin client for insert (bypasses RLS after ownership verified above)
        const { data, error } = await adminSupabase
            .from('habit_completions')
            .insert({ habit_id: habitId })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    uncompleteHabit: async (supabase: SupabaseClient, adminSupabase: SupabaseClient, userId: string, habitId: string) => {
        // Ensure the habit belongs to the user
        const { data: habit, error: habitError } = await supabase
            .from('habits')
            .select('id')
            .eq('id', habitId)
            .eq('user_id', userId)
            .single();

        if (habitError || !habit) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Habit not found or unauthorized' });
        }

        // Delete the most recent completion for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { data, error } = await adminSupabase
            .from('habit_completions')
            .delete()
            .eq('habit_id', habitId)
            .gte('created_at', today.toISOString())
            .lt('created_at', tomorrow.toISOString())
            .select();

        if (error) throw error;
        return { success: true, deleted: data?.length ?? 0 };
    },
};

// --- Router Definition ---

export const habitsRouter = router({
    // 1. Create: /habits/create/
    createHabit: protectedProcedure
        .input(z.object({
            name: z.string().min(1, "Name is required"),
            desc: z.string().optional(),
            style: z.string().optional().default("minimalist"),
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                const userId = ctx.user.id;

                // Step 1 (Mocked AI): Generate Plan
                const habitPlan = await AIService.generateHabitPlan(input.name);

                // Step 2 (Mocked AI): Generate Image
                const generatedImage = await AIService.generateHabitImage({
                    plan: habitPlan,
                    style: input.style
                });

                // Step 3: Persist to Supabase (using authenticated client)
                const newHabit = await HabitService.create(
                    ctx.supabase,
                    userId,
                    habitPlan,
                    generatedImage,
                    input.desc
                );

                return {
                    habit: newHabit,
                    plan: habitPlan,
                };
            } catch (error) {
                console.error("Create Habit Error:", error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create habit generation sequence.',
                    cause: error,
                });
            }
        }),

    // 2. Delete: /habits/delete/
    uncompleteHabit: protectedProcedure
        .input(z.object({
            uuid: z.string().uuid().optional(),
            name: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { uuid, name } = input;
            const userId = ctx.user.id;

            try {
                if (uuid) {
                    return await HabitService.deleteById(ctx.supabase, userId, uuid);
                }
                if (name) {
                    return await HabitService.deleteByDescription(ctx.supabase, userId, name);
                }
            } catch (e) {
                // Pass through TRPC errors, wrap generic ones
                if (e instanceof TRPCError) throw e;
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB Error during deletion', cause: e });
            }

            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Either a valid UUID or a Name is required.',
            });
        }),

    // 3. Update: /habits/update/
    updateHabit: protectedProcedure
        .input(z.object({
            uuid: z.string().uuid(),
            data: z.object({
                name: z.string().optional(),
                desc: z.string().optional(),
                backdrop_url: z.string().optional(),
                panic_image_id: z.string().uuid().optional(),
            }),
        }))
        .mutation(async ({ ctx, input }) => {
            return await HabitService.update(ctx.supabase, ctx.user.id, input.uuid, input.data);
        }),

    // 4. Get User Habit (Text Match): /user/get/
    getHabitByDescription: protectedProcedure
        .input(z.object({
            name: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const match = await HabitService.findClosestMatch(ctx.supabase, ctx.user.id, input.name);

            if (!match) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'No similar habit found.' });
            }
            return match;
        }),

    // 5. Get User Habits (List): /user/get
    getUserHabits: protectedProcedure
        .query(async ({ ctx }) => {
            console.log('[getUserHabits] Fetching habits for user:', ctx.user.id)
            const result = await HabitService.findAllByUser(ctx.supabase, ctx.user.id);
            console.log('[getUserHabits] Found', result?.length ?? 0, 'habits')
            return result;
        }),

    // 6. Photos: /photos/get/
    getHabitPhoto: protectedProcedure
        .input(z.object({
            habitId: z.string().uuid(),
        }))
        .query(async ({ ctx, input }) => {
            const photoData = await HabitService.getBackdrop(ctx.supabase, ctx.user.id, input.habitId);

            if (!photoData || !photoData.backdrop_url) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Photo not found for this habit.' });
            }
            return photoData;
        }),

    // 7. Complete: /habits/complete/
    completeHabit: protectedProcedure
        .input(z.object({
            habitId: z.string().uuid(),
        }))
        .mutation(async ({ ctx, input }) => {
            return await HabitService.completeHabit(ctx.supabase, ctx.adminSupabase, ctx.user.id, input.habitId);
        }),

    // 8. Uncomplete: /habits/uncomplete/
    uncompleteHabit: protectedProcedure
        .input(z.object({
            habitId: z.string().uuid(),
        }))
        .mutation(async ({ ctx, input }) => {
            return await HabitService.uncompleteHabit(ctx.supabase, ctx.adminSupabase, ctx.user.id, input.habitId);
        }),
});