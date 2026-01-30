import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Environment configs for auth callback
const ENV_CONFIGS = {
  dev: {
    url: process.env.NEXT_PUBLIC_DEV_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_DEV_SUPABASE_ANON_KEY!,
  },
  prod: {
    url: process.env.NEXT_PUBLIC_PROD_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_PROD_SUPABASE_ANON_KEY!,
  },
} as const;

/**
 * Auth callback handler for magic link code exchange flow.
 *
 * Supabase sends a `code` query param when using PKCE flow (which is the
 * default for magic links with a redirect_to). We exchange it server-side
 * for tokens, then redirect to the client-side root page with the tokens
 * in the hash fragment. The root page stores them in the correct
 * environment-specific localStorage key (`kalam-auth-{env}`).
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const env = requestUrl.searchParams.get('env') as 'dev' | 'prod' | null;

  if (code) {
    const config = env && ENV_CONFIGS[env]
      ? ENV_CONFIGS[env]
      : {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        };

    // Exchange the code for tokens server-side (no persistence needed here)
    const supabase = createSupabaseClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        flowType: 'pkce',
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // Redirect to root page with tokens in hash fragment.
      // The client-side root page will pick these up and store
      // them in localStorage under `kalam-auth-{env}`.
      const params = new URLSearchParams({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        token_type: 'bearer',
        type: 'magiclink',
      });

      const envQuery = env ? `?env=${env}` : '';
      const redirectUrl = new URL(
        `/${envQuery}#${params.toString()}`,
        requestUrl.origin
      );

      return NextResponse.redirect(redirectUrl);
    }
  }

  // Fallback: no code or exchange failed - go to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
