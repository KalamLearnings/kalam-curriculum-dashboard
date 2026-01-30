import { createBrowserClient } from '@supabase/ssr';
import { getEnvironmentConfig } from '@/lib/stores/environmentStore';

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
 */
export function createEnvironmentClient() {
  const config = getEnvironmentConfig();
  return createBrowserClient(config.url, config.anonKey);
}
