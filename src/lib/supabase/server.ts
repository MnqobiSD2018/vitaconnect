import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getSupabaseConfig } from './config';

// Cookie-based server client for use in Server Components / Route Handlers
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — can be ignored with middleware refreshing sessions.
          }
        },
      },
    }
  );
}

// Backward-compatible default export for existing API routes (privileged, no cookies)
let _serverClient: ReturnType<typeof createSupabaseClient> | null = null;

export default function getServerClient() {
  if (_serverClient) return _serverClient;
  const { url, anonKey, serviceRoleKey } = getSupabaseConfig();
  const key = serviceRoleKey || anonKey;
  _serverClient = createSupabaseClient(url, key, {
    auth: { persistSession: false },
  });
  return _serverClient;
}
