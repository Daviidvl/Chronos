import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Singleton — one connection reused across the app
const supabase = createSupabaseClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
)

export function createClient() {
  return supabase
}
