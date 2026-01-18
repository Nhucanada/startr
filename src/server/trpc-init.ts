import { initTRPC, TRPCError } from '@trpc/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Context creation - extracts auth token from request headers
export const createContext = async (opts: { req: Request } | { req: { headers: { authorization?: string } } }) => {
    // Handle both Fetch API Request and Express-like request objects
    let authHeader: string | null = null

    if ('headers' in opts.req) {
        if (opts.req.headers instanceof Headers) {
            // Fetch API Request
            authHeader = opts.req.headers.get('authorization')
        } else if (typeof opts.req.headers === 'object') {
            // Express-like request
            authHeader = opts.req.headers.authorization ?? null
        }
    }

    // Create a base supabase client (unauthenticated)
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    return {
        authHeader,
        supabase,
    }
}

export type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

// Protected procedure - validates JWT and adds user to context with authenticated Supabase client
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    const { authHeader, supabase } = ctx
    console.log('[Auth] Checking authorization header:', authHeader ? 'present' : 'missing')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('[Auth] Missing or invalid authorization header')
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Missing or invalid authorization header',
        })
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    console.log('[Auth] Token validation result:', error ? `error: ${error.message}` : 'success', user ? `userId: ${user.id}` : 'no user')

    if (error || !user) {
        console.error('[Auth] Token validation failed:', error?.message || 'no user returned')
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired token',
        })
    }

    // Create an authenticated Supabase client with the user's JWT
    const authenticatedSupabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
        accessToken: async () => token,
    })

    // Admin client bypasses RLS - use only after verifying ownership in code
    const adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    })

    console.log('[Auth] Created authenticated client for user:', user.id)

    return next({
        ctx: {
            ...ctx,
            user,
            supabase: authenticatedSupabase,
            adminSupabase,
        },
    })
})