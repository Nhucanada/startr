import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
    (typeof process !== 'undefined' && process.env?.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : '')

const supabaseAnonKey =
    (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.trim() : '')

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables: SUPABASE_URL, SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)