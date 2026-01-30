import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getEnvironmentConfig, getCurrentEnvironment } from '@/lib/stores/environmentStore';

/**
 * Auth client - always uses the default Supabase project (for login/session)
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Data client - uses the currently selected environment (dev/prod)
 * Uses @supabase/supabase-js directly with a per-environment storage key
 * so dev and prod sessions don't collide.
 */
export function createEnvironmentClient() {
  const config = getEnvironmentConfig();
  const env = getCurrentEnvironment();

  return createSupabaseClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: `kalam-auth-${env}`,
    },
  });
}
