/* global process */
import { createClient } from '@supabase/supabase-js'

// Backend Supabase client - uses service role key for token validation
const supabaseUrl = process.env.SUPABASE_URL
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error('Missing Supabase environment variables (SUPABASE_URL, SUPABASE_SECRET_KEY)')
}

// Use service role key for server-side operations (token validation, admin access)
export const supabase = createClient(supabaseUrl, supabaseSecretKey)

