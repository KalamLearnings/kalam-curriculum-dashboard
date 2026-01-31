'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { type Environment } from '@/lib/stores/environmentStore';
import { getClientForEnv } from '@/lib/supabase/client';

/**
 * Read the persisted environment directly from localStorage.
 * This avoids the Zustand hydration race - the persist middleware
 * hydrates asynchronously, so useEnvironmentStore().environment may
 * still be the default 'dev' on the first render even if the user
 * had selected 'prod' before sending the magic link.
 */
function getPersistedEnvironment(): Environment {
  try {
    const raw = localStorage.getItem('kalam-environment');
    if (raw) {
      const parsed = JSON.parse(raw);
      const env = parsed?.state?.environment;
      if (env === 'dev' || env === 'prod') return env;
    }
  } catch {
    // ignore parse errors
  }
  return 'dev';
}

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

  useEffect(() => {
    const hash = window.location.hash;

    if (hash && hash.includes('access_token')) {
      // Parse tokens from hash fragment
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        // Determine which environment this login is for
        // Check URL params first, then localStorage (sync, no hydration race)
        const urlParams = new URLSearchParams(window.location.search);
        const envParam = urlParams.get('env') as Environment | null;
        const targetEnv = envParam || getPersistedEnvironment();

        // Persist the env selection if it came from URL
        if (envParam) {
          try {
            const raw = localStorage.getItem('kalam-environment');
            const parsed = raw ? JSON.parse(raw) : { state: {}, version: 0 };
            parsed.state.environment = envParam;
            localStorage.setItem('kalam-environment', JSON.stringify(parsed));
          } catch {
            // ignore
          }
        }

        // Use the singleton client so the session is set in its in-memory
        // cache, not just in localStorage. This prevents the race where the
        // singleton is created before the session is loaded from storage.
        const supabase = getClientForEnv(targetEnv);

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
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600">Signing in...</div>
    </div>
  );
}
