/* global process */
import { createClient } from '@supabase/supabase-js'

// Support both backend (process.env) and frontend (import.meta.env) environments
const supabaseUrl =
    (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL)

const supabaseAnonKey =
    (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY)

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
