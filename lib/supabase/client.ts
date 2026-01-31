import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { getPersistedEnvironment, getConfigForEnvironment, type Environment } from '@/lib/stores/environmentStore';

/**
 * Cached Supabase client instances per environment.
 * Reusing the same client avoids "Multiple GoTrueClient instances" warnings
 * and ensures the client has time to initialize auth state from localStorage.
 */
const clients: Partial<Record<Environment, SupabaseClient>> = {};

export function getClientForEnv(env: Environment): SupabaseClient {
  if (!clients[env]) {
    const config = getConfigForEnvironment(env);
    clients[env] = createSupabaseClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: `kalam-auth-${env}`,
      },
    });
  }
  return clients[env]!;
}

/**
 * Get the Supabase client for the currently selected environment.
 * Reads environment from localStorage synchronously to avoid Zustand hydration race.
 */
export function createEnvironmentClient(): SupabaseClient {
  const env = getPersistedEnvironment();
  return getClientForEnv(env);
}

/**
 * Alias for createEnvironmentClient - maintains backward compatibility
 * with existing code that imports { createClient } from '@/lib/supabase/client'.
 */
export const createClient = createEnvironmentClient;

/**
 * Get the Supabase project base URL for the current environment.
 * Use this instead of process.env.NEXT_PUBLIC_SUPABASE_URL in fetch() calls.
 */
export function getEnvironmentBaseUrl(): string {
  const env = getPersistedEnvironment();
  const config = getConfigForEnvironment(env);
  return config.url;
}

/**
 * Build auth headers for direct fetch() calls to Supabase edge functions.
 *
 * The relay verifies the Authorization Bearer token using the project's
 * HS256 JWT secret. Newer Supabase projects issue ES256 user tokens which
 * the relay can't verify. So we send the anon key (HS256) as the Bearer
 * and put the user's access token in x-user-token for the edge function.
 */
export function getEdgeFunctionAuthHeaders(accessToken: string): Record<string, string> {
  const env = getPersistedEnvironment();
  const config = getConfigForEnvironment(env);
  return {
    Authorization: `Bearer ${config.anonKey}`,
    apikey: config.anonKey,
    'x-user-token': accessToken,
  };
}
