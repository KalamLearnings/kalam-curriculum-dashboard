'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { useEnvironmentStore, getConfigForEnvironment } from '@/lib/stores/environmentStore';

/**
 * Root page - handles magic link auth callback (hash fragment flow)
 * and redirects to the dashboard.
 *
 * Magic links redirect here with #access_token=...&refresh_token=...
 * We extract the tokens and establish the session in the correct
 * environment-specific localStorage key.
 */
export default function RootPage() {
  const router = useRouter();
  const { environment, setEnvironment } = useEnvironmentStore();

  useEffect(() => {
    const hash = window.location.hash;

    if (hash && hash.includes('access_token')) {
      // Parse tokens from hash fragment
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        // Determine which environment this login is for
        // Check URL params first (from redirect), fall back to store
        const urlParams = new URLSearchParams(window.location.search);
        const envParam = urlParams.get('env') as 'dev' | 'prod' | null;
        const targetEnv = envParam || environment;

        if (envParam) {
          setEnvironment(envParam);
        }

        const config = getConfigForEnvironment(targetEnv);
        const supabase = createSupabaseClient(config.url, config.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            storageKey: `kalam-auth-${targetEnv}`,
          },
        });

        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).then(() => {
          router.replace('/curricula');
        }).catch((err) => {
          console.error('Failed to set session:', err);
          router.replace('/login');
        });

        return;
      }
    }

    // No auth callback - redirect to dashboard
    router.replace('/curricula');
  }, [router, environment, setEnvironment]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600">Signing in...</div>
    </div>
  );
}
