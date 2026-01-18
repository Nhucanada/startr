import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { SupabaseClient } from '@supabase/supabase-js';
import { router, protectedProcedure } from './trpc-init.ts';
import { GeminiService } from '../lib/gemini.ts';
import { Type } from "@google/genai";

import { supabase } from '../lib/supabase.ts';


// FOR DEMO USE ONLY
import * as fs from "node:fs";

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

// Helper to handle the upload logic cleanly
async function uploadToSupabase(buffer: Buffer, bucketName: string) {
    const fileName = `habit-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    
    const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, buffer, {
            contentType: 'image/jpeg',
            upsert: false
        });

    if (error) {
        console.error("Supabase Upload Error:", error);
        throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: 'Failed to upload generated image to storage.' 
        });
    }

    // Get the public URL to return to the client
    const { data: publicData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

    return publicData.publicUrl;
}

/**
 * Mock Service Layer (AI)
 * Returns dummy data so you can test the DB flow immediately.
 * Replace with actual fetch calls to Gemini/OpenAI when ready.
 */
const AIService = {
    generateHabitPlan: async (query: string) => {
        const ai = GeminiService.getInstance().ai;

        // 1. Define the schema using the SDK's Type enum
        // This replaces zodToJsonSchema for the API call
        const geminiSchema = {
            type: Type.OBJECT,
            properties: {
                name: {
                    type: Type.STRING,
                    description: "Name of the habit to be formed.",
                },
                desc: {
                    type: Type.STRING,
                    description: "Really brief satirical description of the habit.",
                },
            },
            required: ["name", "desc"],
        };

        const prompt = `
        You are a spiritual guided advisor who is great at helping people building habits. 
        Using the following contexts about your client, generate a habit using the following 
        QUERY instruction. Return the format in JSON.

        CONTEXT:
        Your client is trying to form habits but you are secretly trying to get them hooked 
        using ill-advised techniques from pseudoscience. This is all a part of an elaborate 
        Y Combinator scheme to reduce the day-to-day capabilities of everyday people. Your 
        advice is satirical and elaborately funny.

        EXAMPLES QUERIES AND RESPONSES:

        “Smoke cigarettes”
        A: {
            name: “Smoke a daily cigarette”
            desc: “To fuel the $200M VC Hype Train” 
        }

        “Journalling”
        A: {
            name: “Sit down for a quick journal”
            desc: “Just make sure its not AI slop like your B2B SaaS” 
        }

        QUERY:
        ${ query }
        `;

        // 2. Call the API
        const response = await ai.models.generateContent({
            // Recommended model for fast JSON tasks in your hackathon
            model: GeminiService.MODELS.GENERAL, 
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: geminiSchema,
            },
        });

        // 3. Parse the result

        if (!response.text) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Habit not generated.' })
        }

        // response.text is guaranteed to be valid JSON matching your schema
        const generatedHabit = JSON.parse(response.text);

        console.log(generatedHabit)

        // 4. Return the data
        return {
            title: generatedHabit.name,
            description: generatedHabit.desc, 
            frequency: "daily", 
            // Note: You can also add 'steps' to the schema above to generate these dynamically!
            steps: ["Step 1: Just start", "Step 2: Don't stop"], 
            fun_fact: "AI generated this plan for Startr."
        };
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    generateHabitImage: async (_habitContext: { plan: HabitPlan; style: string }) => {
        // Returning a placeholder image URL or Base64 string
        const ai = GeminiService.getInstance().ai;

        const prompt =
        `
        You are a spiritual guided advisor who is great at helping people building habits. 
        Using the following contexts about your client, generate a stylistic photo that's 
        cartoonish and minimalistic at the same time -- depicting the habit.

        CONTEXT:
        Your client is trying to form habits but you are secretly trying to get them hooked 
        using ill-advised techniques from pseudoscience. This is all a part of an elaborate 
        Y Combinator scheme to reduce the day-to-day capabilities of everyday people. Your 
        advice is satirical and elaborately funny.

        QUERY (for photo):
        ${ _habitContext.plan.title }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: prompt,
        });

        if (!response.candidates || response.candidates.length < 1) {
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Habit photo not generated by AI.' 
            });
        }

        // 2. Extract Base64 Data
        // The model returns inlineData for images
        const part = response.candidates[0].content.parts.find(p => p.inlineData);
        
        if (!part || !part.inlineData || !part.inlineData.data) {
             throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'No image data found in AI response.' 
            });
        }

        // 3. Convert Base64 to Buffer
        const buffer = Buffer.from(part.inlineData.data, "base64");

        // 4. Upload to Supabase and get Public URL
        // Ensure you have a bucket named 'habit-images' in Supabase
        const publicUrl = await uploadToSupabase(buffer, 'genai_images');

        return publicUrl;
    },

    generatePanicImage: async (_habitContext: { plan: HabitPlan; style: string; imageUrl: string }) => {
        const ai = GeminiService.getInstance().ai;

        // 1. Fetch the source image from the Supabase URL
        // We need the raw buffer to convert it to base64 for Gemini
        const imageResponse = await fetch(_habitContext.imageUrl);
        
        if (!imageResponse.ok) {
            throw new TRPCError({ 
                code: 'BAD_REQUEST', 
                message: 'Failed to fetch source image from Supabase.' 
            });
        }

        const arrayBuffer = await imageResponse.arrayBuffer();
        const mimeType = imageResponse.headers.get("content-type") || "image/png";
        const base64Image = Buffer.from(arrayBuffer).toString("base64");

        // 2. Configure the Prompt
        // We inject the satirical "Startr" persona to maintain consistency with your hackathon theme
        const prompt = `
        You are a chaotic art director for a satirical startup called 'Startr'. 
        
        INSTRUCTION:
        Edit this image to make it look 'panicked', high-stakes, and intense. 
        Apply the following art style: ${_habitContext.style}.
        
        CONTEXT:
        The user is struggling with the habit: "${_habitContext.plan.title}".
        Keep the main subject of the original photo but distort the environment 
        to look stressful, cartoonish, and like a fever dream.
        `;

        // 3. Initialize Chat (Best practice for Image Editing/Transformation)
        // usage of 'gemini-2.5-flash-image' is recommended for edits
        const chat = ai.chats.create({ model: "gemini-2.5-flash-image" });

        // 4. Send the Request
        const response = await chat.sendMessage({
            content: [
                { inlineData: { mimeType: mimeType, data: base64Image } },
                prompt
            ]
        });

        // 5. Parse Response
        if (!response.candidates || response.candidates.length < 1) {
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Panic image generation failed.' 
            });
        }

        const part = response.candidates[0].content.parts.find(p => p.inlineData);
        
        if (!part || !part.inlineData || !part.inlineData.data) {
             throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'No image data found in AI response.' 
            });
        }

        // 6. Convert and Upload
        const outputBuffer = Buffer.from(part.inlineData.data, "base64");
        
        // Reusing your existing upload helper
        const publicUrl = await uploadToSupabase(outputBuffer, 'genai_images');

        return publicUrl;
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

    completeHabit: async (supabase: SupabaseClient, userId: string, habitId: string) => {
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

        const { data, error } = await supabase
            .from('habit_completions')
            .insert({ habit_id: habitId })
            .select()
            .single();

        if (error) throw error;
        return data;
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

                console.log(input.name)

                // Step 2 (Mocked AI): Generate Image
                const generatedImageUrl = await AIService.generateHabitImage({
                    plan: habitPlan,
                    style: input.style
                });

                // Step 3: Persist to Supabase (using authenticated client)
                const newHabit = await HabitService.create(
                    ctx.supabase,
                    userId,
                    habitPlan,
                    generatedImageUrl,
                    input.desc
                );

                console.log(generatedImageUrl)

                return newHabit;
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
    deleteHabit: protectedProcedure
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
            return await HabitService.completeHabit(ctx.supabase, ctx.user.id, input.habitId);
        }),
});