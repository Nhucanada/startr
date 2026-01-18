import { GoogleGenAI } from '@google/genai';

/**
 * Singleton service wrapper for the Google Gen AI SDK.
 * Follows 2025 guidelines using the @google/genai package.
 */
class GeminiService {
  private static instance: GeminiService;
  public readonly ai: GoogleGenAI;

  /**
   * Recommended models configuration based on 2025 guidelines.
   * Use these constants in your tRPC routers to ensure model consistency.
   */
  public static readonly MODELS = {
    // General Text & Multimodal Tasks
    GENERAL: 'gemini-3-flash-preview',
    // Coding and Complex Reasoning
    REASONING: 'gemini-3-pro-preview',
    // Low Latency & High Volume
    FAST: 'gemini-2.5-flash-lite',
    // Fast Image Generation
    IMAGE_FAST: 'gemini-2.5-flash-image',
    // High-Quality Image Generation
    IMAGE_HQ: 'gemini-3-pro-image-preview',
  } as const;

  private constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn(
        'Warning: GEMINI_API_KEY is not set in environment variables. Gemini calls will fail.'
      );
    }

    // Initialize the unified client
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Returns the singleton instance of the GeminiService.
   */
  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

}

// Export the singleton instance for direct use in tRPC routers
export const gemini = GeminiService.getInstance();

// Export the class and models for typing and configuration references
export { GeminiService };