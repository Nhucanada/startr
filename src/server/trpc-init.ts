import { initTRPC, TRPCError } from '@trpc/server'
import { supabase } from '../lib/supabase.ts'

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

    return {
        authHeader,
        supabase,
    }
}

export type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

// Protected procedure - validates JWT and adds user to context
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    const { authHeader } = ctx

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Missing or invalid authorization header',
        })
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired token',
        })
    }

    return next({
        ctx: {
            ...ctx,
            user,
        },
    })
})