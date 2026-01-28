import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

// Service role client that bypasses RLS - use with caution!
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}