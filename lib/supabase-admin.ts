// lib/supabase-admin.ts
import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables');
}

if (!supabaseServiceKey) {
  // Provide a more helpful error message
  if (typeof window === 'undefined') {
    // Server-side
    console.error('SUPABASE_SERVICE_ROLE_KEY is not defined. Please check your .env.local file.');
  } else {
    // Client-side - show a user-friendly message
    console.error('Admin Supabase client is not configured. Some features may not work.');
  }
}

// Use service role key for admin operations (keep this secure, server-side only)
// Only create the client if we have the required keys
const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

export { supabaseAdmin };