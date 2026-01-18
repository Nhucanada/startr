/* global process */
import { createClient } from '@supabase/supabase-js'

// Support both backend (process.env) and frontend (import.meta.env) environments
const supabaseUrl =
    (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL)

const supabaseSecretKey =
    (typeof process !== 'undefined' && process.env?.SUPABASE_SECRET_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_SECRET_KEY)

if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseSecretKey)
