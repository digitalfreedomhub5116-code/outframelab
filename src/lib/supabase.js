import { createClient } from '@supabase/supabase-js'

const defaultUrl = 'https://sooedjbqgrdjtwiobjpr.supabase.co'
const defaultAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb2VkamJxZ3JkanR3aW9ianByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NDU1NzksImV4cCI6MjEwNDMyMTU3OX0.dgKiyPzjtiTTFFVH8QhpWHI3QTXAOelwiBBBngboGiI'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultUrl
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultAnonKey

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-ref')
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null
