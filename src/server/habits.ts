import { TRPCError } from '@trpc/server';
import { z } from 'zod';
// Assuming these are defined in your trpc.ts setup
import { router, publicProcedure, protectedProcedure } from './trpc-init.ts';

/**
 * Mock Service Layer
 * In a real application, these would be imported from your /services directory
 * and would handle the actual DB interactions and External API calls (Gemini/OpenAI).
 */
const AIService = {
    generateHabitPlan: async (desc: string) => { /* Call Gemini/RAG here */
        
    },
    generateHabitImage: async (habitContext: any) => { /* Call Image Gen API here */

    },
};

const HabitService = {
    create: async (userId: string, data: any, imageUrl: string) => { 
        
    },
    deleteById: async (userId: string, habitId: string) => { /* DB Delete by ID */ },
    deleteByDescription: async (userId: string, description: string) => { /* DB Search & Delete */ },
    update: async (userId: string, habitId: string, data: any) => { /* DB Update */ },
    findClosestMatch: async (userId: string, description: string) => { /* Vector/Fuzzy Search */ },
    findAllByUser: async (userId: string) => { /* DB Select All (exclude photos) */ },
    getPhoto: async (userId: string, habitId: string) => { /* DB Select Photo only */ },
};

// --- Router Definition ---

export const habitsRouter = router({
    // 1. Create: /habits/create/
    // Uses Gemini + RAG + Image Generation
    createHabit: protectedProcedure
        .input(z.object({
        description: z.string().min(1, "Description is required"),
        style: z.string().optional().default("minimalist"), // Style for the photo
        }))
        .mutation(async ({ ctx, input }) => {
        try {
            const userId = ctx.user.id;

            // Step 1: Optional RAG Clustering/Pre-fetch (Concept)
            // const context = await RAGService.getContext(input.description);

            // Step 2: Generate Habit Plan via Gemini (Fixed JSON Schema)
            const habitPlan = await AIService.generateHabitPlan(input.description);

            // Step 3: Generate Arbitrary Photo
            const generatedImage = await AIService.generateHabitImage({
            plan: habitPlan,
            style: input.style
            });

            // Step 4: Persist to DB
            const newHabit = await HabitService.create(userId, habitPlan, generatedImage);

            return newHabit;
        } catch (error) {
            throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create habit generation sequence.',
            cause: error,
            });
        }
        }),

    // 2. Delete: /habits/delete/
    // Logic: Try UUID first, then Description + UserID, else Fail.
    deleteHabit: protectedProcedure
        .input(z.object({
            uuid: z.string().uuid().optional(),
            description: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
        const { uuid, description } = input;
        const userId = ctx.user.id;

        if (uuid) {
            return await HabitService.deleteById(userId, uuid);
        } 
        
        if (description) {
            // Fallback: Search by description for this user
            return await HabitService.deleteByDescription(userId, description);
        }

        // Finally fails otherwise
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Either a valid UUID or a Description is required to delete a habit.',
        });
        }),

    // 3. Update: /habits/update/
    updateHabit: protectedProcedure
        .input(z.object({
        uuid: z.string().uuid(),
        data: z.object({
            description: z.string().optional(),
            status: z.enum(['active', 'completed', 'archived']).optional(),
            // Add other updateable fields here
        }),
        }))
        .mutation(async ({ ctx, input }) => {
        return await HabitService.update(ctx.user.id, input.uuid, input.data);
        }),

    // 4. Get User Habit (Text Match): /user/get/ (POST semantics)
    // "Inputs the current user’s token... returns habit with closest text description"
    getHabitByDescription: protectedProcedure
        .input(z.object({
        description: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
        // Note: Using mutation here because the prompt requested "POST", 
        // which implies potential heavy search/calculation logic rather than a simple cached read.
        const match = await HabitService.findClosestMatch(ctx.user.id, input.description);
        
        if (!match) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'No similar habit found.' });
        }
        return match;
        }),

    // 5. Get User Habits (List): /user/get
    // "Returns a list of all habits... (not including photos)"
    getUserHabits: protectedProcedure
        .query(async ({ ctx }) => {
        // Service layer should select fields *excluding* the base64/url photo blob
        return await HabitService.findAllByUser(ctx.user.id);
        }),

    // 6. Photos: /photos/get/
    // "Obtains the associated photo"
    getHabitPhoto: protectedProcedure
        .input(z.object({
        habitId: z.string().uuid(),
        }))
        .query(async ({ ctx, input }) => {
        const photoData = await HabitService.getPhoto(ctx.user.id, input.habitId);
        
        if (!photoData) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Photo not found for this habit.' });
        }
        return photoData;
        }),
});