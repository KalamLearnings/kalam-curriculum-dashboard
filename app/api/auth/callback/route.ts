import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Environment configs for server-side auth callback
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

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const env = requestUrl.searchParams.get('env') as 'dev' | 'prod' | null;

  if (code) {
    const cookieStore = cookies();

    // Use environment-specific config if provided, otherwise default
    const config = env && ENV_CONFIGS[env]
      ? ENV_CONFIGS[env]
      : {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        };

    const supabase = createServerClient(
      config.url,
      config.anonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect back to dashboard, passing env so the layout can switch
  const redirectUrl = env
    ? new URL(`/curricula?env=${env}`, requestUrl.origin)
    : new URL('/curricula', requestUrl.origin);

  return NextResponse.redirect(redirectUrl);
}
